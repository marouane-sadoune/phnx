import { Search, User } from "lucide-react";
import { CartDrawer } from "./CartDrawer";

export const Navbar = () => {
  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-background/80 backdrop-blur-md border-b border-border">
      <div className="flex items-center justify-between px-6 md:px-10 h-16">
        <a href="/" className="font-display text-2xl font-bold tracking-wider text-foreground">
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
          <button className="p-2 text-muted-foreground hover:text-foreground transition-colors">
            <User className="h-5 w-5" />
          </button>
          <CartDrawer />
        </div>
      </div>
    </nav>
  );
};
