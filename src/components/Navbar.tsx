import { useState } from "react";
import { Search, User, LogOut, UserCircle2, Menu, X } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { CartDrawer } from "./CartDrawer";
import { ModeToggle } from "./mode-toggle";
import { useAuth } from "@/contexts/AuthContext";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger, DropdownMenuLabel, DropdownMenuSeparator } from "@/components/ui/dropdown-menu";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { toast } from "sonner";
import logoImg from "@/assets/logowhite.png";

export const Navbar = () => {
  const navigate = useNavigate();
  const { user, signOut } = useAuth();
  const [searchQuery, setSearchQuery] = useState("");
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

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

  const navLinks = [
    { name: "Découvrir", path: "/collections" },
    { name: "Pre-spring - NEW DROP", path: "/collections" },
    { name: "SALES", path: "/collections?sale=true" },
    { name: "SS 25", path: "/collections" },
    { name: "Mentions légales", path: "/legal" }
  ];

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-background/80 backdrop-blur-md border-b border-border">
      <div className="flex items-center justify-between px-4 md:px-12 h-16 lg:h-20 max-w-[1920px] mx-auto w-full">
        {/* LEFT COLUMN: Mobile Menu & Logo */}
        <div className="flex items-center gap-4 flex-none lg:min-w-[160px]">
          {/* Mobile Menu Trigger */}
          <Sheet open={isMobileMenuOpen} onOpenChange={setIsMobileMenuOpen}>
            <SheetTrigger asChild>
              <button className="lg:hidden p-2 text-muted-foreground hover:text-foreground transition-colors">
                <Menu className="h-6 w-6" />
              </button>
            </SheetTrigger>
            <SheetContent side="left" className="w-[300px] bg-background/95 backdrop-blur-xl border-r border-border p-0 flex flex-col">
              <SheetHeader className="p-6 border-b border-border/50">
                <SheetTitle className="flex items-center gap-3 font-display text-xl font-bold tracking-wider text-foreground">
                  <img src={logoImg} alt="PHENIX logo" className="h-8 w-auto object-contain shrink-0 dark:invert-0 invert" />
                  PHENIX
                </SheetTitle>
              </SheetHeader>
              
              <div className="flex-1 overflow-y-auto p-6 space-y-6">
                <div className="space-y-4">
                  <p className="text-[10px] uppercase font-black tracking-[0.25em] text-[#BF953F] opacity-80">
                    Collections
                  </p>
                  <div className="flex flex-col gap-4">
                    {navLinks.map((link) => (
                      <button
                        key={link.name}
                        onClick={() => {
                          navigate(link.path);
                          setIsMobileMenuOpen(false);
                        }}
                        className={`
                          text-left text-sm font-bold uppercase tracking-[0.15em] transition-colors
                          ${link.name === "SALES" ? "text-red-500" : "text-foreground/70 hover:text-[#BF953F]"}
                        `}
                      >
                        {link.name}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="space-y-4 pt-4 border-t border-border/50">
                  <p className="text-[10px] uppercase font-black tracking-[0.25em] text-[#BF953F] opacity-80">
                    Search
                  </p>
                  <form onSubmit={handleSearch} className="flex items-center bg-secondary/30 rounded-full px-4 py-2 gap-3 border border-border/50 focus-within:border-[#BF953F]/40 transition-all">
                    <Search className="h-4 w-4 text-muted-foreground" />
                    <input
                      type="text"
                      placeholder="Search..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="bg-transparent border-none outline-none text-xs font-bold uppercase tracking-[0.1em] text-foreground placeholder:text-muted-foreground/60 w-full"
                    />
                  </form>
                </div>
              </div>

              <div className="p-6 border-t border-border/50 bg-muted/20">
                {user ? (
                  <div className="space-y-4">
                    <div className="flex items-center gap-3">
                      <div className="h-10 w-10 rounded-full bg-gradient-to-r from-[#BF953F] via-[#FCF6BA] to-[#B38728] p-[1px]">
                        <div className="w-full h-full rounded-full bg-background flex items-center justify-center overflow-hidden">
                          {user.user_metadata?.avatar_url ? (
                            <img src={user.user_metadata.avatar_url} alt="Avatar" className="w-full h-full object-cover" />
                          ) : (
                            <span className="text-xs font-black">{(user.user_metadata?.display_name?.[0] ?? user.email?.[0] ?? "?").toUpperCase()}</span>
                          )}
                        </div>
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-bold text-foreground truncate">{user.user_metadata?.display_name || user.email?.split('@')[0]}</p>
                        <p className="text-[10px] text-muted-foreground truncate">{user.email}</p>
                      </div>
                    </div>
                    <button 
                      onClick={() => {
                        navigate("/profile");
                        setIsMobileMenuOpen(false);
                      }}
                      className="w-full py-2.5 rounded-xl bg-primary text-primary-foreground text-xs font-bold tracking-wider hover:opacity-90 transition-opacity"
                    >
                      VIEW PROFILE
                    </button>
                    <button 
                      onClick={() => {
                        handleSignOut();
                        setIsMobileMenuOpen(false);
                      }}
                      className="w-full py-2.5 rounded-xl border border-destructive/20 text-destructive text-xs font-bold tracking-wider hover:bg-destructive/5 transition-colors"
                    >
                      SIGN OUT
                    </button>
                  </div>
                ) : (
                  <button 
                    onClick={() => {
                      navigate("/auth");
                      setIsMobileMenuOpen(false);
                    }}
                    className="w-full py-3 rounded-xl bg-gradient-to-r from-[#BF953F] via-[#FCF6BA] to-[#B38728] text-black text-xs font-black tracking-[0.2em] shadow-lg active:scale-[0.98] transition-all"
                  >
                    SIGN IN / REGISTER
                  </button>
                )}
              </div>
            </SheetContent>
          </Sheet>

          <a href="/" className="flex items-center gap-3 font-display text-xl sm:text-2xl font-bold tracking-wider text-foreground hover:opacity-90 transition-opacity">
            <img src={logoImg} alt="PHENIX logo" className="h-8 lg:h-10 w-auto object-contain shrink-0 dark:invert-0 invert" />
            <span className="hidden sm:inline">PHENIX</span>
          </a>
        </div>

        {/* CENTER COLUMN: Navigation Links (Desktop) */}
        <div className="hidden lg:flex flex-1 items-center justify-center gap-10">
          {navLinks.map((link) => (
            <button
              key={link.name}
              onClick={() => navigate(link.path)}
              className={`
                relative text-[11px] font-black uppercase tracking-[0.2em] transition-all duration-300
                ${link.name === "SALES" ? "text-red-500 hover:text-red-600" : "text-foreground/70 hover:text-foreground"}
                group whitespace-nowrap
              `}
            >
              {link.name}
              <span className="absolute -bottom-1.5 left-0 w-0 h-0.5 bg-[#BF953F] transition-all duration-300 group-hover:w-full" />
            </button>
          ))}
        </div>

        {/* RIGHT COLUMN: Search and Actions */}
        <div className="flex items-center justify-end gap-2 sm:gap-6 flex-none lg:flex-1 lg:max-w-[400px]">
          {/* Search Bar (Desktop) */}
          <form onSubmit={handleSearch} className="hidden xl:flex flex-1 items-center bg-secondary/30 backdrop-blur-sm rounded-full px-5 py-2.5 gap-3 border border-border/50 focus-within:border-[#BF953F]/40 focus-within:bg-secondary/40 focus-within:shadow-[0_0_20px_rgba(191,149,63,0.15)] transition-all duration-300 group">
            <Search className="h-4 w-4 text-muted-foreground group-focus-within:text-[#BF953F] transition-colors" />
            <input
              type="text"
              placeholder="Search products..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="bg-transparent border-none outline-none text-[12px] font-bold uppercase tracking-[0.1em] text-foreground placeholder:text-muted-foreground/60 w-full"
            />
          </form>

          <div className="flex items-center gap-1 sm:gap-3 shrink-0 ml-2">
            {/* User Icon (Desktop) */}
            <div className="hidden sm:block">
              {user ? (
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <button className="flex items-center justify-center h-8 w-8 sm:h-9 sm:w-9 rounded-full bg-gradient-to-r from-[#BF953F] via-[#FCF6BA] to-[#B38728] text-black text-xs sm:text-sm font-black hover:scale-105 transition-transform border-none shadow-[0_0_15px_rgba(191,149,63,0.3)] overflow-hidden">
                      {user.user_metadata?.avatar_url ? (
                        <img src={user.user_metadata.avatar_url} alt="Avatar" className="w-full h-full object-cover" />
                      ) : (
                        (user.user_metadata?.display_name?.[0] ?? user.email?.[0] ?? "?").toUpperCase()
                      )}
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
            </div>
            
            <ModeToggle />
            <CartDrawer />
          </div>
        </div>
      </div>
    </nav>
  );
};
