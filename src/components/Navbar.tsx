import { Search, User, LogOut, UserCircle2 } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { CartDrawer } from "./CartDrawer";
import { useAuth } from "@/contexts/AuthContext";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { toast } from "sonner";
import logoImg from "@/assets/logowhite.png";

export const Navbar = () => {
  const navigate = useNavigate();
  const { user, signOut } = useAuth();

  const handleSignOut = async () => {
    await signOut();
    toast.success("Signed out");
  };

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-background/80 backdrop-blur-md border-b border-border">
      <div className="flex items-center justify-between px-6 md:px-36 h-16">
        <a href="/" className="flex items-center gap-2 font-display text-2xl md:text-3xl font-bold tracking-wider text-foreground hover:opacity-90 transition-opacity">
          <img src={logoImg} alt="PHENIX logo" className="h-15 md:h-20 w-auto object-contain shrink-0" />
          PHENIX
        </a>

        <div className="hidden md:flex items-center bg-secondary rounded-full px-4 py-2 gap-2 min-w-[280px]">
          <Search className="h-4 w-4 text-muted-foreground" />
          <input
            type="text"
            placeholder="Search for products..."
            className="bg-transparent border-none outline-none text-sm text-foreground placeholder:text-muted-foreground w-full"
          />
        </div>

        <div className="flex items-center gap-3">
          {user ? (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <button className="flex items-center justify-center h-8 w-8 rounded-full bg-primary text-primary-foreground text-sm font-bold hover:opacity-90 transition-opacity">
                  {(user.user_metadata?.display_name?.[0] ?? user.email?.[0] ?? "?").toUpperCase()}
                </button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="bg-card border-border w-48">
                <DropdownMenuItem className="text-muted-foreground text-xs cursor-default truncate">
                  {user.email}
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => navigate("/profile")} className="text-foreground cursor-pointer">
                  <UserCircle2 className="h-4 w-4 mr-2" />
                  My Profile
                </DropdownMenuItem>
                <DropdownMenuItem onClick={handleSignOut} className="text-foreground cursor-pointer">
                  <LogOut className="h-4 w-4 mr-2" />
                  Sign Out
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          ) : (
            <button
              onClick={() => navigate("/auth")}
              className="p-2 text-muted-foreground hover:text-foreground transition-colors"
            >
              <User className="h-5 w-5" />
            </button>
          )}
          <CartDrawer />
        </div>
      </div>
    </nav>
  );
};
