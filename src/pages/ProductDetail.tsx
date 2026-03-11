import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { fetchProductByHandle } from "@/lib/shopify";
import { useCartStore } from "@/stores/cartStore";
import { Navbar } from "@/components/Navbar";
import { ArrowLeft, Loader2, ShoppingCart } from "lucide-react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";

const ProductDetail = () => {
  const { handle } = useParams<{ handle: string }>();
  const navigate = useNavigate();
  const [product, setProduct] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [selectedVariantIndex, setSelectedVariantIndex] = useState(0);
  const [selectedImage, setSelectedImage] = useState(0);
  const addItem = useCartStore(state => state.addItem);
  const isCartLoading = useCartStore(state => state.isLoading);

  useEffect(() => {
    if (!handle) return;
    fetchProductByHandle(handle)
      .then(setProduct)
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [handle]);

  if (loading) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <div className="pt-16 flex items-center justify-center min-h-[60vh]">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <div className="pt-16 flex flex-col items-center justify-center min-h-[60vh]">
          <p className="text-muted-foreground mb-4">Product not found</p>
          <Button variant="outline" onClick={() => navigate("/")}>
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
      quantity: 1,
      selectedOptions: selectedVariant.selectedOptions || [],
    });
    toast.success("Added to cart", { position: "top-center" });
  };

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <main className="pt-20 px-6 md:px-10 max-w-[1400px] mx-auto">
        <button
          onClick={() => navigate("/")}
          className="flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors mb-8 text-sm"
        >
          <ArrowLeft className="h-4 w-4" /> Back
        </button>

        <div className="grid md:grid-cols-2 gap-10">
          {/* Images */}
          <div className="space-y-4">
            <div className="aspect-square overflow-hidden rounded-lg bg-secondary">
              {images[selectedImage]?.node ? (
                <img
                  src={images[selectedImage].node.url}
                  alt={images[selectedImage].node.altText || product.title}
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-muted-foreground">No image</div>
              )}
            </div>
            {images.length > 1 && (
              <div className="flex gap-2 overflow-x-auto">
                {images.map((img: any, i: number) => (
                  <button
                    key={i}
                    onClick={() => setSelectedImage(i)}
                    className={`w-16 h-16 rounded-md overflow-hidden flex-shrink-0 border-2 transition-colors ${i === selectedImage ? "border-primary" : "border-transparent"}`}
                  >
                    <img src={img.node.url} alt="" className="w-full h-full object-cover" />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Info */}
          <div>
            <h1 className="font-display text-3xl md:text-4xl font-bold uppercase tracking-wide text-foreground">
              {product.title}
            </h1>
            <p className="text-2xl font-bold text-primary mt-4">
              {selectedVariant?.price.currencyCode} {parseFloat(selectedVariant?.price.amount || "0").toFixed(2)}
            </p>

            {/* Options */}
            {product.options?.map((option: any) => (
              <div key={option.name} className="mt-6">
                <label className="text-sm font-semibold text-muted-foreground uppercase tracking-wide mb-2 block">
                  {option.name}
                </label>
                <div className="flex flex-wrap gap-2">
                  {option.values.map((value: string) => {
                    const variantIndex = variants.findIndex(
                      (v: any) => v.node.selectedOptions.some((o: any) => o.name === option.name && o.value === value)
                    );
                    const isSelected = selectedVariant?.selectedOptions.some(
                      (o: any) => o.name === option.name && o.value === value
                    );
                    return (
                      <button
                        key={value}
                        onClick={() => variantIndex >= 0 && setSelectedVariantIndex(variantIndex)}
                        className={`px-4 py-2 rounded-md text-sm border transition-colors ${
                          isSelected
                            ? "border-primary bg-primary text-primary-foreground"
                            : "border-border text-foreground hover:border-primary"
                        }`}
                      >
                        {value}
                      </button>
                    );
                  })}
                </div>
              </div>
            ))}

            <Button
              onClick={handleAddToCart}
              disabled={isCartLoading || !selectedVariant?.availableForSale}
              className="w-full mt-8 bg-primary text-primary-foreground hover:bg-primary/90 rounded-full py-6 text-base font-bold uppercase tracking-wider"
              size="lg"
            >
              {isCartLoading ? (
                <Loader2 className="h-5 w-5 animate-spin" />
              ) : (
                <>
                  <ShoppingCart className="h-5 w-5 mr-2" />
                  {selectedVariant?.availableForSale ? "Add to Cart" : "Sold Out"}
                </>
              )}
            </Button>

            {product.description && (
              <div className="mt-8 border-t border-border pt-6">
                <h3 className="font-display text-sm font-semibold uppercase tracking-wide text-muted-foreground mb-3">
                  Description
                </h3>
                <p className="text-foreground/80 leading-relaxed text-sm">{product.description}</p>
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
};

export default ProductDetail;
