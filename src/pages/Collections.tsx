import { useEffect, useState, useMemo, useCallback, useRef } from "react";
import { fetchProducts, type ShopifyProduct } from "@/lib/shopify";
import { ProductCard } from "@/components/ProductCard";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import {
  SlidersHorizontal, Minus, ChevronDown, Loader2,
  LayoutGrid, List, X,
} from "lucide-react";
import { Slider } from "@/components/ui/slider";
import { Button } from "@/components/ui/button";
import {
  Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger,
} from "@/components/ui/sheet";

/* ─── types & constants ─────────────────────────────────────── */
type SortOption = "default" | "newest" | "price-asc" | "price-desc" | "name-asc" | "name-desc";
type ViewMode = "grid" | "list";

const CATEGORIES = ["All Products", "T-shirts", "Outerwear", "Accessories"];
const SIZES = ["XS", "S", "M", "L", "XL", "XXL"];
const PAGE_SIZE = 12;

const COLOUR_MAP: Record<string, string> = {
  black: "#111111", white: "#ffffff", red: "#e53e3e", blue: "#3182ce",
  green: "#4a7c59", olive: "#6b7c3e", grey: "#718096", gray: "#718096",
  yellow: "#f6c90e", beige: "#f5e6c8", pink: "#ed64a6", orange: "#ed8936",
  purple: "#805ad5", brown: "#744210", navy: "#1a365d", cream: "#fffdd0",
  rainbow: "conic-gradient(red,orange,yellow,green,blue,indigo,violet,red)",
  multicolor: "conic-gradient(red,orange,yellow,green,blue,indigo,violet,red)",
};

const SORT_LABELS: Record<SortOption, string> = {
  default: "Default", newest: "Newest", "price-asc": "Price: Low → High",
  "price-desc": "Price: High → Low", "name-asc": "Name: A → Z", "name-desc": "Name: Z → A",
};

/* ─── Skeleton card ─────────────────────────────────────────── */
function SkeletonCard({ list = false }: { list?: boolean }) {
  if (list) {
    return (
      <div className="flex gap-4 animate-pulse border-b border-border pb-6">
        <div className="w-32 h-32 rounded-xl bg-secondary shrink-0" />
        <div className="flex-1 py-1 space-y-2">
          <div className="h-4 rounded bg-secondary w-1/2" />
          <div className="h-3 rounded bg-secondary w-1/4" />
          <div className="h-3 rounded bg-secondary w-3/4 mt-2" />
        </div>
      </div>
    );
  }
  return (
    <div className="animate-pulse">
      <div className="aspect-square rounded-xl bg-secondary mb-3" />
      <div className="h-3.5 rounded bg-secondary w-3/4 mb-2" />
      <div className="h-3 rounded bg-secondary w-1/3" />
    </div>
  );
}

/* ─── FilterSection ─────────────────────────────────────────── */
function FilterSection({ title, children }: { title: string; children: React.ReactNode }) {
  const [open, setOpen] = useState(true);
  return (
    <div className="border-b border-border py-5">
      <button onClick={() => setOpen(!open)} className="flex w-full items-center justify-between mb-4 group">
        <span className="text-xs font-bold uppercase tracking-widest text-foreground">{title}</span>
        {open
          ? <Minus className="h-3.5 w-3.5 text-muted-foreground group-hover:text-foreground transition-colors" />
          : <ChevronDown className="h-3.5 w-3.5 text-muted-foreground group-hover:text-foreground transition-colors" />}
      </button>
      {open && <div>{children}</div>}
    </div>
  );
}

/* ─── List-view product row ─────────────────────────────────── */
function ProductRow({ product }: { product: ShopifyProduct }) {
  const { node } = product;
  const image = node.images.edges[0]?.node;
  const price = node.priceRange.minVariantPrice;
  return (
    <a
      href={`/product/${node.handle}`}
      className="flex gap-5 border-b border-border pb-6 group hover:bg-secondary/30 transition-colors rounded-lg px-2 -mx-2"
    >
      <div className="w-28 h-28 md:w-36 md:h-36 rounded-xl bg-secondary overflow-hidden shrink-0">
        {image ? (
          <img
            src={image.url}
            alt={image.altText || node.title}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
            loading="lazy"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-muted-foreground text-xs">No image</div>
        )}
      </div>
      <div className="flex flex-col justify-center gap-1.5 flex-1 min-w-0">
        <h3 className="font-display text-sm md:text-base font-semibold uppercase tracking-wide truncate">
          {node.title}
        </h3>
        <p className="text-primary font-semibold text-sm">
          {price.currencyCode} {parseFloat(price.amount).toFixed(2)}
        </p>
        {node.description && (
          <p className="text-xs text-muted-foreground line-clamp-2 hidden sm:block">{node.description}</p>
        )}
        <span className={`text-xs font-medium mt-1 ${node.availableForSale ? "text-green-600" : "text-red-500"}`}>
          {node.availableForSale ? "In stock" : "Out of stock"}
        </span>
      </div>
    </a>
  );
}

