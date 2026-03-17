import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useCartStore } from "@/stores/cartStore";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { 
  CreditCard, 
  Truck, 
  ChevronLeft, 
  ShieldCheck, 
  Lock, 
  Info,
  MapPin,
  CheckCircle2,
  Package
} from "lucide-react";

const Checkout = () => {
  const navigate = useNavigate();
  const { items, getCheckoutUrl } = useCartStore();
  const [step, setStep] = useState(1); // 1: Info, 2: Shipping, 3: Payment
  
  const totalPrice = items.reduce((sum, item) => sum + (parseFloat(item.price.amount) * item.quantity), 0);
  const currency = items[0]?.price.currencyCode || "USD";

  // Form states
  const [formData, setFormData] = useState({
    email: "",
    firstName: "",
    lastName: "",
    address: "",
    city: "",
    zipCode: "",
    country: "Morocco"
  });

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  if (items.length === 0) {
    return (
      <div className="min-h-screen bg-background flex flex-col">
        <Navbar />
        <main className="flex-1 flex flex-col items-center justify-center p-6 text-center">
          <Package className="h-16 w-16 text-muted-foreground mb-4 opacity-20" />
          <h1 className="font-display text-3xl font-bold uppercase mb-2">Your cart is empty</h1>
          <p className="text-muted-foreground mb-8">Add some streetwear to your collection before checking out.</p>
          <Button onClick={() => navigate("/collections")} variant="outline" className="rounded-full px-8 border-[#BF953F] text-[#BF953F] hover:bg-[#BF953F] hover:text-black">
            Continue Shopping
          </Button>
        </main>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <Navbar />
      
      {/* ── Checkout Header ────────────────────────────────────────── */}
      <div className="pt-24 pb-8 px-6 md:px-10 max-w-[1400px] mx-auto w-full">
        <div className="flex items-center justify-between mb-8">
          <Button 
            variant="ghost" 
            onClick={() => navigate(-1)} 
            className="group flex items-center gap-2 text-muted-foreground hover:text-foreground p-0"
          >
            <ChevronLeft className="h-4 w-4 transition-transform group-hover:-translate-x-1" />
            <span className="text-xs uppercase font-bold tracking-widest">Back</span>
          </Button>
          
          {/* Stepper */}
          <div className="hidden md:flex items-center gap-4">
            {[
              { id: 1, label: "Information" },
              { id: 2, label: "Shipping" },
              { id: 3, label: "Payment" }
            ].map((s) => (
              <div key={s.id} className="flex items-center gap-3">
                <div className={`h-6 w-6 rounded-full flex items-center justify-center border text-[10px] font-bold ${
                  step >= s.id ? "bg-[#BF953F] border-[#BF953F] text-black" : "border-border text-muted-foreground"
                }`}>
                  {step > s.id ? <CheckCircle2 className="h-3.5 w-3.5" /> : s.id}
                </div>
                <span className={`text-[10px] uppercase font-bold tracking-widest ${
                  step >= s.id ? "text-foreground" : "text-muted-foreground"
                }`}>
                  {s.label}
                </span>
                {s.id < 3 && <div className="h-[1px] w-8 bg-border" />}
              </div>
            ))}
          </div>
        </div>

        <div className="grid lg:grid-cols-12 gap-12">
          {/* ═══ Left Column: Forms ═══════════════════════════════════ */}
          <div className="lg:col-span-7 space-y-10">
            
            {step === 1 && (
              <div className="animate-in fade-in slide-in-from-left-4 duration-500">
                <section className="mb-8">
                  <div className="flex items-center justify-between mb-6">
                    <h2 className="font-display text-2xl font-bold uppercase tracking-wide">Contact Information</h2>
                    <p className="text-xs text-muted-foreground">Already have an account? <Button variant="link" className="p-0 text-[#BF953F]">Log in</Button></p>
                  </div>
                  <div className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="email" className="text-xs font-bold uppercase tracking-[0.1em] text-muted-foreground">Email Address</Label>
                      <Input 
                        id="email" 
                        name="email"
                        placeholder="your@email.com" 
                        value={formData.email}
                        onChange={handleInputChange}
                        className="h-12 bg-secondary/30 rounded-xl border-border focus:ring-[#BF953F] transition-all" 
                      />
                    </div>
                  </div>
                </section>

                <section>
                  <h2 className="font-display text-2xl font-bold uppercase tracking-wide mb-6">Shipping Address</h2>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="firstName" className="text-xs font-bold uppercase tracking-[0.1em] text-muted-foreground">First Name</Label>
                      <Input 
                        id="firstName" 
                        name="firstName"
                        placeholder="John" 
                        value={formData.firstName}
                        onChange={handleInputChange}
                        className="h-12 bg-secondary/30 rounded-xl border-border focus:ring-[#BF953F]" 
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="lastName" className="text-xs font-bold uppercase tracking-[0.1em] text-muted-foreground">Last Name</Label>
                      <Input 
                        id="lastName" 
                        name="lastName"
                        placeholder="Doe" 
                        value={formData.lastName}
                        onChange={handleInputChange}
                        className="h-12 bg-secondary/30 rounded-xl border-border focus:ring-[#BF953F]" 
                      />
                    </div>
                    <div className="col-span-2 space-y-2">
                      <Label htmlFor="address" className="text-xs font-bold uppercase tracking-[0.1em] text-muted-foreground">Street Address</Label>
                      <Input 
                        id="address" 
                        name="address"
                        placeholder="123 Street Name" 
                        value={formData.address}
                        onChange={handleInputChange}
                        className="h-12 bg-secondary/30 rounded-xl border-border focus:ring-[#BF953F]" 
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="city" className="text-xs font-bold uppercase tracking-[0.1em] text-muted-foreground">City</Label>
                      <Input 
                        id="city" 
                        name="city"
                        placeholder="Casablanca" 
                        value={formData.city}
                        onChange={handleInputChange}
                        className="h-12 bg-secondary/30 rounded-xl border-border focus:ring-[#BF953F]" 
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="zipCode" className="text-xs font-bold uppercase tracking-[0.1em] text-muted-foreground">ZIP / Postal Code</Label>
                      <Input 
                        id="zipCode" 
                        name="zipCode"
                        placeholder="20000" 
                        value={formData.zipCode}
                        onChange={handleInputChange}
                        className="h-12 bg-secondary/30 rounded-xl border-border focus:ring-[#BF953F]" 
                      />
                    </div>
                  </div>
                </section>

                <div className="mt-10 flex justify-end">
                  <Button 
                    onClick={() => setStep(2)}
                    className="h-14 px-10 rounded-full font-bold uppercase tracking-widest bg-foreground text-background hover:bg-[#BF953F] hover:text-black transition-all"
                  >
                    Continue to Shipping
                  </Button>
                </div>
              </div>
            )}

            {step === 2 && (
              <div className="animate-in fade-in slide-in-from-right-4 duration-500">
                <section>
                  <h2 className="font-display text-2xl font-bold uppercase tracking-wide mb-6">Shipping Method</h2>
                  <div className="space-y-4">
                    <div className="flex items-center justify-between p-4 bg-secondary/30 rounded-2xl border-2 border-primary cursor-pointer hover:bg-secondary/50 transition-all">
                      <div className="flex items-center gap-4">
                        <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center text-primary">
                          <Truck className="h-5 w-5" />
                        </div>
                        <div>
                          <p className="font-bold text-sm uppercase tracking-wide">Standard Shipping</p>
                          <p className="text-xs text-muted-foreground">Deliver in 3-5 business days</p>
                        </div>
                      </div>
                      <p className="font-bold text-sm">FREE</p>
                    </div>
                    
                    <div className="flex items-center justify-between p-4 bg-secondary/10 rounded-2xl border border-border cursor-pointer hover:bg-secondary/30 hover:border-[#BF953F]/50 transition-all">
                      <div className="flex items-center gap-4">
                        <div className="h-10 w-10 rounded-full bg-muted flex items-center justify-center text-muted-foreground">
                          <ShieldCheck className="h-5 w-5" />
                        </div>
                        <div>
                          <p className="font-bold text-sm uppercase tracking-wide">Express Delivery</p>
                          <p className="text-xs text-muted-foreground">Deliver in 1-2 business days</p>
                        </div>
                      </div>
                      <p className="font-bold text-sm">35.00 {currency}</p>
                    </div>
                  </div>
                </section>

                <div className="mt-10 flex items-center justify-between">
                  <Button variant="ghost" onClick={() => setStep(1)} className="text-xs font-bold uppercase tracking-widest text-[#BF953F] hover:bg-[#BF953F]/10">
                    Return to Information
                  </Button>
                  <Button 
                    onClick={() => setStep(3)}
                    className="h-14 px-10 rounded-full font-bold uppercase tracking-widest bg-foreground text-background hover:bg-[#BF953F] hover:text-black transition-all"
                  >
                    Continue to Payment
                  </Button>
                </div>
              </div>
            )}

            {step === 3 && (
              <div className="animate-in fade-in slide-in-from-right-4 duration-500">
                <section>
                  <h2 className="font-display text-2xl font-bold uppercase tracking-wide mb-6">Payment Method</h2>
                  <div className="p-6 bg-[#0a0a0a] rounded-3xl border border-[#BF953F]/30 overflow-hidden relative">
                    <div className="absolute top-0 right-0 p-4 opacity-10">
                      <CreditCard className="h-40 w-40" />
                    </div>
                    
                    <div className="relative z-10">
                      <div className="flex items-center gap-3 mb-8">
                        <Lock className="h-4 w-4 text-[#BF953F]" />
                        <span className="text-[10px] uppercase font-bold tracking-[0.2em] text-[#BF953F]">Secure Encrypted Payment</span>
                      </div>
                      
                      <p className="text-sm text-muted-foreground mb-8 leading-relaxed">
                        Wait! PHENIX streetwear currently uses Shopify's ultra-secure checkout for all payments. 
                        Clicking the button below will securely transfer your order to complete payment via Card, Apple Pay, or PayPal.
                      </p>

                      <div className="flex flex-col gap-4">
                        <div className="flex items-center gap-4 p-4 bg-background/50 rounded-xl border border-border">
                          <CheckCircle2 className="h-5 w-5 text-[#BF953F]" />
                          <span className="text-sm font-medium">Safe & Secure Transaction</span>
                        </div>
                        <div className="flex items-center gap-4 p-4 bg-background/50 rounded-xl border border-border">
                          <CheckCircle2 className="h-5 w-5 text-[#BF953F]" />
                          <span className="text-sm font-medium">Buyer Protection Guarantee</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </section>

                <div className="mt-10 flex items-center justify-between">
                  <Button variant="ghost" onClick={() => setStep(2)} className="text-xs font-bold uppercase tracking-widest text-[#BF953F] hover:bg-[#BF953F]/10">
                    Return to Shipping
                  </Button>
                  <Button 
                    onClick={() => {
                      const url = getCheckoutUrl();
                      if (url) window.location.href = url;
                    }}
                    className="h-14 px-10 rounded-full font-bold uppercase tracking-widest bg-gradient-to-r from-[#BF953F] via-[#FCF6BA] to-[#B38728] text-black shadow-lg hover:shadow-[0_0_20px_rgba(191,149,63,0.4)] transition-all"
                  >
                    Complete My Order
                  </Button>
                </div>
              </div>
            )}
          </div>

          {/* ═══ Right Column: Order Summary ══════════════════════════ */}
          <div className="lg:col-span-5">
            <div className="sticky top-24 bg-secondary/10 rounded-3xl border border-border p-8 backdrop-blur-sm self-start">
              <h3 className="font-display text-xl font-bold uppercase tracking-wide mb-6 flex items-center gap-3">
                Order Summary
                <span className="h-5 w-5 rounded-full bg-primary text-primary-foreground text-[10px] flex items-center justify-center">{items.length}</span>
              </h3>
              
              <div className="space-y-6 mb-8 max-h-[40vh] overflow-y-auto pr-2 custom-scrollbar">
                {items.map((item) => (
                  <div key={item.variantId} className="flex gap-4">
                    <div className="h-20 w-16 bg-secondary rounded-xl overflow-hidden shrink-0 border border-border/50">
                      {item.product.node.images.edges[0]?.node && (
                        <img 
                          src={item.product.node.images.edges[0].node.url} 
                          alt={item.product.node.title} 
                          className="h-full w-full object-cover"
                        />
                      )}
                    </div>
                    <div className="flex-1 min-w-0 flex flex-col justify-center">
                      <h4 className="text-sm font-bold uppercase truncate tracking-tight">{item.product.node.title}</h4>
                      <div className="flex items-center flex-wrap gap-2 mt-1">
                        {item.selectedOptions.map(opt => (
                          <span key={opt.name} className="text-[10px] bg-secondary px-2 py-0.5 rounded-full uppercase font-bold text-muted-foreground tracking-tighter">
                            {opt.value}
                          </span>
                        ))}
                      </div>
                      <p className="text-[10px] text-muted-foreground mt-1 font-bold">Qty: {item.quantity}</p>
                    </div>
                    <div className="text-right flex flex-col justify-center">
                      <p className="text-sm font-bold">{(parseFloat(item.price.amount) * item.quantity).toFixed(2)} {currency}</p>
                    </div>
                  </div>
                ))}
              </div>

              {/* Promo Code */}
              <div className="mb-8 pt-6 border-t border-border">
                <div className="flex gap-2">
                  <Input 
                    placeholder="Promo Code" 
                    className="h-11 bg-background border-border rounded-xl focus:ring-[#BF953F]"
                  />
                  <Button variant="outline" className="h-11 rounded-xl border-[#BF953F] text-[#BF953F] hover:bg-[#BF953F] hover:text-black font-bold uppercase text-[10px] tracking-widest px-6">
                    Apply
                  </Button>
                </div>
              </div>

              <div className="border-t border-dashed border-border py-6 space-y-3 font-medium">
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground uppercase tracking-widest text-[10px] font-bold">Subtotal</span>
                  <span>{totalPrice.toFixed(2)} {currency}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground uppercase tracking-widest text-[10px] font-bold">Shipping</span>
                  <span className="text-green-500 font-bold uppercase text-[10px]">Free</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground uppercase tracking-widest text-[10px] font-bold">Estimated Taxes</span>
                  <span>0.00 {currency}</span>
                </div>
              </div>

              <div className="border-t border-border pt-6 mt-4">
                <div className="flex justify-between items-end">
                  <div className="flex flex-col">
                    <span className="text-[10px] uppercase font-black tracking-[0.2em] text-[#BF953F]">Total Amount</span>
                    <p className="text-3xl font-black">{totalPrice.toFixed(2)} {currency}</p>
                  </div>
                  <div className="p-2 bg-[#BF953F]/10 rounded-lg text-[#BF953F]" title="Secure Payment">
                    <ShieldCheck className="h-6 w-6" />
                  </div>
                </div>
              </div>

              <div className="mt-8 p-4 bg-primary/5 rounded-2xl flex items-start gap-3">
                <Info className="h-4 w-4 text-primary shrink-0 mt-0.5" />
                <p className="text-[10px] leading-relaxed text-muted-foreground">
                  By completing your order, you agree to PHENIX's <span className="underline cursor-pointer">Terms of Service</span> and <span className="underline cursor-pointer">Privacy Policy</span>.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <Footer />
    </div>
  );
};

export default Checkout;
