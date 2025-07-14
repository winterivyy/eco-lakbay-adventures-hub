import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import SignInModal from "./SignInModal";
import JoinUsModal from "./JoinUsModal";
import { LogOut, User } from "lucide-react";

const Navigation = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isSignInOpen, setIsSignInOpen] = useState(false);
  const [isJoinUsOpen, setIsJoinUsOpen] = useState(false);
  const navigate = useNavigate();
  const { user, signOut, loading } = useAuth();

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
    ...(user ? [{ label: "Dashboard", path: "/dashboard" }] : []),
    { label: "Register Destination", path: "/register-destination" },
  ];

  return (
    <nav className="bg-background/95 backdrop-blur-sm border-b border-border sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <Link to="/" className="flex items-center space-x-2">
            <div className="w-8 h-8 bg-gradient-hero rounded-full flex items-center justify-center">
              <span className="text-white font-bold text-sm">E</span>
            </div>
            <span className="text-xl font-bold text-forest">EcoLakbay</span>
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
              <>
                <Button variant="ghost" size="sm" onClick={() => navigate("/dashboard")}>
                  <User className="w-4 h-4 mr-2" />
                  Dashboard
                </Button>
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
                    <Button variant="ghost" size="sm" onClick={() => navigate("/dashboard")}>
                      <User className="w-4 h-4 mr-2" />
                      Dashboard
                    </Button>
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