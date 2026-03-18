import { useState } from "react";
import { Search, User, LogOut, UserCircle2 } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { CartDrawer } from "./CartDrawer";
import { ModeToggle } from "./mode-toggle";
import { useAuth } from "@/contexts/AuthContext";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger, DropdownMenuLabel, DropdownMenuSeparator } from "@/components/ui/dropdown-menu";
import { toast } from "sonner";
import logoImg from "@/assets/logowhite.png";

export const Navbar = () => {
  const navigate = useNavigate();
  const { user, signOut } = useAuth();
  const [searchQuery, setSearchQuery] = useState("");

  const handleSignOut = async () => {
    await signOut();
    toast.success("Signed out");
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/collections?q=${encodeURIComponent(searchQuery.trim())}`);
    }
  };

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-background/80 backdrop-blur-md border-b border-border">
      <div className="flex items-center justify-between px-6 md:px-36 h-16">
        <a href="/" className="flex items-center gap-2 font-display text-xl sm:text-2xl md:text-3xl font-bold tracking-wider text-foreground hover:opacity-90 transition-opacity">
          <img src={logoImg} alt="PHENIX logo" className="h-8 sm:h-10 md:h-12 w-auto object-contain shrink-0 dark:invert-0 invert" />
          PHENIX
        </a>

        <form onSubmit={handleSearch} className="hidden md:flex items-center bg-secondary rounded-full px-4 py-2 gap-2 min-w-[280px]">
          <Search className="h-4 w-4 text-muted-foreground" />
          <input
            type="text"
            placeholder="Search for products..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="bg-transparent border-none outline-none text-sm text-foreground placeholder:text-muted-foreground w-full"
          />
        </form>

        <div className="flex items-center gap-3">
          {user ? (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <button className="flex items-center justify-center h-9 w-9 rounded-full bg-gradient-to-r from-[#BF953F] via-[#FCF6BA] to-[#B38728] text-black text-sm font-black hover:scale-105 transition-transform border-none shadow-[0_0_15px_rgba(191,149,63,0.3)]">
                  {(user.user_metadata?.display_name?.[0] ?? user.email?.[0] ?? "?").toUpperCase()}
                </button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="bg-card/95 backdrop-blur-xl border-border w-64 p-0 overflow-hidden shadow-2xl rounded-2xl animate-in fade-in zoom-in-95 duration-200">
                <div className="p-4 bg-muted/40 border-b border-border/50">
                  <DropdownMenuLabel className="p-0 text-[10px] uppercase font-black tracking-[0.25em] text-[#BF953F] mb-1.5 opacity-80">
                    Account Access
                  </DropdownMenuLabel>
                  <p className="text-sm font-medium text-foreground truncate leading-none">
                    {user.user_metadata?.display_name || user.email?.split('@')[0]}
                  </p>
                  <p className="text-[10px] text-muted-foreground truncate mt-1.5 opacity-60">
                    {user.email}
                  </p>
                </div>
                
                <div className="p-1.5">
                  <DropdownMenuItem 
                    onClick={() => navigate("/profile")} 
                    className="flex items-center text-sm cursor-pointer rounded-xl h-11 px-3 focus:bg-primary focus:text-primary-foreground transition-all duration-200"
                  >
                    <div className="h-8 w-8 rounded-lg bg-primary/10 flex items-center justify-center mr-3 group-focus:bg-primary-foreground/20">
                      <UserCircle2 className="h-4.5 w-4.5" />
                    </div>
                    <span className="font-bold tracking-wide">My Profile</span>
                  </DropdownMenuItem>

                  <DropdownMenuSeparator className="bg-border/40 mx-2 my-1.5" />

                  <DropdownMenuItem 
                    onClick={handleSignOut} 
                    className="flex items-center text-sm cursor-pointer rounded-xl h-11 px-3 focus:bg-destructive/10 focus:text-destructive hover:bg-destructive/10 transition-all duration-200"
                  >
                    <div className="h-8 w-8 rounded-lg bg-destructive/10 flex items-center justify-center mr-3">
                      <LogOut className="h-4 w-4" />
                    </div>
                    <span className="font-bold tracking-wide">Sign Out</span>
                  </DropdownMenuItem>
                </div>
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
          <ModeToggle />
          <CartDrawer />
        </div>
      </div>
    </nav>
  );
};
