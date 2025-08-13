import { useAuth } from "@/hooks/useAuth";
import { Navigate, Outlet } from "react-router-dom";
import { useToast } from "./ui/use-toast";
import { useEffect } from "react";

const ProtectedRoute = () => {
  const { user, loading } = useAuth();
  const { toast } = useToast();

  useEffect(() => {
    if (!loading && !user) {
      toast({
        title: "Authentication Required",
        description: "Please sign in to access that page.",
        variant: "destructive",
      });
    }
  }, [user, loading, toast]);

  if (loading) {
    // You can render a full-page loading spinner here if you want
    return <div className="flex h-screen w-full items-center justify-center">Loading...</div>;
  }

  // If there's a user, render the child route (e.g., the dashboard).
  // If not, redirect them to the home page.
  return user ? <Outlet /> : <Navigate to="/" replace />;
};

export default ProtectedRoute;
