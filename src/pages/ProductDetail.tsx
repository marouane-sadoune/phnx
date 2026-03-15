import { useEffect, useState, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { fetchProductByHandle, fetchProducts } from "@/lib/shopify";
import { useCartStore } from "@/stores/cartStore";
import { useRecentlyViewed } from "@/hooks/useRecentlyViewed";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { ProductCard } from "@/components/ProductCard";
import { Button } from "@/components/ui/button";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { toast } from "sonner";
import { ArrowLeft, Loader2, ShoppingCart, ChevronRight, Truck, ShieldCheck, Droplets } from "lucide-react";

/* ─── Color Map (Matches Collections page) ────────────── */
const COLOUR_MAP: Record<string, string> = {
  black: "#111111", white: "#ffffff", red: "#e53e3e", blue: "#3182ce",
  green: "#4a7c59", olive: "#6b7c3e", grey: "#718096", gray: "#718096",
  yellow: "#f6c90e", beige: "#f5e6c8", pink: "#ed64a6", orange: "#ed8936",
  purple: "#805ad5", brown: "#744210", navy: "#1a365d", cream: "#fffdd0",
  rainbow: "conic-gradient(red,orange,yellow,green,blue,indigo,violet,red)",
  multicolor: "conic-gradient(red,orange,yellow,green,blue,indigo,violet,red)",
};

/* ─── Main Component ────────────────────────────────────── */
const ProductDetail = () => {
  const { handle } = useParams<{ handle: string }>();
  const navigate = useNavigate();
  const [product, setProduct] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [selectedVariantIndex, setSelectedVariantIndex] = useState(0);
  const [selectedImage, setSelectedImage] = useState(0);
  const [zoomPos, setZoomPos] = useState({ x: 50, y: 50 });
  const [isZooming, setIsZooming] = useState(false);
  const [quantity, setQuantity] = useState(1);
  const [otherProducts, setOtherProducts] = useState<any[]>([]);

  const addItem = useCartStore(state => state.addItem);
  const isCartLoading = useCartStore(state => state.isLoading);
  const { addProduct } = useRecentlyViewed();

  const imgRef = useRef<HTMLDivElement>(null);
  const addToCartRef = useRef<HTMLDivElement>(null);
  const [showSticky, setShowSticky] = useState(false);

  useEffect(() => {
    if (!handle) return;
    window.scrollTo(0, 0);
    setLoading(true);

    // Fetch product details and a batch of other products in parallel
    Promise.all([
      fetchProductByHandle(handle),
      fetchProducts(12)
    ])
      .then(([p, allProducts]) => {
        setProduct(p);
        setSelectedImage(0);
        setSelectedVariantIndex(0);
        if (p) addProduct({ node: p });

        // Pick 4 random products for the "Other Products" section
        const others = allProducts
          .filter(op => op.node.handle !== handle)
          .sort(() => 0.5 - Math.random())
          .slice(0, 4);
        setOtherProducts(others);
      })
      .catch(console.error)
      .finally(() => setLoading(false));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [handle]);

  useEffect(() => {
    const handleScroll = () => {
      if (addToCartRef.current) {
        const rect = addToCartRef.current.getBoundingClientRect();
        // Show sticky bar when the original Add To Cart button scrolls out of view (above the viewport)
        setShowSticky(rect.bottom < 0);
      }
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <div className="pt-20 flex items-center justify-center min-h-[60vh]">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <div className="pt-20 flex flex-col items-center justify-center min-h-[60vh]">
          <p className="text-muted-foreground mb-4 font-medium">Product not found</p>
          <Button variant="outline" onClick={() => navigate("/")} className="rounded-full px-6">
            <ArrowLeft className="mr-2 h-4 w-4" /> Back to store
          </Button>
        </div>
      </div>
    );
  }

  const images = product.images.edges;
  const variants = product.variants.edges;
  const selectedVariant = variants[selectedVariantIndex]?.node;

  const handleAddToCart = async () => {
    if (!selectedVariant) return;
    await addItem({
      product: { node: product },
      variantId: selectedVariant.id,
      variantTitle: selectedVariant.title,
      price: selectedVariant.price,
      quantity: quantity,
      selectedOptions: selectedVariant.selectedOptions || [],
    });
    toast.success("Added to cart", { position: "top-center" });
  };

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!imgRef.current) return;
    const { left, top, width, height } = imgRef.current.getBoundingClientRect();
    const x = ((e.clientX - left) / width) * 100;
    const y = ((e.clientY - top) / height) * 100;
    setZoomPos({ x, y });
  };

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <main className="pt-[5.5rem] px-6 md:px-10 max-w-[1400px] mx-auto pb-10">

        {/* Breadcrumb */}
        <nav className="flex items-center text-xs font-medium text-muted-foreground mb-6 overflow-hidden w-full whitespace-nowrap">
          <button onClick={() => navigate("/")} className="hover:text-foreground transition-colors">Home</button>
          <ChevronRight className="h-3.5 w-3.5 mx-1" />
          <button onClick={() => navigate("/collections")} className="hover:text-foreground transition-colors">Collections</button>
          <ChevronRight className="h-3.5 w-3.5 mx-1" />
          <span className="text-foreground truncate">{product.title}</span>
        </nav>

        <div className="grid lg:grid-cols-12 gap-8 lg:gap-14">

          {/* ═══ Image Gallery ════════════════════════════════════ */}
          <div className="lg:col-span-7 flex flex-col-reverse md:flex-row gap-4 h-fit">

            {/* Thumbnails (Vertical on desktop, Horizontal on mobile) */}
            {images.length > 1 && (
              <div className="flex md:flex-col gap-3 overflow-x-auto md:overflow-y-auto scrollbar-hide md:w-20 lg:w-24 shrink-0 snap-x">
                {images.map((img: any, i: number) => (
                  <button
                    key={i}
                    onClick={() => setSelectedImage(i)}
                    className={`
                      relative w-16 h-20 md:w-full md:h-24 lg:h-32 rounded-lg overflow-hidden shrink-0 snap-start
                      transition-all duration-200 border-2
                      ${i === selectedImage ? "border-primary ring-2 ring-primary/20 ring-offset-2" : "border-transparent hover:opacity-80"}
                    `}
                  >
                    <img
                      src={img.node.url}
                      alt=""
                      className="w-full h-full object-cover bg-secondary block"
                    />
                  </button>
                ))}
              </div>
            )}

            {/* Main Image with Zoom */}
            <div
              ref={imgRef}
              className="relative w-full aspect-[4/5] bg-secondary rounded-xl overflow-hidden cursor-crosshair group flex-1"
              onMouseEnter={() => setIsZooming(true)}
              onMouseLeave={() => setIsZooming(false)}
              onMouseMove={handleMouseMove}
            >
              {images[selectedImage]?.node ? (
                <>
                  {/* Default Image */}
                  <img
                    src={images[selectedImage].node.url}
                    alt={images[selectedImage].node.altText || product.title}
                    className={`w-full h-full object-cover transition-opacity duration-300 ${isZooming ? "opacity-0" : "opacity-100"}`}
                  />
                  {/* Zoomed Image */}
                  <div
                    className={`absolute inset-0 w-full h-full bg-no-repeat transition-opacity duration-300 ${isZooming ? "opacity-100" : "opacity-0"}`}
                    style={{
                      backgroundImage: `url(${images[selectedImage].node.url})`,
                      backgroundPosition: `${zoomPos.x}% ${zoomPos.y}%`,
                      backgroundSize: '200%' // Zoom level
                    }}
                  />
                </>
              ) : (
                <div className="w-full h-full flex flex-col items-center justify-center text-muted-foreground">
                  No image available
                </div>
              )}

              {/* Badges on image */}
              {!selectedVariant?.availableForSale && (
                <span className="absolute top-4 left-4 bg-background/90 backdrop-blur-sm text-foreground px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider border border-border">
                  Out of Stock
                </span>
              )}
            </div>
          </div>

          {/* ═══ Product Info ═══════════════════════════════════ */}
          <div className="lg:col-span-5 flex flex-col">
            <h1 className="font-display text-3xl md:text-5xl font-bold uppercase tracking-wide text-foreground leading-tight">
              {product.title}
            </h1>

            {/* Star Rating Mock */}
            <div className="flex items-center gap-2 mt-3 mb-1">
              <div className="flex text-yellow-400 text-lg leading-none">
                <span>★</span><span>★</span><span>★</span><span>★</span><span className="text-muted-foreground/30">★</span>
              </div>
              <span className="text-sm font-medium text-muted-foreground mt-0.5">4.0/5</span>
            </div>

            <div className="flex items-end gap-3 mt-4">
              <p className="text-3xl font-bold">
                {selectedVariant?.price.currencyCode} {parseFloat(selectedVariant?.price.amount || "0").toFixed(2)}
              </p>
              {selectedVariant?.compareAtPrice && (
                <>
                  <p className="text-xl text-muted-foreground line-through decoration-muted-foreground/50 mb-0.5">
                    {selectedVariant.compareAtPrice.currencyCode} {parseFloat(selectedVariant.compareAtPrice.amount).toFixed(2)}
                  </p>
                  <span className="mb-1.5 bg-red-100 text-red-600 text-xs font-bold px-2 py-0.5 rounded-md">
                    -{Math.round((1 - parseFloat(selectedVariant?.price.amount || "0") / parseFloat(selectedVariant.compareAtPrice.amount)) * 100)}%
                  </span>
                </>
              )}
            </div>

            {product.description && (
              <p className="text-muted-foreground leading-relaxed text-sm mt-6">
                {product.description}
              </p>
            )}

            <div className="border-b border-border w-full my-8" />

            {/* Options Selector */}
            {product.options?.map((option: any, index: number) => {
              const optName = option.name.toLowerCase();
              const isColor = optName === "color" || optName === "couleur";
              const isSize = optName === "size" || optName === "taille";
              const displayText = option.name.toLowerCase() === "denominations" ? "Filters" : option.name;
              const prefix = isColor ? "Select" : isSize ? "Choose" : "Select";

              return (
                <div key={option.name} className={`mb-6 pb-6 ${index !== product.options.length - 1 ? 'border-b border-border' : ''}`}>
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-sm font-medium text-foreground">
                      {prefix} {displayText}
                    </span>
                    {selectedVariant && !isColor && !isSize && (
                      <span className="text-sm text-muted-foreground">
                        {selectedVariant.selectedOptions.find((o: any) => o.name === option.name)?.value}
                      </span>
                    )}
                  </div>

                  <div className="flex flex-wrap gap-2.5">
                    {option.values.map((value: string) => {
                      const variantIndex = variants.findIndex(
                        (v: any) => v.node.selectedOptions.some((o: any) => o.name === option.name && o.value === value)
                      );
                      const isSelected = selectedVariant?.selectedOptions.some(
                        (o: any) => o.name === option.name && o.value === value
                      );
                      const isAvailable = variantIndex !== -1 && variants[variantIndex].node.availableForSale;

                      if (isColor) {
                        const bg = COLOUR_MAP[value.toLowerCase()] || value.toLowerCase();
                        const isGrad = bg.startsWith("conic");
                        return (
                          <button
                            key={value}
                            onClick={() => variantIndex >= 0 && setSelectedVariantIndex(variantIndex)}
                            title={value}
                            className={`
                              relative h-10 w-10 rounded-full transition-all duration-200
                              ${isSelected ? "ring-2 ring-primary ring-offset-2 scale-110" : "hover:scale-105"}
                              ${!isAvailable && !isSelected ? "opacity-40" : ""}
                              ${bg === "#ffffff" ? "border border-border" : ""}
                            `}
                            style={isGrad ? { backgroundImage: bg } : { backgroundColor: bg }}
                          >
                            {!isAvailable && (
                              <div className="absolute inset-0 flex items-center justify-center overflow-hidden rounded-full">
                                <div className="w-full h-px bg-red-500 rotate-45 transform origin-center border-y border-background" />
                              </div>
                            )}
                          </button>
                        );
                      }

                      return (
                        <button
                          key={value}
                          onClick={() => variantIndex >= 0 && setSelectedVariantIndex(variantIndex)}
                          className={`
                            min-w-[3rem] px-4 py-3 rounded-xl text-sm font-semibold transition-all duration-200 border-2
                            ${isSelected
                              ? "border-primary bg-primary text-primary-foreground shadow-md"
                              : "border-border text-foreground hover:border-primary/50 bg-background"
                            }
                            ${!isAvailable && !isSelected ? "opacity-30 line-through bg-secondary text-muted-foreground border-transparent" : ""}
                          `}
                        >
                          {value}
                        </button>
                      );
                    })}
                  </div>
                </div>
              );
            })}

            {/* Add to Cart Area */}
            <div className="mt-6" ref={addToCartRef}>
              <Button
                onClick={handleAddToCart}
                disabled={isCartLoading || !selectedVariant?.availableForSale}
                className={`
                  w-full h-14 rounded-full text-base font-bold transition-all duration-300
                  ${!selectedVariant?.availableForSale
                    ? "bg-secondary text-muted-foreground cursor-not-allowed"
                    : "bg-[#222222] text-white hover:bg-black hover:scale-[1.01] shadow-lg"
                  }
                `}
              >
                {isCartLoading ? (
                  <span className="flex items-center gap-2"><Loader2 className="h-5 w-5 animate-spin" /> Processing</span>
                ) : !selectedVariant?.availableForSale ? (
                  "Sold Out"
                ) : (
                  <span className="flex items-center gap-2"><ShoppingCart className="h-5 w-5" /> Add to Cart</span>
                )}
              </Button>
            </div>

            {/* Accordions */}
            <div className="mt-10">
              <Accordion type="single" collapsible className="w-full space-y-2">

                <AccordionItem value="shipping" className="bg-secondary/40 rounded-xl px-4 border-none data-[state=open]:bg-secondary/60">
                  <AccordionTrigger className="text-sm font-bold uppercase tracking-widest py-5 hover:no-underline flex items-center gap-2">
                    <span className="flex items-center gap-3"><Truck className="h-4 w-4" /> Shipping & Returns</span>
                  </AccordionTrigger>
                  <AccordionContent className="text-muted-foreground leading-relaxed text-sm pb-5 space-y-3">
                    <p><strong className="text-foreground">Free Standard Shipping</strong> on local orders over 1,000 MAD. Delivery within 2-4 business days.</p>
                    <p><strong className="text-foreground">Express Shipping</strong> available at checkout. Delivery within 24-48 hours.</p>
                    <p>Returns accepted within 14 days of receipt for unused items in original packaging. View our full return policy for details.</p>
                  </AccordionContent>
                </AccordionItem>

                <AccordionItem value="care" className="bg-secondary/40 rounded-xl px-4 border-none data-[state=open]:bg-secondary/60">
                  <AccordionTrigger className="text-sm font-bold uppercase tracking-widest py-5 hover:no-underline flex items-center gap-2">
                    <span className="flex items-center gap-3"><Droplets className="h-4 w-4" /> Care Instructions</span>
                  </AccordionTrigger>
                  <AccordionContent className="text-muted-foreground leading-relaxed text-sm pb-5">
                    <ul className="list-disc pl-5 space-y-1.5 marker:text-primary">
                      <li>Machine wash cold with like colors</li>
                      <li>Do not bleach</li>
                      <li>Tumble dry low or hang dry</li>
                      <li>Iron on low heat if needed</li>
                      <li>Do not dry clean</li>
                    </ul>
                  </AccordionContent>
                </AccordionItem>

                <AccordionItem value="authenticity" className="bg-secondary/40 rounded-xl px-4 border-none data-[state=open]:bg-secondary/60">
                  <AccordionTrigger className="text-sm font-bold uppercase tracking-widest py-5 hover:no-underline flex items-center gap-2">
                    <span className="flex items-center gap-3"><ShieldCheck className="h-4 w-4" /> Authenticity</span>
                  </AccordionTrigger>
                  <AccordionContent className="text-muted-foreground leading-relaxed text-sm pb-5">
                    Every piece is crafted with premium materials and goes through strict quality control. Guaranteed 100% authentic PHENIX apparel.
                  </AccordionContent>
                </AccordionItem>

              </Accordion>
            </div>

          </div>
        </div>
      </main>

      {/* ── Other Products ───────────────────────────── */}
      {otherProducts.length > 0 && (
        <section className="bg-secondary/20 border-t border-border mt-10">
          <div className="max-w-[1400px] mx-auto px-6 md:px-10 py-16">
            <h2 className="font-display text-2xl font-bold uppercase tracking-wide mb-8">
              Other Products You Might Like
            </h2>
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
              {otherProducts.map((p) => (
                <ProductCard key={p.node.id} product={p} />
              ))}
            </div>
          </div>
        </section>
      )}

      <Footer />

      {/* Sticky Add to Cart */}
      <div className={`bls__sticky-addcart fixed bottom-0 left-0 right-0 z-50 bg-background/95 backdrop-blur-md border-t border-border py-4 shadow-[0_-10px_40px_rgba(0,0,0,0.1)] ${showSticky ? 'sticky-addcart-show' : ''}`}>
        <div className="max-w-[1400px] mx-auto px-6 md:px-10 flex flex-col md:flex-row items-center justify-between gap-4">
          
          {/* Left Side: Product Info */}
          <div className="flex items-center gap-4 w-full md:w-auto overflow-hidden">
            <img src={images[selectedImage]?.node.url} alt="" className="w-12 h-16 object-cover rounded-md bg-secondary shrink-0 hidden md:block" />
            <div className="min-w-0 flex flex-col justify-center">
              <p className="font-bold text-sm truncate">{product.title}</p>
              <div className="flex items-center gap-2 mt-0.5">
                <p className="text-sm font-bold text-[#e53e3e]">
                  {selectedVariant?.price.currencyCode} {parseFloat(selectedVariant?.price.amount || "0").toFixed(2)}
                </p>
                {selectedVariant?.compareAtPrice && (
                  <span className="text-xs text-muted-foreground line-through decoration-muted-foreground/50">
                    {selectedVariant.compareAtPrice.currencyCode} {parseFloat(selectedVariant.compareAtPrice.amount).toFixed(2)}
                  </span>
                )}
              </div>
            </div>
          </div>

          {/* Right Side: Actions */}
          <div className="flex flex-wrap sm:flex-nowrap items-center gap-3 w-full md:w-auto shrink-0 justify-end">
            
            {/* Variant Selector */}
            <div className="relative w-full sm:w-auto sm:min-w-[240px]">
              <select
                value={selectedVariantIndex}
                onChange={(e) => setSelectedVariantIndex(Number(e.target.value))}
                className="w-full appearance-none bg-background border border-border/80 rounded-full h-12 px-6 text-sm font-medium focus:outline-none focus:border-primary pr-10 hover:border-border transition-colors cursor-pointer"
              >
                {variants.map((v: any, idx: number) => {
                  const optionsStr = v.node.selectedOptions
                     .filter((o: any) => o.name.toLowerCase() !== "denominations")
                     .map((o: any) => o.value)
                     .join(' / ');
                  const title = optionsStr || v.node.title || "Default Title";
                  const price = `${v.node.price.currencyCode === 'USD' ? '$' : ''}${parseFloat(v.node.price.amount).toFixed(2)}`;
                  return (
                    <option key={v.node.id} value={idx}>
                      {title} - {price}
                    </option>
                  );
                })}
              </select>
              <div className="absolute right-5 top-1/2 -translate-y-1/2 pointer-events-none text-muted-foreground">
                <svg width="10" height="6" viewBox="0 0 10 6" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M1 1L5 5L9 1" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/></svg>
              </div>
            </div>

            {/* Quantity Selector */}
            <div className="flex items-center border border-border/80 rounded-full h-12 bg-secondary/20 shrink-0 w-full sm:w-auto sm:min-w-[120px]">
              <button 
                onClick={() => setQuantity(Math.max(1, quantity - 1))}
                className="flex-1 h-full flex items-center justify-center text-muted-foreground hover:text-foreground transition-colors"
              >
                <svg width="12" height="2" viewBox="0 0 12 2" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M1 1H11" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/></svg>
              </button>
              <span className="w-10 text-center text-sm font-medium text-primary">
                {quantity}
              </span>
              <button 
                onClick={() => setQuantity(quantity + 1)}
                className="flex-1 h-full flex items-center justify-center text-muted-foreground hover:text-foreground transition-colors"
              >
                <svg width="12" height="12" viewBox="0 0 12 12" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M6 1V11M1 6H11" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/></svg>
              </button>
            </div>

            {/* Add to Cart Button */}
            <Button
                onClick={handleAddToCart}
                disabled={isCartLoading || !selectedVariant?.availableForSale}
                className={`w-full sm:w-auto sm:min-w-[200px] h-12 rounded-full text-sm font-bold tracking-widest uppercase transition-all duration-300 ${!selectedVariant?.availableForSale ? "bg-secondary text-muted-foreground cursor-not-allowed" : "bg-[#111111] text-white hover:bg-black hover:scale-[1.02] shadow-md"}`}
            >
                {isCartLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : !selectedVariant?.availableForSale ? "Sold Out" : "Add to Cart"}
            </Button>

          </div>
        </div>
      </div>
    </div>
  );
};

export default ProductDetail;
