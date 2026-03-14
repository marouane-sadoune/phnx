import { useNavigate } from "react-router-dom";
import { ShoppingCart, Loader2 } from "lucide-react";
import type { ShopifyProduct } from "@/lib/shopify";
import { useCartStore } from "@/stores/cartStore";
import { toast } from "sonner";

interface ProductCardProps {
  product: ShopifyProduct;
}

export const ProductCard = ({ product }: ProductCardProps) => {
  const navigate = useNavigate();
  const addItem = useCartStore((state) => state.addItem);
  const isLoading = useCartStore((state) => state.isLoading);
  const { node } = product;
  const image = node.images.edges[0]?.node;
  const secondImage = node.images.edges[1]?.node;
  const price = node.priceRange.minVariantPrice;
  const variant = node.variants.edges[0]?.node;
  const inStock = variant?.availableForSale ?? false;

  const handleAddToCart = async (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!variant || !inStock) return;
    await addItem({
      product,
      variantId: variant.id,
      variantTitle: variant.title,
      price: variant.price,
      quantity: 1,
      selectedOptions: variant.selectedOptions || [],
    });
    toast.success("Added to cart!", { position: "top-center" });
  };

  return (
    <div
      className="group cursor-pointer"
      onClick={() => navigate(`/product/${node.handle}`)}
    >
      {/* ── Image area ─────────────────────────────────── */}
      <div className="aspect-square overflow-hidden rounded-xl bg-secondary mb-3 relative">
        {/* Primary image */}
        {image ? (
          <img
            src={image.url}
            alt={image.altText || node.title}
            className={`
              absolute inset-0 w-full h-full object-cover
              transition-all duration-500
              group-hover:scale-105
              ${secondImage ? "group-hover:opacity-0" : ""}
            `}
            loading="lazy"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-muted-foreground text-sm">
            No image
          </div>
        )}

        {/* Secondary / hover image */}
        {secondImage && (
          <img
            src={secondImage.url}
            alt={secondImage.altText || node.title}
            className="absolute inset-0 w-full h-full object-cover opacity-0 group-hover:opacity-100 group-hover:scale-105 transition-all duration-500"
            loading="lazy"
          />
        )}

        {/* Out of stock badge */}
        {!inStock && (
          <span className="absolute top-2 left-2 bg-background/80 backdrop-blur-sm text-foreground text-[10px] font-semibold uppercase tracking-wider px-2 py-1 rounded-md">
            Out of stock
          </span>
        )}

        {/* Quick-Add bar — slides up on hover */}
        <div
          className="
            absolute bottom-0 inset-x-0
            translate-y-full group-hover:translate-y-0
            transition-transform duration-300 ease-out
          "
        >
          <button
            onClick={handleAddToCart}
            disabled={isLoading || !inStock}
            className="
              w-full flex items-center justify-center gap-2
              bg-foreground/90 backdrop-blur-sm text-background
              py-3 text-xs font-semibold uppercase tracking-widest
              hover:bg-foreground transition-colors duration-150
              disabled:opacity-50 disabled:cursor-not-allowed
            "
          >
            {isLoading ? (
              <Loader2 className="h-3.5 w-3.5 animate-spin" />
            ) : (
              <ShoppingCart className="h-3.5 w-3.5" />
            )}
            {inStock ? "Quick Add" : "Unavailable"}
          </button>
        </div>
      </div>

      {/* ── Info ───────────────────────────────────────── */}
      <h3 className="font-display text-sm font-semibold uppercase tracking-wide text-foreground truncate">
        {node.title}
      </h3>
      <p className="text-primary font-semibold mt-0.5 text-sm">
        {price.currencyCode} {parseFloat(price.amount).toFixed(2)}
      </p>
    </div>
  );
};
