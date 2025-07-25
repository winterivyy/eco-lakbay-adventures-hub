import { useState, useEffect } from "react"; // Import useEffect
import { Button } from "@/components/ui/button";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { useUserRole } from "@/hooks/useUserRole";
import SignInModal from "./SignInModal";
import JoinUsModal from "./JoinUsModal";
import { LogOut, User, Settings, Shield, MapPin } from "lucide-react"; // Import MapPin icon
import { supabase } from "@/integrations/supabase/client"; // Import Supabase client

const Navigation = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isSignInOpen, setIsSignInOpen] = useState(false);
  const [isJoinUsOpen, setIsJoinUsOpen] = useState(false);
  const navigate = useNavigate();
  const { user, signOut, loading } = useAuth();
  const { isAdmin } = useUserRole();
  
  // --- NEW STATE to track if the user owns destinations ---
  const [hasDestinations, setHasDestinations] = useState(false);

  const isSuperAdmin = user?.email === 'johnleomedina@gmail.com' && isAdmin;

  // --- NEW useEffect to check for user's destinations ---
  useEffect(() => {
    // Reset when user logs out or changes
    setHasDestinations(false);

    if (user) {
      const checkUserDestinations = async () => {
        // This is a very fast query. We just check if at least one row exists.
        const { data, error } = await supabase
          .from('destinations')
          .select('id')
          .eq('owner_id', user.id)
          .limit(1); // We only need to find one to show the link

        if (error) {
          console.error("Error checking for user destinations:", error);
          return;
        }

        if (data && data.length > 0) {
          setHasDestinations(true);
        }
      };
      checkUserDestinations();
    }
  }, [user]); // This effect runs whenever the user object changes

  const handleSignIn = () => setIsSignInOpen(true);
  const handleJoinUs = () => setIsJoinUsOpen(true);

  const navItems = [
    { label: "Home", path: "/" },
    { label: "Destinations", path: "/destinations" },
    { label: "Community", path: "/community" },
    { label: "Calculator", path: "/calculator" },
    { label: "Register Destination", path: "/register-destination" },
  ];

  return (
    <nav className="bg-background/95 backdrop-blur-sm border-b border-border sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <Link to="/" className="flex items-center">
            <img 
              src="/lovable-uploads/f91ba406-163e-4e12-ab08-1481effe6d76.png" 
              alt="EcoLakbay Logo" 
              className="h-8 w-auto"
            />
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-8">
            {navItems.map((item) => (
              <Link key={item.path} to={item.path} className="text-foreground hover:text-forest transition-colors duration-200">
                {item.label}
              </Link>
            ))}
          </div>

          <div className="hidden md:flex items-center space-x-4">
            {user ? (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="sm">
                    <Avatar className="w-6 h-6 mr-2">
                      <AvatarImage src={user.user_metadata?.avatar_url} />
                      <AvatarFallback className="text-xs">{user.email?.charAt(0).toUpperCase()}</AvatarFallback>
                    </Avatar>
                    Menu
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-56">
                  <DropdownMenuItem onClick={() => navigate("/account")}>
                    <User className="w-4 h-4 mr-2" />
                    Account Settings
                  </DropdownMenuItem>
                  
                  {/* --- NEW: Conditionally render the "My Destinations" link --- */}
                  {hasDestinations && (
                    <DropdownMenuItem onClick={() => navigate("/my-destinations")}>
                      <MapPin className="w-4 h-4 mr-2" />
                      My Destinations
                    </DropdownMenuItem>
                  )}
                  
                  {/* The admin dashboard link is still here */}
                  <DropdownMenuItem onClick={() => navigate("/dashboard")}>
                    <Settings className="w-4 h-4 mr-2" />
                    Dashboard
                  </DropdownMenuItem>
                  
                  {isSuperAdmin && (
                    <DropdownMenuItem onClick={() => navigate("/super-admin")}>
                      <Shield className="w-4 h-4 mr-2" />
                      Super Admin
                    </DropdownMenuItem>
                  )}
                  
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={signOut}>
                    <LogOut className="w-4 h-4 mr-2" />
                    Sign Out
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            ) : (
              <>
                <Button variant="outline" size="sm" onClick={handleSignIn}>Sign In</Button>
                <Button variant="eco" size="sm" onClick={handleJoinUs}>Join Us</Button>
              </>
            )}
          </div>

          {/* Mobile menu button */}
          <button className="md:hidden" onClick={() => setIsMenuOpen(!isMenuOpen)}>
            {/* ... (hamburger icon svg/spans) ... */}
          </button>
        </div>

        {/* Mobile Navigation */}
        {isMenuOpen && (
          <div className="md:hidden py-4 border-t border-border">
            <div className="flex flex-col space-y-4">
              {navItems.map((item) => (
                <Link key={item.path} to={item.path} className="px-4 py-2" onClick={() => setIsMenuOpen(false)}>
                  {item.label}
                </Link>
              ))}
              <div className="flex flex-col space-y-2 px-4 pt-4">
                {user ? (
                  <>
                    <Button variant="ghost" size="sm" onClick={() => {navigate("/account"); setIsMenuOpen(false);}}>
                      <User className="w-4 h-4 mr-2" /> Account
                    </Button>

                    {/* --- NEW: Conditionally render for mobile menu --- */}
                    {hasDestinations && (
                       <Button variant="ghost" size="sm" onClick={() => {navigate("/my-destinations"); setIsMenuOpen(false);}}>
                        <MapPin className="w-4 h-4 mr-2" /> My Destinations
                      </Button>
                    )}

                    <Button variant="ghost" size="sm" onClick={() => {navigate("/dashboard"); setIsMenuOpen(false);}}>
                      <Settings className="w-4 h-4 mr-2" /> Dashboard
                    </Button>
                    
                    {isSuperAdmin && (
                      <Button variant="ghost" size="sm" onClick={() => {navigate("/super-admin"); setIsMenuOpen(false);}}>
                        <Shield className="w-4 h-4 mr-2" /> Super Admin
                      </Button>
                    )}
                    
                    <Button variant="outline" size="sm" onClick={signOut}>
                      <LogOut className="w-4 h-4 mr-2" /> Sign Out
                    </Button>
                  </>
                ) : (
                  <>
                    <Button variant="outline" size="sm" onClick={() => {handleSignIn(); setIsMenuOpen(false);}}>Sign In</Button>
                    <Button variant="eco" size="sm" onClick={() => {handleJoinUs(); setIsMenuOpen(false);}}>Join Us</Button>
                  </>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
      
      <SignInModal open={isSignInOpen} onOpenChange={setIsSignInOpen} />
      <JoinUsModal open={isJoinUsOpen} onOpenChange={setIsJoinUsOpen} />
    </nav>
  );
};

export default Navigation;