/* ─── Sidebar panel (shared between desktop & sheet) ────────── */
function FilterPanel({
  categories, selectedCategory, onSelectCategory,
  availabilityFilter, onAvailabilityChange, stockCounts,
  priceRange, onPriceRange, maxPrice,
  availableSizes, selectedSizes, onToggleSize,
  availableColors, selectedColors, onToggleColor,
  hasActiveFilters, onClear,
}: {
  categories: string[];
  selectedCategory: string;
  onSelectCategory: (c: string) => void;
  availabilityFilter: { inStock: boolean; outOfStock: boolean };
  onAvailabilityChange: (k: "inStock" | "outOfStock", v: boolean) => void;
  stockCounts: { inStock: number; outOfStock: number };
  priceRange: [number, number];
  onPriceRange: (v: [number, number]) => void;
  maxPrice: number;
  availableSizes: string[];
  selectedSizes: Set<string>;
  onToggleSize: (s: string) => void;
  availableColors: string[];
  selectedColors: Set<string>;
  onToggleColor: (c: string) => void;
  hasActiveFilters: boolean;
  onClear: () => void;
}) {
  return (
    <div className="flex flex-col h-full">
      <div className="px-5 flex-1 overflow-y-auto">
        {/* CATEGORY */}
        <FilterSection title="Category">
          <ul className="space-y-2">
            {categories.map((cat) => (
              <li key={cat}>
                <button
                  onClick={() => onSelectCategory(cat)}
                  className={`text-sm transition-colors ${selectedCategory === cat
                      ? "font-semibold text-foreground"
                      : "text-muted-foreground hover:text-foreground"
                    }`}
                >
                  {cat}
                </button>
              </li>
            ))}
          </ul>
        </FilterSection>

        {/* AVAILABILITY */}
        <FilterSection title="Availability">
          <ul className="space-y-2.5">
            {[
              { id: "av-in", key: "inStock" as const, label: `In stock (${stockCounts.inStock})` },
              { id: "av-out", key: "outOfStock" as const, label: `Out of stock (${stockCounts.outOfStock})` },
            ].map(({ id, key, label }) => (
              <li key={id} className="flex items-center gap-2.5">
                <input
                  id={id} type="checkbox"
                  checked={availabilityFilter[key]}
                  onChange={(e) => onAvailabilityChange(key, e.target.checked)}
                  className="h-3.5 w-3.5 rounded border-border accent-primary cursor-pointer"
                />
                <label htmlFor={id} className="text-sm cursor-pointer select-none text-muted-foreground">{label}</label>
              </li>
            ))}
          </ul>
        </FilterSection>

        {/* PRICE */}
        <FilterSection title="Price">
          <Slider
            value={priceRange}
            onValueChange={(v) => onPriceRange(v as [number, number])}
            min={0} max={maxPrice} step={1} className="mb-3"
          />
          <div className="flex justify-between text-xs text-muted-foreground">
            <span>${priceRange[0]}</span>
            <span>${priceRange[1]}</span>
          </div>
        </FilterSection>

        {/* SIZE */}
        {(availableSizes.length > 0 ? availableSizes : SIZES).length > 0 && (
          <FilterSection title="Size">
            <div className="flex flex-wrap gap-2">
              {(availableSizes.length > 0 ? availableSizes : SIZES).map((s) => (
                <button
                  key={s} onClick={() => onToggleSize(s)}
                  className={`
                    min-w-[2.5rem] px-3 py-1.5 rounded-md border text-sm font-medium transition-all duration-150
                    ${selectedSizes.has(s)
                      ? "bg-foreground text-background border-foreground"
                      : "bg-background text-foreground border-border hover:border-foreground"}
                  `}
                >
                  {s}
                </button>
              ))}
            </div>
          </FilterSection>
        )}

        {/* COLORS */}
        {availableColors.length > 0 && (
          <FilterSection title="Colors">
            <div className="flex flex-wrap gap-2.5">
              {availableColors.map((color) => {
                const bg = COLOUR_MAP[color] ?? color;
                const isGrad = bg.startsWith("conic");
                const selected = selectedColors.has(color);
                return (
                  <button
                    key={color} onClick={() => onToggleColor(color)} title={color}
                    className={`
                      h-8 w-8 rounded-full transition-all duration-150
                      ${selected ? "ring-2 ring-offset-2 ring-foreground scale-110" : "hover:scale-110"}
                      ${color === "white" || color === "cream" || color === "beige" ? "border border-border" : ""}
                    `}
                    style={isGrad ? { backgroundImage: bg } : { backgroundColor: bg }}
                  />
                );
              })}
            </div>
          </FilterSection>
        )}
      </div>

      {/* Reset */}
      <div className="px-5 pb-5 pt-4 shrink-0">
        <button
          onClick={onClear} disabled={!hasActiveFilters}
          className={`
            w-full py-3 rounded-xl text-sm font-semibold underline underline-offset-2 transition-all duration-200
            ${hasActiveFilters
              ? "bg-foreground text-background hover:opacity-90"
              : "bg-secondary text-muted-foreground cursor-default"}
          `}
        >
          Reset Filters
        </button>
      </div>
    </div>
  );
}

