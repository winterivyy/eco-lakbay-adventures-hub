import { useState } from "react";
import { Button } from "@/components/ui/button";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { useUserRole } from "@/hooks/useUserRole";
import SignInModal from "./SignInModal";
import JoinUsModal from "./JoinUsModal";
import { LogOut, User, Settings, Shield } from "lucide-react";

const Navigation = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isSignInOpen, setIsSignInOpen] = useState(false);
  const [isJoinUsOpen, setIsJoinUsOpen] = useState(false);
  const navigate = useNavigate();
  const { user, signOut, loading } = useAuth();
  const { isAdmin } = useUserRole();
  
  const isSuperAdmin = user?.email === 'johnleomedina@gmail.com' && isAdmin;

  const handleSignIn = () => {
    setIsSignInOpen(true);
  };

  const handleJoinUs = () => {
    setIsJoinUsOpen(true);
  };

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
              <Link
                key={item.path}
                to={item.path}
                className="text-foreground hover:text-forest transition-colors duration-200"
              >
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
                      <AvatarFallback className="text-xs">
                        {user.email?.charAt(0).toUpperCase()}
                      </AvatarFallback>
                    </Avatar>
                    Menu
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-56">
                  <DropdownMenuItem onClick={() => navigate("/account")}>
                    <User className="w-4 h-4 mr-2" />
                    Account Settings
                  </DropdownMenuItem>
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
                <Button variant="outline" size="sm" onClick={handleSignIn}>
                  Sign In
                </Button>
                <Button variant="eco" size="sm" onClick={handleJoinUs}>
                  Join Us
                </Button>
              </>
            )}
          </div>

          {/* Mobile menu button */}
          <button
            className="md:hidden"
            onClick={() => setIsMenuOpen(!isMenuOpen)}
          >
            <div className="w-6 h-6 flex flex-col justify-center items-center">
              <span className={`w-4 h-0.5 bg-forest transition-all duration-300 ${isMenuOpen ? 'rotate-45 translate-y-1' : ''}`}></span>
              <span className={`w-4 h-0.5 bg-forest transition-all duration-300 mt-1 ${isMenuOpen ? 'opacity-0' : ''}`}></span>
              <span className={`w-4 h-0.5 bg-forest transition-all duration-300 mt-1 ${isMenuOpen ? '-rotate-45 -translate-y-1' : ''}`}></span>
            </div>
          </button>
        </div>

        {/* Mobile Navigation */}
        {isMenuOpen && (
          <div className="md:hidden py-4 border-t border-border">
            <div className="flex flex-col space-y-4">
              {navItems.map((item) => (
                <Link
                  key={item.path}
                  to={item.path}
                  className="text-foreground hover:text-forest transition-colors duration-200 px-4 py-2"
                  onClick={() => setIsMenuOpen(false)}
                >
                  {item.label}
                </Link>
              ))}
               <div className="flex flex-col space-y-2 px-4 pt-4">
                {user ? (
                  <>
                    <Button variant="ghost" size="sm" onClick={() => {navigate("/account"); setIsMenuOpen(false);}}>
                      <User className="w-4 h-4 mr-2" />
                      Account
                    </Button>
                    <Button variant="ghost" size="sm" onClick={() => {navigate("/dashboard"); setIsMenuOpen(false);}}>
                      <Settings className="w-4 h-4 mr-2" />
                      Dashboard
                    </Button>
                    {isSuperAdmin && (
                      <Button variant="ghost" size="sm" onClick={() => {navigate("/super-admin"); setIsMenuOpen(false);}}>
                        <Shield className="w-4 h-4 mr-2" />
                        Super Admin
                      </Button>
                    )}
                    <Button variant="outline" size="sm" onClick={signOut}>
                      <LogOut className="w-4 h-4 mr-2" />
                      Sign Out
                    </Button>
                  </>
                ) : (
                  <>
                    <Button variant="outline" size="sm" onClick={handleSignIn}>
                      Sign In
                    </Button>
                    <Button variant="eco" size="sm" onClick={handleJoinUs}>
                      Join Us
                    </Button>
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