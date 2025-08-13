import { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { useAuth } from './useAuth'; // It needs to know about the user
import { supabase } from '@/integrations/supabase/client';

interface UserRoleContextType {
  role: string | null;
  isAdmin: boolean;
  isModerator: boolean;
  loading: boolean;
}

const UserRoleContext = createContext<UserRoleContextType | undefined>(undefined);

export const UserRoleProvider = ({ children }: { children: ReactNode }) => {
  const { user } = useAuth();
  const [role, setRole] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // --- THIS IS THE CRITICAL FIX ---
    // We check if the 'user' object exists AND is fully authenticated.
    // If the user is null (like during password recovery or logout), we
    // DO NOT try to fetch a role from the database.
    if (user && user.role === 'authenticated') {
      setLoading(true);
      supabase
        .from('user_roles')
        .select('role')
        .eq('user_id', user.id)
        .single()
        .then(({ data, error }) => {
          if (error && error.code !== 'PGRST116') {
            console.error('Error fetching user role:', error);
          }
          // Set the role from the database, or default to 'user' if none is found.
          setRole(data?.role || 'user');
          setLoading(false);
        });
    } else {
      // If there is no authenticated user, reset the role and stop loading.
      setRole(null);
      setLoading(false);
    }
  }, [user]); // This effect correctly depends on the 'user' object.

  const value = {
    role,
    // Add an extra check for your super admin email here for safety.
    isAdmin: role === 'admin' || user?.email === 'johnleomedina@gmail.com',
    isModerator: role === 'moderator',
    loading,
  };

  return (
    <UserRoleContext.Provider value={value}>
      {children}
    </UserRoleContext.Provider>
  );
};

export const useUserRole = () => {
  const context = useContext(UserRoleContext);
  if (context === undefined) {
    throw new Error('useUserRole must be used within a UserRoleProvider');
  }
  return context;
};
