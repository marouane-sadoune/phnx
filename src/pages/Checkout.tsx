import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useCartStore } from "@/stores/cartStore";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { 
  ArrowLeft, 
  CreditCard, 
  Truck, 
  ShieldCheck, 
  ShoppingCart, 
  ChevronRight,
  Info,
  Lock,
  Loader2
} from "lucide-react";
import { toast } from "sonner";

const Checkout = () => {
  const navigate = useNavigate();
  const { items, getCheckoutUrl, isLoading } = useCartStore();
  const [formState, setFormState] = useState({
    email: "",
    firstName: "",
    lastName: "",
    address: "",
    city: "",
    country: "Morocco",
    postalCode: "",
    phone: ""
  });

  const total = items.reduce((sum, item) => sum + (parseFloat(item.price.amount) * item.quantity), 0);
  const shipping = total > 1000 ? 0 : 50;

  useEffect(() => {
    if (items.length === 0 && !isLoading) {
      navigate("/");
    }
  }, [items, navigate, isLoading]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormState(prev => ({ ...prev, [name]: value }));
  };

  const handleProceedToPayment = () => {
    const baseUrl = getCheckoutUrl();
    if (baseUrl) {
      try {
        const checkoutUrl = new URL(baseUrl);
        
        // Identity Sync: Pre-fill Shopify checkout via URL parameters
        // This ensures the client only enters their info once
        if (formState.email) checkoutUrl.searchParams.set('checkout[email]', formState.email);
        if (formState.firstName) checkoutUrl.searchParams.set('checkout[shipping_address][first_name]', formState.firstName);
        if (formState.lastName) checkoutUrl.searchParams.set('checkout[shipping_address][last_name]', formState.lastName);
        if (formState.address) checkoutUrl.searchParams.set('checkout[shipping_address][address1]', formState.address);
        if (formState.city) checkoutUrl.searchParams.set('checkout[shipping_address][city]', formState.city);
        if (formState.postalCode) checkoutUrl.searchParams.set('checkout[shipping_address][zip]', formState.postalCode);
        if (formState.phone) checkoutUrl.searchParams.set('checkout[shipping_address][phone]', formState.phone);
        checkoutUrl.searchParams.set('checkout[shipping_address][country]', formState.country);

        toast.info("Redirecting to secure payment...");
        window.location.href = checkoutUrl.toString();
      } catch (err) {
        console.error("URL Parsing Error:", err);
        window.location.href = baseUrl;
      }
    } else {
      toast.error("Unable to proceed to checkout. Please try again.");
    }
  };

  if (items.length === 0) return null;

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      
      <main className="pt-24 pb-20 px-6 md:px-10 max-w-[1400px] mx-auto">
        <div className="flex flex-col lg:flex-row gap-12">
          
          {/* ═══ Left Side: Checkout Form ════════════════════════════ */}
          <div className="flex-1 space-y-10">
            <div>
              <button 
                onClick={() => navigate(-1)}
                className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors mb-6 font-medium"
              >
                <ArrowLeft className="h-4 w-4" /> Back to store
              </button>
              <h1 className="font-display text-3xl md:text-4xl font-bold uppercase tracking-tight text-foreground">
                Checkout
              </h1>
            </div>

            {/* Contact Information */}
            <section className="space-y-6">
              <div className="flex items-center gap-3">
                <div className="h-8 w-8 rounded-full bg-[#BF953F]/10 flex items-center justify-center">
                  <span className="text-xs font-bold text-[#BF953F]">01</span>
                </div>
                <h2 className="text-lg font-bold uppercase tracking-wider">Contact Information</h2>
              </div>
              <div className="grid gap-4">
                <div className="space-y-2">
                  <label className="text-xs font-bold uppercase tracking-widest text-muted-foreground">Email Address</label>
                  <Input 
                    name="email"
                    type="email"
                    placeholder="your@email.com" 
                    value={formState.email}
                    onChange={handleInputChange}
                    className="bg-secondary/30 border-border h-12 rounded-xl focus:ring-[#BF953F]"
                  />
                </div>
                <div className="space-y-2">
                   <label className="text-xs font-bold uppercase tracking-widest text-muted-foreground">Phone Number</label>
                  <Input 
                    name="phone"
                    placeholder="+212 ..." 
                    value={formState.phone}
                    onChange={handleInputChange}
                    className="bg-secondary/30 border-border h-12 rounded-xl focus:ring-[#BF953F]"
                  />
                </div>
              </div>
            </section>

            {/* Shipping Address */}
            <section className="space-y-6">
              <div className="flex items-center gap-3">
                <div className="h-8 w-8 rounded-full bg-[#BF953F]/10 flex items-center justify-center">
                  <span className="text-xs font-bold text-[#BF953F]">02</span>
                </div>
                <h2 className="text-lg font-bold uppercase tracking-wider">Shipping Address</h2>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-xs font-bold uppercase tracking-widest text-muted-foreground">First Name</label>
                  <Input 
                    name="firstName"
                    placeholder="John" 
                    value={formState.firstName}
                    onChange={handleInputChange}
                    className="bg-secondary/30 border-border h-12 rounded-xl"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-xs font-bold uppercase tracking-widest text-muted-foreground">Last Name</label>
                  <Input 
                    name="lastName"
                    placeholder="Doe" 
                    value={formState.lastName}
                    onChange={handleInputChange}
                    className="bg-secondary/30 border-border h-12 rounded-xl"
                  />
                </div>
              </div>
              <div className="space-y-2">
                <label className="text-xs font-bold uppercase tracking-widest text-muted-foreground">Street Address</label>
                <Input 
                  name="address"
                  placeholder="Street name and number" 
                  value={formState.address}
                  onChange={handleInputChange}
                  className="bg-secondary/30 border-border h-12 rounded-xl"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-xs font-bold uppercase tracking-widest text-muted-foreground">City</label>
                  <Input 
                    name="city"
                    placeholder="Casablanca" 
                    value={formState.city}
                    onChange={handleInputChange}
                    className="bg-secondary/30 border-border h-12 rounded-xl"
                  />
                </div>
                <div className="space-y-2">
                   <label className="text-xs font-bold uppercase tracking-widest text-muted-foreground">Postal Code</label>
                  <Input 
                    name="postalCode"
                    placeholder="20000" 
                    value={formState.postalCode}
                    onChange={handleInputChange}
                    className="bg-secondary/30 border-border h-12 rounded-xl"
                  />
                </div>
              </div>

              {/* Save Information */}
              <div className="flex items-center gap-3 pt-2">
                <Checkbox id="save-info" />
                <label htmlFor="save-info" className="text-xs font-medium text-muted-foreground cursor-pointer select-none">
                  Save my information for a faster checkout next time
                </label>
              </div>
            </section>

            {/* Terms & Conditions */}
            <div className="pt-4 border-t border-border">
              <p className="text-[10px] text-muted-foreground leading-relaxed">
                By clicking "Complete Order", you agree to PHENIX's <span className="underline cursor-pointer hover:text-foreground">Terms of Service</span> and <span className="underline cursor-pointer hover:text-foreground">Privacy Policy</span>.
              </p>
            </div>

            {/* Payment Info Box */}
            <div className="p-6 rounded-2xl bg-[#BF953F]/5 border border-[#BF953F]/20 flex gap-4">
              <div className="h-10 w-10 rounded-full bg-[#BF953F]/10 flex items-center justify-center shrink-0">
                <Info className="h-5 w-5 text-[#BF953F]" />
              </div>
              <div>
                <h3 className="font-bold text-foreground mb-1 mt-1">Ready to Secure Payment?</h3>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  Clicking the button will take you to our secure Shopify-powered payment gateway to complete your transaction with credit card or local payment methods.
                </p>
              </div>
            </div>
          </div>

          {/* ═══ Right Side: Order Summary ═══════════════════════════ */}
          <div className="w-full lg:w-[400px] shrink-0">
            <div className="sticky top-24 space-y-6">
              <div className="bg-secondary/20 border border-border rounded-2xl p-6 shadow-sm overflow-hidden relative">
                <div className="absolute top-0 right-0 p-4 opacity-5">
                   <ShoppingCart className="h-24 w-24" />
                </div>
                
                <h2 className="font-bold uppercase tracking-wider text-sm mb-6 flex items-center gap-2">
                  <ShoppingCart className="h-4 w-4" /> Order Summary
                </h2>

                <div className="space-y-4 mb-6">
                  {items.map((item) => (
                    <div key={item.variantId} className="flex gap-4 group">
                      <div className="h-16 w-14 bg-secondary rounded-lg overflow-hidden shrink-0 border border-border group-hover:border-[#BF953F]/50 transition-colors">
                        {item.product.node.images.edges[0]?.node && (
                          <img 
                            src={item.product.node.images.edges[0].node.url} 
                            alt={item.product.node.title}
                            className="w-full h-full object-cover"
                          />
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-bold truncate tracking-tight">{item.product.node.title}</p>
                        <p className="text-[10px] text-muted-foreground uppercase tracking-widest mt-0.5">
                          {item.variantTitle !== "Default Title" ? item.variantTitle : "Standard Edition"} × {item.quantity}
                        </p>
                        <p className="text-xs font-bold text-[#BF953F] mt-1">
                          {item.price.currencyCode} {parseFloat(item.price.amount).toFixed(2)}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>

                <div className="space-y-3 pt-6 border-t border-border">
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Subtotal</span>
                    <span className="font-bold">{items[0]?.price.currencyCode} {total.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Shipping</span>
                    <span className="font-bold">{shipping === 0 ? "FREE" : `${items[0]?.price.currencyCode} ${shipping.toFixed(2)}`}</span>
                  </div>
                  <div className="flex justify-between items-end pt-4">
                    <span className="text-lg font-bold uppercase tracking-tighter">Total</span>
                    <div className="text-right">
                      <p className="text-2xl font-black text-[#BF953F]">
                        {items[0]?.price.currencyCode} {(total + shipping).toFixed(2)}
                      </p>
                      <p className="text-[10px] text-muted-foreground uppercase font-bold tracking-widest mt-1 italic">Vat Included</p>
                    </div>
                  </div>
                </div>

                <Button 
                  onClick={handleProceedToPayment}
                  disabled={isLoading}
                  className="w-full h-15 rounded-xl font-bold uppercase tracking-wider text-sm mt-8 bg-black text-white hover:bg-black/90 border-2 border-[#BF953F]/20 shadow-xl transition-all duration-300 flex items-center justify-center gap-3 group"
                >
                  {isLoading ? (
                    <Loader2 className="h-5 w-5 animate-spin" />
                  ) : (
                    <>
                      <span>Pay Now</span>
                      <span className="w-px h-4 bg-white/20" />
                      <span className="text-[#BF953F]">
                        {items[0]?.price.currencyCode} {(total + shipping).toFixed(2)}
                      </span>
                    </>
                  )}
                </Button>

                <div className="mt-6 flex items-center justify-center gap-4 text-muted-foreground">
                  <Lock className="h-3.5 w-3.5" />
                  <span className="text-[10px] font-bold uppercase tracking-widest">Secure Checkout</span>
                </div>
              </div>

              {/* Guarantees */}
              <div className="grid grid-cols-2 gap-3">
                <div className="p-4 rounded-xl bg-secondary/20 border border-border flex flex-col items-center text-center">
                  <Truck className="h-5 w-5 text-[#BF953F] mb-2" />
                  <span className="text-[9px] font-bold uppercase tracking-widest">Fast Delivery</span>
                </div>
                <div className="p-4 rounded-xl bg-secondary/20 border border-border flex flex-col items-center text-center">
                  <ShieldCheck className="h-5 w-5 text-[#BF953F] mb-2" />
                  <span className="text-[9px] font-bold uppercase tracking-widest">Authentic only</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default Checkout;
