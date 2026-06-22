import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import { fetchProducts, type Product } from "@/lib/products";
import {
  fetchCategories,
  fetchColors,
  fetchMaterials,
  type Category,
  type Color,
  type Material,
} from "@/lib/taxonomy";
import { ProductCard } from "@/components/product-card";

export const Route = createFileRoute("/shop")({
  component: ShopPage,
});

type SortKey = "featured" | "price-asc" | "price-desc" | "name";

function ShopPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [colors, setColors] = useState<Color[]>([]);
  const [materials, setMaterials] = useState<Material[]>([]);
  const [loading, setLoading] = useState(true);
  const [category, setCategory] = useState<string | null>(null);
  const [color, setColor] = useState<string | null>(null);
  const [material, setMaterial] = useState<string | null>(null);
  const [maxPrice, setMaxPrice] = useState(2500);
  const [sort, setSort] = useState<SortKey>("featured");

  useEffect(() => {
    Promise.all([fetchProducts(), fetchCategories(), fetchColors(), fetchMaterials()])
      .then(([p, c, co, m]) => {
        setProducts(p);
        setCategories(c);
        setColors(co);
        setMaterials(m);
        const maxP = p.reduce((acc, x) => Math.max(acc, x.price), 0);
        if (maxP > 0) setMaxPrice(Math.ceil(maxP / 100) * 100);
        if (typeof window !== "undefined") {
          const cat = new URLSearchParams(window.location.search).get("category");
          if (cat && c.some((x) => x.slug === cat)) setCategory(cat);
        }
      })
      .finally(() => setLoading(false));
  }, []);

  const priceCeiling = useMemo(
    () =>
      Math.max(
        2500,
        Math.ceil((products.reduce((a, p) => Math.max(a, p.price), 0) || 2500) / 100) * 100,
      ),
    [products],
  );

  const filtered = useMemo(() => {
    let r = products.filter((p) => {
      if (category && p.category !== category) return false;
      if (color && p.color !== color) return false;
      if (material && p.material !== material) return false;
      if (p.price > maxPrice) return false;
      return true;
    });
    if (sort === "price-asc") r = [...r].sort((a, b) => a.price - b.price);
    if (sort === "price-desc") r = [...r].sort((a, b) => b.price - a.price);
    if (sort === "name") r = [...r].sort((a, b) => a.name.localeCompare(b.name));
    return r;
  }, [category, color, material, maxPrice, sort, products]);

  const reset = () => {
    setCategory(null);
    setColor(null);
    setMaterial(null);
    setMaxPrice(priceCeiling);
    setSort("featured");
  };

  return (
    <div className="mx-auto max-w-[1400px] px-6 md:px-10 py-12 md:py-16">
      <div className="mb-12">
        <p className="text-sm text-muted-foreground mb-2">
          كل الإطارات — {loading ? "..." : `${products.length} قطعة`}
        </p>
        <h1 className="display-ar text-[clamp(2rem,5vw,3.5rem)] font-black">المتجر</h1>
      </div>

      <div className="grid gap-12 lg:grid-cols-12">
        <aside className="lg:col-span-3 lg:sticky lg:top-28 lg:self-start">
          <div className="space-y-8">
            <div className="flex items-center justify-between">
              <p className="text-sm font-semibold">الفلاتر</p>
              <button
                onClick={reset}
                className="text-sm text-muted-foreground hover:text-foreground transition-colors"
              >
                إعادة ضبط
              </button>
            </div>

            {categories.length > 0 && (
              <FilterGroup label="الفئة">
                <div className="flex flex-wrap gap-2">
                  {categories.map((c) => (
                    <button
                      key={c.id}
                      onClick={() => setCategory(category === c.slug ? null : c.slug)}
                      className={`text-xs rounded-full px-3 py-1.5 border transition-colors ${
                        category === c.slug
                          ? "bg-foreground text-background border-foreground"
                          : "border-border hover:border-foreground"
                      }`}
                    >
                      {c.name_ar}
                    </button>
                  ))}
                </div>
              </FilterGroup>
            )}

            {colors.length > 0 && (
              <FilterGroup label="اللون">
                <div className="flex flex-wrap gap-2">
                  {colors.map((c) => (
                    <button
                      key={c.id}
                      onClick={() => setColor(color === c.slug ? null : c.slug)}
                      className={`inline-flex items-center gap-2 text-xs rounded-full px-3 py-1.5 border transition-colors ${
                        color === c.slug
                          ? "bg-foreground text-background border-foreground"
                          : "border-border hover:border-foreground"
                      }`}
                    >
                      <span
                        className="h-3 w-3 rounded-full border border-border/60"
                        style={{ backgroundColor: c.hex }}
                      />
                      {c.name_ar}
                    </button>
                  ))}
                </div>
              </FilterGroup>
            )}

            {materials.length > 0 && (
              <FilterGroup label="الخامة">
                <div className="flex flex-wrap gap-2">
                  {materials.map((m) => (
                    <button
                      key={m.id}
                      onClick={() => setMaterial(material === m.slug ? null : m.slug)}
                      className={`text-xs rounded-full px-3 py-1.5 border transition-colors ${
                        material === m.slug
                          ? "bg-foreground text-background border-foreground"
                          : "border-border hover:border-foreground"
                      }`}
                    >
                      {m.name_ar}
                    </button>
                  ))}
                </div>
              </FilterGroup>
            )}

            <FilterGroup label={`أقصى سعر — ${maxPrice} ج.م`}>
              <input
                type="range"
                min={500}
                max={priceCeiling}
                step={100}
                value={maxPrice}
                onChange={(e) => setMaxPrice(Number(e.target.value))}
                className="w-full accent-foreground"
              />
              <div className="flex justify-between text-xs text-muted-foreground mt-2">
                <span>500 ج.م</span>
                <span>{priceCeiling} ج.م</span>
              </div>
            </FilterGroup>
          </div>
        </aside>

        <div className="lg:col-span-9">
          <div className="mb-8 flex items-center justify-between border-b border-border pb-4">
            <p className="text-sm text-muted-foreground">
              {loading ? "جاري التحميل..." : `${filtered.length} نتيجة`}
            </p>
            <select
              value={sort}
              onChange={(e) => setSort(e.target.value as SortKey)}
              className="rounded-full border border-border bg-background px-3 py-1.5 text-sm cursor-pointer focus:outline-none focus:border-foreground"
            >
              <option value="featured">المميز</option>
              <option value="price-asc">السعر ↑</option>
              <option value="price-desc">السعر ↓</option>
              <option value="name">الاسم أ-ي</option>
            </select>
          </div>

          {loading ? (
            <div className="grid grid-cols-1 gap-x-6 gap-y-10 sm:grid-cols-2 xl:grid-cols-3">
              {[...Array(6)].map((_, i) => (
                <div key={i} className="animate-pulse">
                  <div className="aspect-square rounded-lg bg-secondary" />
                  <div className="mt-4 h-4 w-3/4 bg-secondary rounded" />
                  <div className="mt-2 h-3 w-1/2 bg-secondary rounded" />
                </div>
              ))}
            </div>
          ) : filtered.length === 0 ? (
            <div className="rounded-lg border border-border p-16 text-center">
              <p className="text-xl font-semibold">لا يوجد شيء هنا.</p>
              <p className="mt-2 text-sm text-muted-foreground">
                جرّب تخفيف الفلاتر للعثور على المزيد.
              </p>
              <button
                onClick={reset}
                className="mt-6 rounded-full bg-foreground px-5 py-2.5 text-sm font-semibold text-background hover:opacity-90 transition-opacity"
              >
                إعادة ضبط الفلاتر
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-x-6 gap-y-10 sm:grid-cols-2 xl:grid-cols-3">
              {filtered.map((p, i) => (
                <ProductCard key={p.id} product={p} index={i} />
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function FilterGroup({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <p className="text-sm font-semibold mb-3">{label}</p>
      {children}
    </div>
  );
}
