import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { FileText, Moon, Sun, LogOut, User, LayoutDashboard, FileSearch, CreditCard, Shield } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import {
  NavigationMenu,
  NavigationMenuContent,
  NavigationMenuItem,
  NavigationMenuLink,
  NavigationMenuList,
  NavigationMenuTrigger,
  navigationMenuTriggerStyle,
} from "@/components/ui/navigation-menu";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

const Header = () => {
  const [scrolled, setScrolled] = useState(false);
  const [isDarkMode, setIsDarkMode] = useState(
    localStorage.getItem("theme") === "dark" ||
    (!localStorage.getItem("theme") && window.matchMedia("(prefers-color-scheme: dark)").matches)
  );
  const { user, signOut } = useAuth();
  const navigate = useNavigate();
  const [isAdmin, setIsAdmin] = useState(false);

  useEffect(() => {
    if (user?.email) {
      const adminEmails = ["admin@example.com", "admin@test.com"];
      setIsAdmin(adminEmails.includes(user.email.toLowerCase()));
    } else {
      setIsAdmin(false);
    }
  }, [user]);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 10);
    };
    
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  useEffect(() => {
    if (isDarkMode) {
      document.documentElement.classList.add("dark");
      localStorage.setItem("theme", "dark");
    } else {
      document.documentElement.classList.remove("dark");
      localStorage.setItem("theme", "light");
    }
  }, [isDarkMode]);

  const toggleDarkMode = () => {
    setIsDarkMode(!isDarkMode);
  };

  return (
    <header
      className={`sticky top-0 z-50 w-full transition-all duration-300 ${
        scrolled
          ? "py-3 backdrop-blur-lg bg-background/80 shadow-sm"
          : "py-5 bg-transparent"
      }`}
    >
      <div className="container flex items-center justify-between">
        <Link 
          to="/" 
          className="flex items-center space-x-2 text-xl font-medium transition-opacity hover:opacity-80"
        >
          <FileText className="w-6 h-6 text-primary" />
          <span>AI Resume Analyzer</span>
        </Link>
        
        <div className="flex items-center space-x-6">
          <NavigationMenu>
            <NavigationMenuList>
              <NavigationMenuItem>
                <NavigationMenuLink
                  className={navigationMenuTriggerStyle()}
                  asChild
                >
                  <Link to="/">Home</Link>
                </NavigationMenuLink>
              </NavigationMenuItem>

              {user ? (
                <>
                  <NavigationMenuItem>
                    <NavigationMenuLink
                      className={navigationMenuTriggerStyle()}
                      asChild
                    >
                      <Link to="/dashboard">
                        <LayoutDashboard className="mr-1 h-4 w-4" />
                        Dashboard
                      </Link>
                    </NavigationMenuLink>
                  </NavigationMenuItem>
                  
                  <NavigationMenuItem>
                    <NavigationMenuLink
                      className={navigationMenuTriggerStyle()}
                      asChild
                    >
                      <Link to="/analysis">
                        <FileSearch className="mr-1 h-4 w-4" />
                        New Analysis
                      </Link>
                    </NavigationMenuLink>
                  </NavigationMenuItem>
                  
                  <NavigationMenuItem>
                    <NavigationMenuLink
                      className={navigationMenuTriggerStyle()}
                      asChild
                    >
                      <Link to="/subscription">
                        <CreditCard className="mr-1 h-4 w-4" />
                        Subscription
                      </Link>
                    </NavigationMenuLink>
                  </NavigationMenuItem>
                  
                  <NavigationMenuItem>
                    <NavigationMenuLink
                      className={navigationMenuTriggerStyle()}
                      asChild
                    >
                      <Link to="/admin">
                        <Shield className="mr-1 h-4 w-4" />
                        Admin
                      </Link>
                    </NavigationMenuLink>
                  </NavigationMenuItem>
                  
                  <NavigationMenuItem>
                    <NavigationMenuTrigger>
                      <User className="mr-1 h-4 w-4" />
                      Account
                    </NavigationMenuTrigger>
                    <NavigationMenuContent>
                      <div className="grid gap-2 p-4 w-[200px]">
                        <div className="text-sm font-medium">
                          {user.email}
                        </div>
                        <Button 
                          variant="outline" 
                          className="w-full justify-start" 
                          onClick={() => signOut()}
                        >
                          <LogOut className="mr-2 h-4 w-4" />
                          Sign Out
                        </Button>
                      </div>
                    </NavigationMenuContent>
                  </NavigationMenuItem>
                </>
              ) : (
                <>
                  <NavigationMenuItem>
                    <NavigationMenuLink
                      className={navigationMenuTriggerStyle()}
                      asChild
                    >
                      <Link to="/login">Login</Link>
                    </NavigationMenuLink>
                  </NavigationMenuItem>
                  
                  <NavigationMenuItem>
                    <NavigationMenuLink
                      className={cn(navigationMenuTriggerStyle(), "bg-primary text-primary-foreground hover:bg-primary/90")}
                      asChild
                    >
                      <Link to="/signup">Sign Up</Link>
                    </NavigationMenuLink>
                  </NavigationMenuItem>
                </>
              )}
            </NavigationMenuList>
          </NavigationMenu>

          <button
            onClick={toggleDarkMode}
            className="p-2 rounded-full hover:bg-secondary transition-colors"
            aria-label="Toggle dark mode"
          >
            {isDarkMode ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
          </button>
        </div>
      </div>
    </header>
  );
};

export default Header;
