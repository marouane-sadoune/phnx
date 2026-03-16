import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { ShoppingCart, Minus, Plus, Trash2, ArrowRight, Loader2 } from "lucide-react";
import { useCartStore } from "@/stores/cartStore";
import { useNavigate } from "react-router-dom";
import * as pixel from "@/lib/pixel";

export const CartDrawer = () => {
  const navigate = useNavigate();
  const { 
    items, 
    isLoading, 
    isSyncing, 
    updateQuantity, 
    removeItem, 
    getCheckoutUrl, 
    syncCart,
    isDrawerOpen,
    setDrawerOpen
  } = useCartStore();
  const totalItems = items.reduce((sum, item) => sum + item.quantity, 0);
  const totalPrice = items.reduce((sum, item) => sum + (parseFloat(item.price.amount) * item.quantity), 0);

  useEffect(() => { if (isDrawerOpen) syncCart(); }, [isDrawerOpen, syncCart]);

  const handleCheckout = () => {
    const checkoutUrl = getCheckoutUrl();
    if (checkoutUrl) {
      // Track InitiateCheckout
      pixel.event('InitiateCheckout', {
        num_items: totalItems,
        value: totalPrice,
        currency: items[0]?.price.currencyCode || 'USD',
        content_ids: items.map(i => i.variantId),
        content_type: 'product'
      });
      
      setDrawerOpen(false);
      navigate("/checkout");
    }
  };

  return (
    <Sheet open={isDrawerOpen} onOpenChange={setDrawerOpen}>
      <SheetTrigger asChild>
        <button className="relative p-2 text-muted-foreground hover:text-foreground transition-colors">
          <ShoppingCart className="h-5 w-5" />
          {totalItems > 0 && (
            <Badge className="absolute -top-1 -right-1 h-4 w-4 rounded-full p-0 flex items-center justify-center text-[10px] bg-gradient-to-r from-[#BF953F] via-[#FCF6BA] to-[#B38728] text-black font-bold border-none">
              {totalItems}
            </Badge>
          )}
        </button>
      </SheetTrigger>
      <SheetContent className="w-full sm:max-w-lg flex flex-col h-full bg-background border-border">
        <SheetHeader className="flex-shrink-0">
          <SheetTitle className="font-display text-foreground">Shopping Cart</SheetTitle>
          <SheetDescription className="text-muted-foreground">
            {totalItems === 0 ? "Your cart is empty" : `${totalItems} item${totalItems !== 1 ? 's' : ''} in your cart`}
          </SheetDescription>
        </SheetHeader>
        <div className="flex flex-col flex-1 pt-6 min-h-0">
          {items.length === 0 ? (
            <div className="flex-1 flex items-center justify-center">
              <div className="text-center">
                <ShoppingCart className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <p className="text-muted-foreground">Your cart is empty</p>
              </div>
            </div>
          ) : (
            <>
              <div className="flex-1 overflow-y-auto pr-2 min-h-0">
                <div className="space-y-4">
                  {items.map((item) => (
                    <div key={item.variantId} className="flex gap-4 p-2">
                      <div className="w-16 h-16 bg-secondary rounded-md overflow-hidden flex-shrink-0">
                        {item.product.node.images?.edges?.[0]?.node && (
                          <img src={item.product.node.images.edges[0].node.url} alt={item.product.node.title} className="w-full h-full object-cover" />
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <h4 className="font-display font-medium text-foreground truncate text-sm">{item.product.node.title}</h4>
                        <p className="text-xs text-muted-foreground">{item.selectedOptions.map(o => o.value).join(' • ')}</p>
                        <div className="flex items-center gap-2">
                          <p className="font-semibold text-primary text-sm">{item.price.currencyCode} {parseFloat(item.price.amount).toFixed(2)}</p>
                          {item.compareAtPrice && parseFloat(item.compareAtPrice.amount) > parseFloat(item.price.amount) && (
                            <span className="text-xs text-muted-foreground line-through decoration-muted-foreground/50">
                              {item.compareAtPrice.currencyCode} {parseFloat(item.compareAtPrice.amount).toFixed(2)}
                            </span>
                          )}
                        </div>
                      </div>
                      <div className="flex flex-col items-end gap-2 flex-shrink-0">
                        <Button variant="ghost" size="icon" className="h-6 w-6 text-muted-foreground" onClick={() => removeItem(item.variantId)}>
                          <Trash2 className="h-3 w-3" />
                        </Button>
                        <div className="flex items-center gap-1">
                          <Button variant="outline" size="icon" className="h-6 w-6" onClick={() => updateQuantity(item.variantId, item.quantity - 1)}>
                            <Minus className="h-3 w-3" />
                          </Button>
                          <span className="w-8 text-center text-xs text-foreground">{item.quantity}</span>
                          <Button variant="outline" size="icon" className="h-6 w-6" onClick={() => updateQuantity(item.variantId, item.quantity + 1)}>
                            <Plus className="h-3 w-3" />
                          </Button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
              <div className="flex-shrink-0 space-y-4 pt-4 border-t border-border">
                <div className="flex justify-between items-center">
                  <span className="text-lg font-display font-semibold text-foreground">Total</span>
                  <span className="text-xl font-bold text-primary">{items[0]?.price.currencyCode || '$'} {totalPrice.toFixed(2)}</span>
                </div>
                <Button onClick={handleCheckout} className="w-full bg-gradient-to-r from-[#BF953F] via-[#FCF6BA] to-[#B38728] text-black hover:scale-[1.02] hover:shadow-[0_0_15px_rgba(191,149,63,0.4)] transition-all duration-300 font-bold" size="lg" disabled={items.length === 0 || isLoading || isSyncing}>
                  {isLoading || isSyncing ? <Loader2 className="w-4 h-4 animate-spin" /> : <><ArrowRight className="w-4 h-4 mr-2" />Checkout</>}
                </Button>
              </div>
            </>
          )}
        </div>
      </SheetContent>
    </Sheet>
  );
};
