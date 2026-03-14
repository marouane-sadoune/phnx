import { useState, useEffect } from "react";
import type { ShopifyProduct } from "@/lib/shopify";

const STORAGE_KEY = "phenix_recently_viewed";
const MAX_ITEMS = 12;

export function useRecentlyViewed() {
    const [viewedProducts, setViewedProducts] = useState<ShopifyProduct[]>([]);

    // Load from local storage on mount
    useEffect(() => {
        try {
            const stored = localStorage.getItem(STORAGE_KEY);
            if (stored) {
                setViewedProducts(JSON.parse(stored));
            }
        } catch (e) {
            console.error("Failed to load recently viewed products", e);
        }
    }, []);

    const addProduct = (product: ShopifyProduct) => {
        setViewedProducts((prev) => {
            // Remove if it already exists so we can move it to the front
            const filtered = prev.filter((p) => p.node.id !== product.node.id);

            const updated = [product, ...filtered].slice(0, MAX_ITEMS);

            try {
                localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
            } catch (e) {
                console.error("Failed to save recently viewed products", e);
            }

            return updated;
        });
    };

    return { viewedProducts, addProduct };
}