/* ─── main component ────────────────────────────────────────── */
const Collections = () => {
  const [products, setProducts] = useState<ShopifyProduct[]>([]);
  const [loading, setLoading] = useState(true);
  const [sortBy, setSortBy] = useState<SortOption>("default");
  const [priceRange, setPriceRange] = useState<[number, number]>([0, 1000]);
  const [selectedSizes, setSelectedSizes] = useState<Set<string>>(new Set());
  const [selectedColors, setSelectedColors] = useState<Set<string>>(new Set());
  const [selectedCategory, setSelectedCategory] = useState("All Products");
  const [availabilityFilter, setAvailabilityFilter] = useState({ inStock: false, outOfStock: false });
  const [visibleCount, setVisibleCount] = useState(PAGE_SIZE);
  const [loadingMore, setLoadingMore] = useState(false);
  const [viewMode, setViewMode] = useState<ViewMode>("grid");
  const gridRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    fetchProducts(100).then(setProducts).catch(console.error).finally(() => setLoading(false));
  }, []);

  const maxPrice = useMemo(() => {
    if (products.length === 0) return 1000;
    return Math.ceil(Math.max(...products.map((p) => parseFloat(p.node.priceRange.minVariantPrice.amount))));
  }, [products]);

  useEffect(() => {
    if (products.length > 0) setPriceRange([0, maxPrice]);
  }, [maxPrice, products.length]);

  const availableSizes = useMemo(() => {
    const found = new Set<string>();
    products.forEach((p) =>
      p.node.options.forEach((opt) => {
        if (opt.name.toLowerCase() === "size" || opt.name.toLowerCase() === "taille")
          opt.values.forEach((v) => found.add(v.toUpperCase()));
      })
    );
    return SIZES.filter((s) => found.has(s));
  }, [products]);

  const availableColors = useMemo(() => {
    const found = new Set<string>();
    products.forEach((p) =>
      p.node.options.forEach((opt) => {
        if (opt.name.toLowerCase() === "color" || opt.name.toLowerCase() === "couleur")
          opt.values.forEach((v) => found.add(v.toLowerCase()));
      })
    );
    return Array.from(found);
  }, [products]);

  const stockCounts = useMemo(() => {
    let inStock = 0, outOfStock = 0;
    products.forEach((p) => (p.node.availableForSale ? inStock++ : outOfStock++));
    return { inStock, outOfStock };
  }, [products]);

  /* Active filter chips data */
  const activeChips = useMemo(() => {
    const chips: { label: string; onRemove: () => void }[] = [];
    if (sortBy !== "default")
      chips.push({ label: `Sort: ${SORT_LABELS[sortBy]}`, onRemove: () => setSortBy("default") });
    if (selectedCategory !== "All Products")
      chips.push({ label: selectedCategory, onRemove: () => setSelectedCategory("All Products") });
    if (availabilityFilter.inStock)
      chips.push({ label: "In stock", onRemove: () => setAvailabilityFilter((p) => ({ ...p, inStock: false })) });
    if (availabilityFilter.outOfStock)
      chips.push({ label: "Out of stock", onRemove: () => setAvailabilityFilter((p) => ({ ...p, outOfStock: false })) });
    if (priceRange[0] > 0 || priceRange[1] < maxPrice)
      chips.push({ label: `$${priceRange[0]} – $${priceRange[1]}`, onRemove: () => setPriceRange([0, maxPrice]) });
    selectedSizes.forEach((s) =>
      chips.push({ label: `Size: ${s}`, onRemove: () => toggleSize(s) })
    );
    selectedColors.forEach((c) =>
      chips.push({ label: `Color: ${c}`, onRemove: () => toggleColor(c) })
    );
    return chips;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [sortBy, selectedCategory, availabilityFilter, priceRange, maxPrice, selectedSizes, selectedColors]);

  const activeFilterCount = activeChips.length;

  const filtered = useMemo(() => {
    let result = [...products];

    if (availabilityFilter.inStock || availabilityFilter.outOfStock) {
      result = result.filter((p) => {
        if (availabilityFilter.inStock && p.node.availableForSale) return true;
        if (availabilityFilter.outOfStock && !p.node.availableForSale) return true;
        return false;
      });
    }

    result = result.filter((p) => {
      const price = parseFloat(p.node.priceRange.minVariantPrice.amount);
      return price >= priceRange[0] && price <= priceRange[1];
    });

    if (selectedSizes.size > 0)
      result = result.filter((p) =>
        p.node.options.some(
          (opt) =>
            (opt.name.toLowerCase() === "size" || opt.name.toLowerCase() === "taille") &&
            opt.values.some((v) => selectedSizes.has(v.toUpperCase()))
        )
      );

    if (selectedColors.size > 0)
      result = result.filter((p) =>
        p.node.options.some(
          (opt) =>
            (opt.name.toLowerCase() === "color" || opt.name.toLowerCase() === "couleur") &&
            opt.values.some((v) => selectedColors.has(v.toLowerCase()))
        )
      );

    switch (sortBy) {
      case "newest": result = [...result].reverse(); break;
      case "price-asc": result.sort((a, b) => parseFloat(a.node.priceRange.minVariantPrice.amount) - parseFloat(b.node.priceRange.minVariantPrice.amount)); break;
      case "price-desc": result.sort((a, b) => parseFloat(b.node.priceRange.minVariantPrice.amount) - parseFloat(a.node.priceRange.minVariantPrice.amount)); break;
      case "name-asc": result.sort((a, b) => a.node.title.localeCompare(b.node.title)); break;
      case "name-desc": result.sort((a, b) => b.node.title.localeCompare(a.node.title)); break;
    }

    return result;
  }, [products, sortBy, priceRange, selectedSizes, selectedColors, availabilityFilter]);

  useEffect(() => { setVisibleCount(PAGE_SIZE); }, [filtered.length, sortBy]);

  const hasActiveFilters = activeFilterCount > 0;
  const visibleProducts = filtered.slice(0, visibleCount);
  const hasMore = visibleCount < filtered.length;

  const clearFilters = useCallback(() => {
    setSortBy("default");
    setPriceRange([0, maxPrice]);
    setSelectedSizes(new Set());
    setSelectedColors(new Set());
    setAvailabilityFilter({ inStock: false, outOfStock: false });
    setSelectedCategory("All Products");
  }, [maxPrice]);

  const handleLoadMore = () => {
    setLoadingMore(true);
    setTimeout(() => { setVisibleCount((c) => c + PAGE_SIZE); setLoadingMore(false); }, 400);
  };

  const toggleSize = (s: string) =>
    setSelectedSizes((prev) => { const n = new Set(prev); n.has(s) ? n.delete(s) : n.add(s); return n; });

  const toggleColor = (c: string) =>
    setSelectedColors((prev) => { const n = new Set(prev); n.has(c) ? n.delete(c) : n.add(c); return n; });

  /* shared filter panel props */
  const filterPanelProps = {
    categories: CATEGORIES, selectedCategory, onSelectCategory: setSelectedCategory,
    availabilityFilter, onAvailabilityChange: (k: "inStock" | "outOfStock", v: boolean) =>
      setAvailabilityFilter((p) => ({ ...p, [k]: v })),
    stockCounts, priceRange, onPriceRange: setPriceRange, maxPrice,
    availableSizes, selectedSizes, onToggleSize: toggleSize,
    availableColors, selectedColors, onToggleColor: toggleColor,
    hasActiveFilters, onClear: clearFilters,
  };

  /* ── render ─────────────────────────────────────────────────── */
  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <main className="pt-16">
        <section className="w-full px-6 md:px-10 py-12">

          {/* Page header */}
          <h1 className="font-display text-4xl md:text-5xl font-bold uppercase tracking-wide text-center mb-3">
            Our Collection
          </h1>
          <p className="text-muted-foreground text-center mb-10 max-w-lg mx-auto">
            Explore the full PHENIX lineup — streetwear crafted for the bold.
          </p>

          {/* ── Toolbar ─────────────────────────────────────── */}
          <div className="flex items-center justify-between pb-4 border-b border-border mb-4">
            {/* Left: mobile Sheet trigger + desktop count */}
            <div className="flex items-center gap-3">
              {/* Mobile: Sheet drawer trigger */}
              <Sheet>
                <SheetTrigger asChild>
                  <button className="relative flex items-center gap-2 text-sm font-semibold md:hidden">
                    <SlidersHorizontal className="h-4 w-4" />
                    Filters
                    {activeFilterCount > 0 && (
                      <span className="absolute -top-2 -right-4 h-4 w-4 rounded-full bg-primary text-primary-foreground text-[10px] font-bold flex items-center justify-center">
                        {activeFilterCount}
                      </span>
                    )}
                  </button>
                </SheetTrigger>
                <SheetContent side="left" className="w-80 p-0 flex flex-col">
                  <SheetHeader className="px-5 pt-5 pb-1 shrink-0">
                    <SheetTitle className="flex items-center justify-between">
                      <span>Filters</span>
                      {activeFilterCount > 0 && (
                        <span className="h-5 w-5 rounded-full bg-primary text-primary-foreground text-[10px] font-bold flex items-center justify-center">
                          {activeFilterCount}
                        </span>
                      )}
                    </SheetTitle>
                  </SheetHeader>
                  <div className="mx-5 border-b border-border shrink-0" />
                  <div className="flex-1 overflow-hidden">
                    <FilterPanel {...filterPanelProps} />
                  </div>
                </SheetContent>
              </Sheet>

              {/* Desktop count + badge */}
              <span className="hidden md:flex items-center gap-2 text-sm text-muted-foreground">
                {loading ? "Loading…" : `${filtered.length} product${filtered.length !== 1 ? "s" : ""}`}
                {activeFilterCount > 0 && (
                  <span className="px-2 py-0.5 rounded-full bg-primary/10 text-primary text-xs font-semibold">
                    {activeFilterCount} active
                  </span>
                )}
              </span>
            </div>

            {/* Right: view toggle + sort */}
            <div className="flex items-center gap-3">
              {hasActiveFilters && (
                <button onClick={clearFilters} className="hidden md:block text-xs text-muted-foreground hover:text-foreground underline underline-offset-2 transition-colors">
                  Clear all
                </button>
              )}

              {/* Grid / List toggle */}
              <div className="flex items-center rounded-lg border border-border overflow-hidden">
                <button
                  onClick={() => setViewMode("grid")}
                  className={`p-2 transition-colors ${viewMode === "grid" ? "bg-foreground text-background" : "hover:bg-secondary"}`}
                  title="Grid view"
                >
                  <LayoutGrid className="h-3.5 w-3.5" />
                </button>
                <button
                  onClick={() => setViewMode("list")}
                  className={`p-2 transition-colors ${viewMode === "list" ? "bg-foreground text-background" : "hover:bg-secondary"}`}
                  title="List view"
                >
                  <List className="h-3.5 w-3.5" />
                </button>
              </div>

              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as SortOption)}
                className="text-sm bg-secondary border border-border rounded-md px-3 py-1.5 focus:outline-none focus:ring-1 focus:ring-ring"
              >
                {(Object.entries(SORT_LABELS) as [SortOption, string][]).map(([val, label]) => (
                  <option key={val} value={val}>Sort: {label}</option>
                ))}
              </select>
            </div>
          </div>

          {/* ── Active filter chips ──────────────────────────── */}
          {activeChips.length > 0 && (
            <div className="flex flex-wrap items-center gap-2 mb-5">
              {activeChips.map((chip) => (
                <span
                  key={chip.label}
                  className="inline-flex items-center gap-1.5 pl-3 pr-2 py-1 rounded-full bg-secondary border border-border text-xs font-medium text-foreground"
                >
                  {chip.label}
                  <button
                    onClick={chip.onRemove}
                    className="p-0.5 rounded-full hover:bg-foreground/10 transition-colors"
                    aria-label={`Remove ${chip.label} filter`}
                  >
                    <X className="h-3 w-3" />
                  </button>
                </span>
              ))}
              {activeChips.length > 1 && (
                <button
                  onClick={clearFilters}
                  className="text-xs text-muted-foreground hover:text-foreground underline underline-offset-2 ml-1 transition-colors"
                >
                  Clear all
                </button>
              )}
            </div>
          )}

          {/* ── Two-column layout ────────────────────────────── */}
          <div className="flex gap-8 items-start">

            {/* ══ Desktop Sidebar ════════════════════════════ */}
            <aside className="hidden md:block shrink-0 w-64 sticky top-24 self-start rounded-xl border border-border bg-card shadow-sm overflow-hidden">
              <div className="flex items-center justify-between px-5 pt-5 pb-1">
                <span className="text-lg font-bold tracking-tight">Filters</span>
                <div className="flex items-center gap-2">
                  {activeFilterCount > 0 && (
                    <span className="h-5 w-5 rounded-full bg-primary text-primary-foreground text-[10px] font-bold flex items-center justify-center">
                      {activeFilterCount}
                    </span>
                  )}
                  <SlidersHorizontal className="h-4 w-4 text-muted-foreground" />
                </div>
              </div>
              <div className="mx-5 mt-3 border-b border-border" />
              <FilterPanel {...filterPanelProps} />
            </aside>

            {/* ══ Product area ═══════════════════════════════ */}
            <div className="flex-1 min-w-0" ref={gridRef}>

              {/* mobile count */}
              {!loading && (
                <p className="text-sm text-muted-foreground mb-4 md:hidden">
                  {filtered.length} product{filtered.length !== 1 ? "s" : ""}
                </p>
              )}

              {/* Loading skeletons */}
              {loading ? (
                viewMode === "grid" ? (
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 md:gap-6">
                    {Array.from({ length: PAGE_SIZE }).map((_, i) => <SkeletonCard key={i} />)}
                  </div>
                ) : (
                  <div className="space-y-6">
                    {Array.from({ length: 6 }).map((_, i) => <SkeletonCard key={i} list />)}
                  </div>
                )
              ) : filtered.length === 0 ? (
                /* Empty state */
                <div className="flex flex-col items-center justify-center py-24 text-center">
                  <div className="text-5xl mb-4">🔍</div>
                  <p className="text-lg font-semibold mb-1">No products match your filters</p>
                  <p className="text-sm text-muted-foreground mb-5">Try adjusting or clearing your filters</p>
                  {hasActiveFilters && <Button variant="outline" onClick={clearFilters}>Clear all filters</Button>}
                </div>
              ) : (
                <>
                  {/* Grid view */}
                  {viewMode === "grid" ? (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 md:gap-6">
                      {visibleProducts.map((product) => (
                        <ProductCard key={product.node.id} product={product} />
                      ))}
                    </div>
                  ) : (
                    /* List view */
                    <div className="space-y-6">
                      {visibleProducts.map((product) => (
                        <ProductRow key={product.node.id} product={product} />
                      ))}
                    </div>
                  )}

                  {/* Load More */}
                  {hasMore && (
                    <div className="mt-12 flex flex-col items-center gap-3">
                      <p className="text-xs text-muted-foreground">
                        Showing {visibleCount} of {filtered.length} products
                      </p>
                      <div className="w-48 h-1 rounded-full bg-secondary overflow-hidden">
                        <div
                          className="h-full bg-primary rounded-full transition-all duration-500"
                          style={{ width: `${(visibleCount / filtered.length) * 100}%` }}
                        />
                      </div>
                      <Button
                        variant="outline"
                        onClick={handleLoadMore}
                        disabled={loadingMore}
                        className="mt-3 px-10 py-5 rounded-xl font-semibold tracking-wide"
                      >
                        {loadingMore
                          ? <span className="flex items-center gap-2"><Loader2 className="h-4 w-4 animate-spin" />Loading…</span>
                          : `Load More (${filtered.length - visibleCount} remaining)`}
                      </Button>
                    </div>
                  )}
                </>
              )}
            </div>
          </div>
        </section>
        <Footer />
      </main>
    </div>
  );
};

export default Collections;
