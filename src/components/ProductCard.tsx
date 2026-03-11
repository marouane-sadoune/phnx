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
  const addItem = useCartStore(state => state.addItem);
  const isLoading = useCartStore(state => state.isLoading);
  const { node } = product;
  const image = node.images.edges[0]?.node;
  const price = node.priceRange.minVariantPrice;
  const variant = node.variants.edges[0]?.node;

  const handleAddToCart = async (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!variant) return;
    await addItem({
      product,
      variantId: variant.id,
      variantTitle: variant.title,
      price: variant.price,
      quantity: 1,
      selectedOptions: variant.selectedOptions || [],
    });
    toast.success("Added to cart", { position: "top-center" });
  };

  return (
    <div
      className="group cursor-pointer"
      onClick={() => navigate(`/product/${node.handle}`)}
    >
      <div className="aspect-square overflow-hidden rounded-lg bg-secondary mb-3 relative">
        {image ? (
          <img
            src={image.url}
            alt={image.altText || node.title}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
            loading="lazy"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-muted-foreground">
            No image
          </div>
        )}
        <button
          onClick={handleAddToCart}
          disabled={isLoading || !variant?.availableForSale}
          className="absolute bottom-3 right-3 bg-primary text-primary-foreground p-3 rounded-full opacity-0 group-hover:opacity-100 transition-all duration-300 hover:scale-110 disabled:opacity-50"
        >
          {isLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : <ShoppingCart className="h-4 w-4" />}
        </button>
      </div>
      <h3 className="font-display text-sm font-semibold uppercase tracking-wide text-foreground truncate">
        {node.title}
      </h3>
      <p className="text-primary font-semibold mt-1">
        {price.currencyCode} {parseFloat(price.amount).toFixed(2)}
      </p>
    </div>
  );
};
