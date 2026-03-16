import { Instagram, Facebook, Twitter, Youtube, Send } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

export const Footer = () => {
  const [email, setEmail] = useState("");

  const handleSubscribe = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim() || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      toast.error("Please enter a valid email", { position: "top-center" });
      return;
    }
    toast.success("Subscribed!", { position: "top-center" });
    setEmail("");
  };

  return (
    <footer className="bg-[#0a0a0a] border-t border-border">
      <div className="px-6 md:px-10 py-14">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-10 max-w-[1400px] mx-auto">
          {/* Brand */}
          <div className="md:col-span-1">
            <h3 className="font-display text-2xl font-bold text-white tracking-wider mb-3">PHENIX</h3>
            <p className="text-white/60 text-sm leading-relaxed">
              Streetwear meets modern minimalism. Elevate your style.
            </p>
            <div className="flex gap-3 mt-5">
              {[
                { icon: Instagram, href: "#" },
                { icon: Facebook, href: "#" },
                { icon: Twitter, href: "#" },
                { icon: Youtube, href: "#" },
              ].map(({ icon: Icon, href }, i) => (
                <a
                  key={i}
                  href={href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="p-2 rounded-full bg-muted text-muted-foreground hover:bg-primary hover:text-primary-foreground transition-colors"
                >
                  <Icon className="h-4 w-4" />
                </a>
              ))}
            </div>
          </div>

          {/* Shop */}
          <div>
            <h4 className="font-display text-sm font-semibold uppercase tracking-widest text-white mb-4">Shop</h4>
            <ul className="space-y-2">
              {["New Arrivals", "Best Sellers", "Collections", "Sale"].map((item) => (
                <li key={item}>
                  <a href="#products" className="text-sm text-white/60 hover:text-white transition-colors">
                    {item}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          {/* Help */}
          <div>
            <h4 className="font-display text-sm font-semibold uppercase tracking-widest text-white mb-4">Help</h4>
            <ul className="space-y-2">
              {["Shipping & Returns", "FAQ", "Contact Us", "Size Guide"].map((item) => (
                <li key={item}>
                  <a href="#" className="text-sm text-white/60 hover:text-white transition-colors">
                    {item}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          {/* Newsletter */}
          <div>
            <h4 className="font-display text-sm font-semibold uppercase tracking-widest text-white mb-4">Newsletter</h4>
            <p className="text-sm text-white/60 mb-4">Get 10% off your first order.</p>
            <form onSubmit={handleSubscribe} className="flex gap-2">
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Your email"
                maxLength={255}
                className="flex-1 bg-muted border border-border rounded-full px-4 py-2 text-sm text-foreground placeholder:text-muted-foreground outline-none focus:border-primary transition-colors"
              />
              <button
                type="submit"
                className="bg-primary text-primary-foreground p-2.5 rounded-full hover:bg-primary/90 transition-colors"
              >
                <Send className="h-4 w-4" />
              </button>
            </form>
          </div>
        </div>
      </div>

      <div className="border-t border-border px-6 md:px-10 py-5">
        <p className="text-center text-xs text-white/40">
          © {new Date().getFullYear()} PHENIX. All rights reserved.
        </p>
      </div>
    </footer>
  );
};
