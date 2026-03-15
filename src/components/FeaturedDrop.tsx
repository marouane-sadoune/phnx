import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "./ui/button";
import { ArrowRight, Zap, Loader2 } from "lucide-react";
import { fetchProductByHandle } from "@/lib/shopify";
import productImg from "@/assets/product.jpeg";
import productBackImg from "@/assets/product-back.jpeg";

export const FeaturedDrop = () => {
    const navigate = useNavigate();
    const [product, setProduct] = useState<any>(null);
    const [loading, setLoading] = useState(true);

    // 🔴 IMPORTANT: This must match the URL handle of the product you create in Shopify!
    // E.g., if your product URL is "yourstore.com/products/signature-zip-hoodie"
    // the handle is "signature-zip-hoodie".
    const FEATURED_HANDLE = "special-hoodie";

    useEffect(() => {
        fetchProductByHandle(FEATURED_HANDLE)
            .then((p) => {
                if (p) {
                    setProduct(p);
                }
            })
            .catch(console.error)
            .finally(() => setLoading(false));
    }, []);

    const title = product?.title || "The Signature Zip Hoodie";
    const desc = product?.description || "Engineered for the perfect heavy-weight drape. Featuring premium brushed fleece, custom metal hardware, and signature chest embroidery. Once it's gone, it's gone forever.";

    return (
        <section className="w-full px-6 md:px-10 py-16 md:py-24 bg-background">
            <div className="max-w-[1400px] mx-auto">
                <div className="flex flex-col lg:flex-row items-center gap-10 lg:gap-20 bg-secondary/30 rounded-[2rem] p-6 sm:p-10 lg:p-16 border border-border overflow-hidden relative">

                    {/* Background Decorative Elements */}
                    <div className="absolute top-0 right-0 w-[40rem] h-[40rem] bg-primary/5 rounded-full blur-[100px] -translate-y-1/2 translate-x-1/3 pointer-events-none" />
                    <div className="absolute bottom-0 left-0 w-[30rem] h-[30rem] bg-primary/5 rounded-full blur-[80px] translate-y-1/3 -translate-x-1/4 pointer-events-none" />

                    {/* Left: Image Box */}
                    <div className="w-full lg:w-1/2 relative group z-10 hover:cursor-pointer" onClick={() => navigate(product ? `/product/${product.handle}` : "/collections")}>
                        <div className="absolute inset-0 bg-gradient-to-tr from-primary/20 to-transparent rounded-3xl opacity-0 group-hover:opacity-100 transition-opacity duration-500 blur-xl" />
                        <div className="aspect-[4/5] sm:aspect-square lg:aspect-[4/5] rounded-3xl overflow-hidden bg-secondary relative border border-border shadow-2xl">
                            {loading ? (
                                <div className="w-full h-full flex items-center justify-center">
                                    <Loader2 className="w-8 h-8 animate-spin text-muted-foreground" />
                                </div>
                            ) : (
                                <div className="w-full h-full relative">
                                    <img
                                        src={productImg}
                                        alt={title}
                                        className="absolute inset-0 w-full h-full object-cover object-center transition-opacity duration-500 ease-in-out group-hover:opacity-0"
                                    />
                                    <img
                                        src={productBackImg}
                                        alt={`${title} back`}
                                        className="absolute inset-0 w-full h-full object-cover object-center opacity-0 transition-opacity duration-500 ease-in-out group-hover:opacity-100 group-hover:scale-105"
                                    />
                                </div>
                            )}
                            <div className="absolute top-6 left-6 flex flex-col gap-2">
                                <span className="bg-background/90 backdrop-blur-md text-foreground px-4 py-1.5 rounded-full text-xs font-bold uppercase tracking-widest shadow-sm flex items-center gap-1.5 border border-border">
                                    <Zap className="h-3 w-3 text-red-500 fill-red-500" /> Exclusive
                                </span>
                            </div>
                        </div>
                    </div>

                    {/* Right: Content */}
                    <div className="w-full lg:w-1/2 flex flex-col items-start z-10">
                        <div className="inline-block mb-4">
                            <span className="text-primary font-bold tracking-[0.2em] uppercase text-sm">
                                Limited Edition Drop
                            </span>
                        </div>

                        <h2 className="font-display text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-bold uppercase tracking-tight text-foreground leading-[1.1] mb-6">
                            {title}
                        </h2>

                        <p className="text-muted-foreground text-base sm:text-lg leading-relaxed mb-8 max-w-lg">
                            {desc}
                        </p>

                        <div className="flex flex-col sm:flex-row items-center gap-4 w-full sm:w-auto">
                            <Button
                                disabled={loading}
                                onClick={() => navigate(product ? `/product/${product.handle}` : `/product/${FEATURED_HANDLE}`)}
                                className="w-full sm:w-auto h-14 px-8 rounded-full text-base font-bold transition-all duration-300 bg-foreground text-background hover:bg-foreground/90 hover:scale-105 shadow-xl group"
                            >
                                Shop
                                <ArrowRight className="ml-2 h-5 w-5 group-hover:translate-x-1 transition-transform" />
                            </Button>
                        </div>

                        {/* Scarcity indicator */}
                        <div className="mt-10 flex items-center gap-4">
                            <div className="flex -space-x-3">
                                <div className="w-10 h-10 rounded-full border-2 border-background bg-secondary flex items-center justify-center text-xs font-bold">JD</div>
                                <div className="w-10 h-10 rounded-full border-2 border-background bg-primary text-primary-foreground flex items-center justify-center text-xs font-bold">MK</div>
                                <div className="w-10 h-10 rounded-full border-2 border-background bg-secondary flex items-center justify-center text-xs font-bold">SL</div>
                            </div>
                            <p className="text-sm font-medium text-muted-foreground">
                                <span className="text-foreground font-bold">Over 500+</span> already claimed
                            </p>
                        </div>
                    </div>

                </div>
            </div>
        </section>
    );
};
