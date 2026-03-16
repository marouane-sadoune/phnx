import { useEffect, useState, useMemo, useCallback, useRef } from "react";
import { useSearchParams } from "react-router-dom";
import { fetchProducts, type ShopifyProduct } from "@/lib/shopify";
import { ProductCard } from "@/components/ProductCard";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import {
  SlidersHorizontal, Minus, ChevronDown, Loader2,
  LayoutGrid, List, X, Search, Check, RotateCcw,
  Tag, Truck, ShieldCheck, Droplets
} from "lucide-react";
import { Slider } from "@/components/ui/slider";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import {
  Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger,
} from "@/components/ui/sheet";

/* ─── types & constants ─────────────────────────────────────── */
type SortOption = "default" | "newest" | "price-asc" | "price-desc" | "name-asc" | "name-desc";
type ViewMode = "grid" | "list";

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



/* ─── List-view product row ─────────────────────────────────── */
function ProductRow({ product }: { product: ShopifyProduct }) {
  const { node } = product;
  const image = node.images.edges[0]?.node;
  const price = node.priceRange.minVariantPrice;
  const variant = node.variants.edges[0]?.node;
  const isOnSale = variant?.compareAtPrice && parseFloat(variant.compareAtPrice.amount) > parseFloat(price.amount);

  return (
    <a
      href={`/product/${node.handle}`}
      className="flex gap-5 border-b border-border pb-6 group hover:bg-secondary/30 transition-colors rounded-lg px-2 -mx-2"
    >
      <div className="w-28 h-28 md:w-36 md:h-36 rounded-xl bg-secondary overflow-hidden shrink-0 relative">
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
        {isOnSale && (
          <div className="absolute top-2 left-2 bg-red-500 text-white text-[10px] font-bold uppercase tracking-widest px-2 py-0.5 rounded-md shadow-sm">
            -{Math.round((1 - parseFloat(price.amount) / parseFloat(variant.compareAtPrice.amount)) * 100)}%
          </div>
        )}
      </div>
      <div className="flex flex-col justify-center gap-1.5 flex-1 min-w-0">
        <h3 className="font-display text-sm md:text-base font-semibold uppercase tracking-wide truncate">
          {node.title}
        </h3>
        <div className="flex items-center gap-2">
          <p className="text-secondary-foreground font-bold text-sm">
            {price.currencyCode} {parseFloat(price.amount).toFixed(2)}
          </p>
          {isOnSale && (
            <span className="text-xs text-muted-foreground line-through decoration-muted-foreground/50">
              {variant.compareAtPrice.currencyCode} {parseFloat(variant.compareAtPrice.amount).toFixed(2)}
            </span>
          )}
        </div>
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
  searchQuery, onSearchChange,
  availableTypes, selectedTypes, onToggleType,
  availableVendors, selectedVendors, onToggleVendor,
  availabilityFilter, onAvailabilityChange, stockCounts,
  priceRange, onPriceRange, maxPrice,
  onSaleOnly, onToggleSale,
  dynamicOptions, selectedOptions, onToggleOption,
  hasActiveFilters, onClear,
}: {
  searchQuery: string;
  onSearchChange: (v: string) => void;
  availableTypes: string[];
  selectedTypes: Set<string>;
  onToggleType: (t: string) => void;
  availableVendors: string[];
  selectedVendors: Set<string>;
  onToggleVendor: (v: string) => void;
  availabilityFilter: { inStock: boolean; outOfStock: boolean };
  onAvailabilityChange: (k: "inStock" | "outOfStock", v: boolean) => void;
  stockCounts: { inStock: number; outOfStock: number };
  priceRange: [number, number];
  onPriceRange: (v: [number, number]) => void;
  maxPrice: number;
  onSaleOnly: boolean;
  onToggleSale: (v: boolean) => void;
  dynamicOptions: Array<{ name: string; values: string[] }>;
  selectedOptions: Map<string, Set<string>>;
  onToggleOption: (name: string, value: string) => void;
  hasActiveFilters: boolean;
  onClear: () => void;
}) {
  return (
    <div className="flex flex-col h-full">
      <div className="px-5 flex-1 overflow-y-auto pb-8">
        {/* SIDEBAR SEARCH */}
        <div className="pt-5 pb-6">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search items..."
              value={searchQuery}
              onChange={(e) => onSearchChange(e.target.value)}
              className="pl-9 bg-secondary/50 border-border rounded-xl h-11"
            />
          </div>
        </div>

        <Accordion type="multiple" defaultValue={["categories", "availability", "price", "sale"]} className="w-full">
          
          {/* PRODUCT TYPE */}
          {availableTypes.length > 0 && (
            <AccordionItem value="categories" className="border-border">
              <AccordionTrigger className="text-xs font-bold uppercase tracking-widest hover:no-underline py-4">
                Product Type
              </AccordionTrigger>
              <AccordionContent>
                <div className="space-y-2 mt-1">
                  {availableTypes.map((type) => (
                    <button
                      key={type}
                      onClick={() => onToggleType(type)}
                      className={`flex items-center gap-2 text-sm w-full text-left transition-colors ${
                        selectedTypes.has(type) ? "text-foreground font-semibold" : "text-muted-foreground hover:text-foreground"
                      }`}
                    >
                      <div className={`w-4 h-4 rounded border flex items-center justify-center transition-colors ${
                        selectedTypes.has(type) ? "bg-primary border-primary" : "border-border"
                      }`}>
                        {selectedTypes.has(type) && <Check className="h-3 w-3 text-primary-foreground" />}
                      </div>
                      {type}
                    </button>
                  ))}
                </div>
              </AccordionContent>
            </AccordionItem>
          )}

          {/* VENDORS / BRANDS */}
          {availableVendors.length > 0 && (
            <AccordionItem value="vendors" className="border-border">
              <AccordionTrigger className="text-xs font-bold uppercase tracking-widest hover:no-underline py-4">
                Brand
              </AccordionTrigger>
              <AccordionContent>
                <div className="space-y-2 mt-1">
                  {availableVendors.map((vendor) => (
                    <button
                      key={vendor}
                      onClick={() => onToggleVendor(vendor)}
                      className={`flex items-center gap-2 text-sm w-full text-left transition-colors ${
                        selectedVendors.has(vendor) ? "text-foreground font-semibold" : "text-muted-foreground hover:text-foreground"
                      }`}
                    >
                      <div className={`w-4 h-4 rounded border flex items-center justify-center transition-colors ${
                        selectedVendors.has(vendor) ? "bg-primary border-primary" : "border-border"
                      }`}>
                        {selectedVendors.has(vendor) && <Check className="h-3 w-3 text-primary-foreground" />}
                      </div>
                      {vendor}
                    </button>
                  ))}
                </div>
              </AccordionContent>
            </AccordionItem>
          )}

          {/* AVAILABILITY */}
          <AccordionItem value="availability" className="border-border">
            <AccordionTrigger className="text-xs font-bold uppercase tracking-widest hover:no-underline py-4">
              Availability
            </AccordionTrigger>
            <AccordionContent>
              <div className="space-y-3 mt-1">
                {[
                  { id: "av-in", key: "inStock" as const, label: `In stock`, count: stockCounts.inStock },
                  { id: "av-out", key: "outOfStock" as const, label: `Out of stock`, count: stockCounts.outOfStock },
                ].map(({ id, key, label, count }) => (
                  <div key={id} className="flex items-center justify-between">
                    <div className="flex items-center gap-2.5">
                      <Checkbox 
                        id={id} 
                        checked={availabilityFilter[key]} 
                        onCheckedChange={(v) => onAvailabilityChange(key, !!v)}
                      />
                      <label htmlFor={id} className="text-sm cursor-pointer select-none text-muted-foreground">{label}</label>
                    </div>
                    <span className="text-[10px] text-muted-foreground/60 font-mono tracking-tighter transition-all duration-300">({count})</span>
                  </div>
                ))}
              </div>
            </AccordionContent>
          </AccordionItem>

          {/* OFFERS / SALE */}
          <AccordionItem value="sale" className="border-border">
            <AccordionTrigger className="text-xs font-bold uppercase tracking-widest hover:no-underline py-4">
              Special Offers
            </AccordionTrigger>
            <AccordionContent>
              <div className="flex items-center justify-between mt-1">
                <div className="flex items-center gap-2.5">
                  <Checkbox 
                    id="on-sale" 
                    checked={onSaleOnly} 
                    onCheckedChange={(v) => onToggleSale(!!v)}
                  />
                  <label htmlFor="on-sale" className="text-sm cursor-pointer select-none text-muted-foreground">On Sale</label>
                </div>
                <Tag className="h-3.5 w-3.5 text-[#BF953F]" />
              </div>
            </AccordionContent>
          </AccordionItem>

          {/* PRICE */}
          <AccordionItem value="price" className="border-border">
            <AccordionTrigger className="text-xs font-bold uppercase tracking-widest hover:no-underline py-4">
              Price Range
            </AccordionTrigger>
            <AccordionContent>
              <div className="pt-2 pb-1">
                <Slider
                  value={priceRange}
                  onValueChange={(v) => onPriceRange(v as [number, number])}
                  min={0} max={maxPrice} step={1} className="mb-4"
                />
                <div className="flex items-center gap-2 text-sm font-medium">
                  <div className="flex-1 bg-secondary border border-border rounded-lg p-2 text-center text-xs">
                    <span className="text-muted-foreground mr-1">Min:</span> ${priceRange[0]}
                  </div>
                  <Minus className="h-3 w-3 text-muted-foreground" />
                  <div className="flex-1 bg-secondary border border-border rounded-lg p-2 text-center text-xs">
                    <span className="text-muted-foreground mr-1">Max:</span> ${priceRange[1]}
                  </div>
                </div>
              </div>
            </AccordionContent>
          </AccordionItem>

          {/* DYNAMIC OPTIONS (Size, Color, etc.) */}
          {dynamicOptions.map((opt) => (
            <AccordionItem key={opt.name} value={`opt-${opt.name}`} className="border-border">
              <AccordionTrigger className="text-xs font-bold uppercase tracking-widest hover:no-underline py-4">
                {opt.name}
              </AccordionTrigger>
              <AccordionContent>
                <div className="flex flex-wrap gap-2 mt-1">
                  {opt.values.map((val) => {
                    const isColor = opt.name.toLowerCase() === "color" || opt.name.toLowerCase() === "couleur";
                    const isSelected = selectedOptions.get(opt.name)?.has(val);
                    
                    if (isColor) {
                      const bg = COLOUR_MAP[val.toLowerCase()] ?? val.toLowerCase();
                      const isGrad = bg.startsWith("conic") || bg.startsWith("linear");
                      return (
                        <button
                          key={val}
                          onClick={() => onToggleOption(opt.name, val)}
                          title={val}
                          className={`
                            h-8 w-8 rounded-full transition-all duration-200 shadow-sm
                            ${isSelected ? "ring-2 ring-offset-2 ring-[#BF953F] scale-110" : "hover:scale-110"}
                            ${val.toLowerCase() === "white" ? "border border-border" : ""}
                          `}
                          style={isGrad ? { backgroundImage: bg } : { backgroundColor: bg }}
                        />
                      );
                    }

                    return (
                      <button
                        key={val}
                        onClick={() => onToggleOption(opt.name, val)}
                        className={`
                          min-w-[2.5rem] px-3 py-2 rounded-lg border text-xs font-semibold transition-all duration-200
                          ${isSelected
                            ? "bg-[#BF953F] text-black border-transparent shadow-md"
                            : "bg-secondary/50 text-foreground border-border hover:border-[#BF953F]/50"}
                        `}
                      >
                        {val}
                      </button>
                    );
                  })}
                </div>
              </AccordionContent>
            </AccordionItem>
          ))}

        </Accordion>
      </div>

      {/* Reset */}
      <div className="px-5 pb-5 pt-4 shrink-0 bg-background/80 backdrop-blur-sm border-t border-border">
        <Button
          onClick={onClear} 
          disabled={!hasActiveFilters}
          variant={hasActiveFilters ? "default" : "secondary"}
          className={`w-full py-6 rounded-xl text-sm font-bold tracking-widest uppercase transition-all duration-300 ${
            hasActiveFilters ? "bg-foreground text-background" : ""
          }`}
        >
          <RotateCcw className={`h-4 w-4 mr-2 ${hasActiveFilters ? "animate-spin-once" : ""}`} />
          Clear All
        </Button>
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
  const [selectedTypes, setSelectedTypes] = useState<Set<string>>(new Set());
  const [selectedVendors, setSelectedVendors] = useState<Set<string>>(new Set());
  const [selectedOptions, setSelectedOptions] = useState<Map<string, Set<string>>>(new Map());
  const [availabilityFilter, setAvailabilityFilter] = useState({ inStock: false, outOfStock: false });
  const [onSaleOnly, setOnSaleOnly] = useState(false);
  const [internalSearch, setInternalSearch] = useState("");
  
  const [visibleCount, setVisibleCount] = useState(PAGE_SIZE);
  const [loadingMore, setLoadingMore] = useState(false);
  const [viewMode, setViewMode] = useState<ViewMode>("grid");
  const [searchParams, setSearchParams] = useSearchParams();
  const searchQuery = searchParams.get("q") || "";
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

  // Dynamically extract Brands
  const availableVendors = useMemo(() => {
    const v = new Set<string>();
    products.forEach(p => p.node.vendor && v.add(p.node.vendor));
    return Array.from(v).sort();
  }, [products]);

  // Dynamically extract Product Types
  const availableTypes = useMemo(() => {
    const t = new Set<string>();
    products.forEach(p => p.node.productType && t.add(p.node.productType));
    return Array.from(t).sort();
  }, [products]);

  // Dynamically extract Options (ignoring "Title")
  const dynamicOptions = useMemo(() => {
    const optsMap = new Map<string, Set<string>>();
    products.forEach(p => {
      p.node.options.forEach(opt => {
        if (opt.name.toLowerCase() === "title") return;
        if (!optsMap.has(opt.name)) optsMap.set(opt.name, new Set());
        opt.values.forEach(val => {
           if (val.toLowerCase() !== "default title") optsMap.get(opt.name)?.add(val);
        });
      });
    });
    return Array.from(optsMap.entries())
      .map(([name, values]) => ({ name, values: Array.from(values).sort() }))
      .filter(o => o.values.length > 0);
  }, [products]);

  const stockCounts = useMemo(() => {
    let inStock = 0, outOfStock = 0;
    products.forEach((p) => (p.node.availableForSale ? inStock++ : outOfStock++));
    return { inStock, outOfStock };
  }, [products]);

  const toggleOption = (name: string, value: string) => {
    setSelectedOptions((prev) => {
      const next = new Map(prev);
      const values = new Set(next.get(name) || []);
      values.has(value) ? values.delete(value) : values.add(value);
      if (values.size === 0) next.delete(name);
      else next.set(name, values);
      return next;
    });
  };

  const toggleType = (t: string) =>
    setSelectedTypes(prev => { const n = new Set(prev); n.has(t) ? n.delete(t) : n.add(t); return n; });

  const toggleVendor = (v: string) =>
    setSelectedVendors(prev => { const n = new Set(prev); n.has(v) ? n.delete(v) : n.add(v); return n; });

  /* Active filter chips data */
  const activeChips = useMemo(() => {
    const chips: { label: string; onRemove: () => void }[] = [];
    if (sortBy !== "default")
      chips.push({ label: `Sort: ${SORT_LABELS[sortBy]}`, onRemove: () => setSortBy("default") });
    
    selectedTypes.forEach(t => chips.push({ label: `Type: ${t}`, onRemove: () => toggleType(t) }));
    selectedVendors.forEach(v => chips.push({ label: `Brand: ${v}`, onRemove: () => toggleVendor(v) }));
    
    if (availabilityFilter.inStock)
      chips.push({ label: "In stock", onRemove: () => setAvailabilityFilter((p) => ({ ...p, inStock: false })) });
    if (availabilityFilter.outOfStock)
      chips.push({ label: "Out of stock", onRemove: () => setAvailabilityFilter((p) => ({ ...p, outOfStock: false })) });
    
    if (onSaleOnly)
      chips.push({ label: "On Sale", onRemove: () => setOnSaleOnly(false) });

    if (priceRange[0] > 0 || priceRange[1] < maxPrice)
      chips.push({ label: `$${priceRange[0]} – $${priceRange[1]}`, onRemove: () => setPriceRange([0, maxPrice]) });
    
    selectedOptions.forEach((vals, name) => {
      vals.forEach(v => chips.push({ label: `${name}: ${v}`, onRemove: () => toggleOption(name, v) }));
    });

    if (searchQuery || internalSearch) {
      const q = searchQuery || internalSearch;
      chips.push({ label: `Search: "${q}"`, onRemove: () => {
        setInternalSearch("");
        if (searchQuery) {
          const newParams = new URLSearchParams(searchParams);
          newParams.delete("q");
          setSearchParams(newParams);
        }
      }});
    }
    return chips;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [sortBy, selectedTypes, selectedVendors, availabilityFilter, onSaleOnly, priceRange, maxPrice, selectedOptions, searchQuery, internalSearch]);

  const activeFilterCount = activeChips.length;

  const filtered = useMemo(() => {
    let result = [...products];

    const q = (searchQuery || internalSearch).toLowerCase();
    if (q) {
      result = result.filter((p) => 
        p.node.title.toLowerCase().includes(q) || 
        p.node.vendor.toLowerCase().includes(q) ||
        p.node.productType.toLowerCase().includes(q) ||
        p.node.tags.some(t => t.toLowerCase().includes(q))
      );
    }

    if (selectedTypes.size > 0)
      result = result.filter(p => selectedTypes.has(p.node.productType));

    if (selectedVendors.size > 0)
      result = result.filter(p => selectedVendors.has(p.node.vendor));

    if (availabilityFilter.inStock || availabilityFilter.outOfStock) {
      result = result.filter((p) => {
        if (availabilityFilter.inStock && p.node.availableForSale) return true;
        if (availabilityFilter.outOfStock && !p.node.availableForSale) return true;
        return false;
      });
    }

    if (onSaleOnly) {
      result = result.filter(p => 
        p.node.variants.edges.some(v => v.node.compareAtPrice && parseFloat(v.node.compareAtPrice.amount) > parseFloat(v.node.price.amount))
      );
    }

    result = result.filter((p) => {
      const price = parseFloat(p.node.priceRange.minVariantPrice.amount);
      return price >= priceRange[0] && price <= priceRange[1];
    });

    if (selectedOptions.size > 0) {
      result = result.filter(p => {
        return Array.from(selectedOptions.entries()).every(([optName, selectedValues]) => {
          return p.node.options.some(opt => 
            opt.name === optName && opt.values.some(v => selectedValues.has(v))
          );
        });
      });
    }

    switch (sortBy) {
      case "newest": result = [...result].reverse(); break;
      case "price-asc": result.sort((a, b) => parseFloat(a.node.priceRange.minVariantPrice.amount) - parseFloat(b.node.priceRange.minVariantPrice.amount)); break;
      case "price-desc": result.sort((a, b) => parseFloat(b.node.priceRange.minVariantPrice.amount) - parseFloat(a.node.priceRange.minVariantPrice.amount)); break;
      case "name-asc": result.sort((a, b) => a.node.title.localeCompare(b.node.title)); break;
      case "name-desc": result.sort((a, b) => b.node.title.localeCompare(a.node.title)); break;
    }

    return result;
  }, [products, sortBy, priceRange, selectedOptions, selectedTypes, selectedVendors, availabilityFilter, onSaleOnly, searchQuery, internalSearch]);

  useEffect(() => { setVisibleCount(PAGE_SIZE); }, [filtered.length, sortBy]);

  const hasActiveFilters = activeFilterCount > 0;
  const visibleProducts = filtered.slice(0, visibleCount);
  const hasMore = visibleCount < filtered.length;

  const clearFilters = useCallback(() => {
    setSortBy("default");
    setPriceRange([0, maxPrice]);
    setSelectedTypes(new Set());
    setSelectedVendors(new Set());
    setSelectedOptions(new Map());
    setAvailabilityFilter({ inStock: false, outOfStock: false });
    setOnSaleOnly(false);
    setInternalSearch("");
    setSearchParams(new URLSearchParams());
  }, [maxPrice, setSearchParams]);

  const handleLoadMore = () => {
    setLoadingMore(true);
    setTimeout(() => { setVisibleCount((c) => c + PAGE_SIZE); setLoadingMore(false); }, 400);
  };

  /* shared filter panel props */
  const filterPanelProps = {
    searchQuery: internalSearch,
    onSearchChange: setInternalSearch,
    availableTypes, selectedTypes, onToggleType: toggleType,
    availableVendors, selectedVendors, onToggleVendor: toggleVendor,
    availabilityFilter, onAvailabilityChange: (k: "inStock" | "outOfStock", v: boolean) =>
      setAvailabilityFilter((p) => ({ ...p, [k]: v })),
    stockCounts, priceRange, onPriceRange: setPriceRange, maxPrice,
    onSaleOnly, onToggleSale: setOnSaleOnly,
    dynamicOptions, selectedOptions, onToggleOption: toggleOption,
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
                      <span className="absolute -top-2 -right-4 h-4 w-4 rounded-full bg-gradient-to-r from-[#BF953F] via-[#FCF6BA] to-[#B38728] text-black text-[10px] font-bold flex items-center justify-center">
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
                  <span className="px-2 py-0.5 rounded-full bg-[#BF953F]/10 text-[#BF953F] text-xs font-semibold">
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
                    <span className="h-5 w-5 rounded-full bg-gradient-to-r from-[#BF953F] via-[#FCF6BA] to-[#B38728] text-black text-[10px] font-bold flex items-center justify-center">
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
                          className="h-full bg-gradient-to-r from-[#BF953F] to-[#B38728] rounded-full transition-all duration-500"
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
