import { useEffect, useState, useMemo, useCallback } from "react";
import { fetchProducts, type ShopifyProduct } from "@/lib/shopify";
import { ProductCard } from "@/components/ProductCard";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { Loader2, Search, SlidersHorizontal, X } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Slider } from "@/components/ui/slider";
import { Button } from "@/components/ui/button";

type SortOption = "default" | "price-asc" | "price-desc" | "name-asc" | "name-desc";

const Collections = () => {
  const [products, setProducts] = useState<ShopifyProduct[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [sortBy, setSortBy] = useState<SortOption>("default");
  const [priceRange, setPriceRange] = useState<[number, number]>([0, 1000]);
  const [showFilters, setShowFilters] = useState(false);

  useEffect(() => {
    fetchProducts(50)
      .then(setProducts)
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  const maxPrice = useMemo(() => {
    if (products.length === 0) return 1000;
    return Math.ceil(
      Math.max(...products.map((p) => parseFloat(p.node.priceRange.minVariantPrice.amount)))
    );
  }, [products]);

  // Initialize price range when products load
  useEffect(() => {
    if (products.length > 0) {
      setPriceRange([0, maxPrice]);
    }
  }, [maxPrice, products.length]);

  const productTypes = useMemo(() => {
    const types = new Set<string>();
    products.forEach((p) => {
      p.node.options.forEach((opt) => {
        if (opt.name.toLowerCase() !== "title") {
          opt.values.forEach((v) => types.add(v));
        }
      });
    });
    return Array.from(types);
  }, [products]);

  const filtered = useMemo(() => {
    let result = [...products];

    // Search
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      result = result.filter(
        (p) =>
          p.node.title.toLowerCase().includes(q) ||
          p.node.description.toLowerCase().includes(q)
      );
    }

    // Price filter
    result = result.filter((p) => {
      const price = parseFloat(p.node.priceRange.minVariantPrice.amount);
      return price >= priceRange[0] && price <= priceRange[1];
    });

    // Sort
    switch (sortBy) {
      case "price-asc":
        result.sort(
          (a, b) =>
            parseFloat(a.node.priceRange.minVariantPrice.amount) -
            parseFloat(b.node.priceRange.minVariantPrice.amount)
        );
        break;
      case "price-desc":
        result.sort(
          (a, b) =>
            parseFloat(b.node.priceRange.minVariantPrice.amount) -
            parseFloat(a.node.priceRange.minVariantPrice.amount)
        );
        break;
      case "name-asc":
        result.sort((a, b) => a.node.title.localeCompare(b.node.title));
        break;
      case "name-desc":
        result.sort((a, b) => b.node.title.localeCompare(a.node.title));
        break;
    }

    return result;
  }, [products, searchQuery, sortBy, priceRange]);

  const clearFilters = useCallback(() => {
    setSearchQuery("");
    setSortBy("default");
    setPriceRange([0, maxPrice]);
  }, [maxPrice]);

  const hasActiveFilters = searchQuery || sortBy !== "default" || priceRange[0] > 0 || priceRange[1] < maxPrice;

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <main className="pt-16">
        <section className="w-full px-6 md:px-10 py-16">
          <h1 className="font-display text-4xl md:text-5xl font-bold uppercase tracking-wide text-center mb-4">
            Our Collection
          </h1>
          <p className="text-muted-foreground text-center mb-12 max-w-lg mx-auto">
            Explore the full PHENIX lineup — streetwear crafted for the bold.
          </p>

          {/* Search & Filter Bar */}
          <div className="flex flex-col md:flex-row items-stretch md:items-center gap-3 mb-8">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search products..."
                className="pl-10 bg-secondary border-border"
              />
            </div>

            <div className="flex items-center gap-3">
              <Select value={sortBy} onValueChange={(v) => setSortBy(v as SortOption)}>
                <SelectTrigger className="w-[180px] bg-secondary border-border">
                  <SelectValue placeholder="Sort by" />
                </SelectTrigger>
                <SelectContent className="bg-card border-border">
                  <SelectItem value="default">Default</SelectItem>
                  <SelectItem value="price-asc">Price: Low → High</SelectItem>
                  <SelectItem value="price-desc">Price: High → Low</SelectItem>
                  <SelectItem value="name-asc">Name: A → Z</SelectItem>
                  <SelectItem value="name-desc">Name: Z → A</SelectItem>
                </SelectContent>
              </Select>

              <Button
                variant="outline"
                size="icon"
                onClick={() => setShowFilters(!showFilters)}
                className={`border-border ${showFilters ? "bg-primary text-primary-foreground" : ""}`}
              >
                <SlidersHorizontal className="h-4 w-4" />
              </Button>

              {hasActiveFilters && (
                <Button variant="ghost" size="sm" onClick={clearFilters} className="text-muted-foreground hover:text-foreground">
                  <X className="h-4 w-4 mr-1" />
                  Clear
                </Button>
              )}
            </div>
          </div>

          {/* Expandable Filter Panel */}
          {showFilters && (
            <div className="bg-secondary/50 border border-border rounded-lg p-6 mb-8 animate-in slide-in-from-top-2 duration-200">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                {/* Price Range */}
                <div>
                  <h3 className="text-sm font-semibold uppercase tracking-wider text-foreground mb-4">
                    Price Range
                  </h3>
                  <Slider
                    value={priceRange}
                    onValueChange={(v) => setPriceRange(v as [number, number])}
                    min={0}
                    max={maxPrice}
                    step={1}
                    className="mb-3"
                  />
                  <div className="flex justify-between text-sm text-muted-foreground">
                    <span>${priceRange[0]}</span>
                    <span>${priceRange[1]}</span>
                  </div>
                </div>

                {/* Available Options */}
                {productTypes.length > 0 && (
                  <div>
                    <h3 className="text-sm font-semibold uppercase tracking-wider text-foreground mb-4">
                      Available Options
                    </h3>
                    <div className="flex flex-wrap gap-2">
                      {productTypes.slice(0, 12).map((type) => (
                        <span
                          key={type}
                          className="px-3 py-1 rounded-full text-xs border border-border text-muted-foreground bg-background"
                        >
                          {type}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Results count */}
          {!loading && (
            <p className="text-sm text-muted-foreground mb-6">
              {filtered.length} {filtered.length === 1 ? "product" : "products"} found
            </p>
          )}

          {/* Product Grid */}
          {loading ? (
            <div className="flex justify-center py-20">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
          ) : filtered.length === 0 ? (
            <div className="text-center py-20">
              <p className="text-muted-foreground text-lg">No products match your filters</p>
              {hasActiveFilters && (
                <Button variant="link" onClick={clearFilters} className="text-primary mt-2">
                  Clear all filters
                </Button>
              )}
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6">
              {filtered.map((product) => (
                <ProductCard key={product.node.id} product={product} />
              ))}
            </div>
          )}
        </section>
        <Footer />
      </main>
    </div>
  );
};

export default Collections;
