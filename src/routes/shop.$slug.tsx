import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import {
  fetchProductBySlug,
  fetchProducts,
  getSizePrice,
  isLowStock,
  isOutOfStock,
  type Product,
} from "@/lib/products";
import { useCart } from "@/store/cart";
import { ProductCard } from "@/components/product-card";
import { Minus, Plus, Star, Check, AlertCircle, Search, X } from "lucide-react";

export const Route = createFileRoute("/shop/$slug")({
  component: ProductPage,
});

const materialLabels: Record<string, string> = { wood: "خشب", metal: "معدن", composite: "مركّب" };
const colorLabels: Record<string, string> = {
  black: "أسود",
  white: "أبيض",
  natural: "طبيعي",
  brass: "نحاسي",
  gold: "ذهبي",
};
const categoryLabels: Record<string, string> = {
  wall: "حائط",
  tabletop: "طاولة",
  gallery: "جاليري",
};

function ProductPage() {
  const { slug } = Route.useParams();
  return <ProductPageContent slug={slug} />;
}

export function ProductPageContent({ slug }: { slug: string }) {
  const { add } = useCart();
  const [product, setProduct] = useState<Product | null>(null);
  const [related, setRelated] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [size, setSize] = useState<string>("");
  const [qty, setQty] = useState(1);
  const [added, setAdded] = useState(false);
  const [activeImage, setActiveImage] = useState(0);
  const [zoomOpen, setZoomOpen] = useState(false);

  useEffect(() => {
    setLoading(true);
    fetchProductBySlug(slug)
      .then((p) => {
        setProduct(p);
        setActiveImage(0);
        if (p) setSize(p.sizePrices[0]?.size ?? p.sizes[0] ?? "افتراضي");
      })
      .finally(() => setLoading(false));
    fetchProducts().then((all) => setRelated(all.filter((x) => x.slug !== slug).slice(0, 3)));
  }, [slug]);

  if (loading) {
    return (
      <div className="mx-auto max-w-[1400px] px-6 py-16 animate-pulse">
        <div className="grid gap-10 lg:grid-cols-12">
          <div className="lg:col-span-7 aspect-[4/3] bg-secondary rounded-lg" />
          <div className="lg:col-span-5 space-y-4">
            <div className="h-8 w-3/4 bg-secondary rounded" />
            <div className="h-4 w-1/2 bg-secondary rounded" />
            <div className="h-20 bg-secondary rounded" />
          </div>
        </div>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="mx-auto max-w-2xl px-6 py-32 text-center">
        <p className="text-3xl font-semibold">الإطار غير موجود.</p>
        <Link
          to="/shop"
          className="mt-8 inline-block rounded-full bg-foreground px-5 py-3 text-sm text-background"
        >
          العودة للمتجر
        </Link>
      </div>
    );
  }

  const out = isOutOfStock(product);
  const low = isLowStock(product);
  const maxQty = product.trackStock ? Math.max(1, product.stock) : 99;
  const selectedPrice = getSizePrice(product, size);
  const gallery =
    product.galleryImages.length > 0
      ? product.galleryImages
      : [{ url: product.image, urlRaw: product.imageRaw, altText: product.name, sortOrder: 0 }];
  const selectedImage = gallery[Math.min(activeImage, gallery.length - 1)] ?? gallery[0];

  const handleAdd = () => {
    if (!size || out) return;
    add(product.id, size, qty);
    setAdded(true);
    setTimeout(() => setAdded(false), 1800);
  };

  return (
    <div>
      <div className="mx-auto max-w-[1400px] px-6 md:px-10 py-6">
        <nav className="text-sm flex items-center gap-2 text-muted-foreground">
          <Link to="/" className="hover:text-foreground">
            الرئيسية
          </Link>
          <span>/</span>
          <Link to="/shop" className="hover:text-foreground">
            المتجر
          </Link>
          <span>/</span>
          <span className="text-foreground">{product.name}</span>
        </nav>
      </div>

      <section className="mx-auto max-w-[1400px] px-6 md:px-10 pb-16">
        <div className="grid gap-10 lg:grid-cols-12 lg:gap-16">
          <div className="lg:col-span-7">
            <button
              type="button"
              onClick={() => setZoomOpen(true)}
              className="group relative block w-full aspect-[4/3] rounded-lg overflow-hidden bg-secondary text-start"
              aria-label="تكبير صورة المنتج"
            >
              <img
                src={selectedImage.url}
                alt={selectedImage.altText || product.name}
                className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-[1.04]"
              />
              <span className="absolute bottom-4 end-4 inline-flex h-11 w-11 items-center justify-center rounded-full bg-background/90 backdrop-blur text-foreground shadow-sm">
                <Search className="h-5 w-5" />
              </span>
            </button>
            <div className="mt-3 grid grid-cols-4 sm:grid-cols-6 gap-3">
              {gallery.map((image, i) => (
                <button
                  type="button"
                  key={`${image.urlRaw ?? image.url}-${i}`}
                  onClick={() => setActiveImage(i)}
                  className={`aspect-square rounded-lg overflow-hidden bg-secondary border transition-colors ${
                    i === activeImage
                      ? "border-foreground"
                      : "border-transparent hover:border-border"
                  }`}
                  aria-label={`عرض صورة ${i + 1}`}
                >
                  <img
                    src={image.url}
                    alt=""
                    loading="lazy"
                    className="h-full w-full object-cover"
                  />
                </button>
              ))}
            </div>
          </div>

          <div className="lg:col-span-5 lg:sticky lg:top-28 lg:self-start">
            {product.badge && (
              <span className="inline-block rounded-full bg-secondary px-3 py-1 text-xs mb-4">
                {product.badge}
              </span>
            )}
            <h1 className="display-ar text-[clamp(1.75rem,4vw,2.75rem)] font-bold">
              {product.name}
            </h1>
            <p className="mt-2 text-base text-muted-foreground">{product.tagline}</p>

            <div className="mt-6 flex items-baseline gap-4">
              <p className="text-2xl font-bold">{selectedPrice} ج.م</p>
              <div className="flex items-center gap-1">
                {[...Array(5)].map((_, i) => (
                  <Star key={i} className="h-3.5 w-3.5 fill-foreground text-foreground" />
                ))}
                <span className="ms-2 text-xs text-muted-foreground">(248 تقييم)</span>
              </div>
            </div>

            {/* Stock status */}
            <div className="mt-4">
              {out ? (
                <div className="inline-flex items-center gap-2 rounded-full bg-foreground text-background px-3 py-1.5 text-xs font-semibold">
                  <AlertCircle className="h-3.5 w-3.5" /> نفد المخزون
                </div>
              ) : low ? (
                <div className="inline-flex items-center gap-2 rounded-full bg-amber-500/15 text-amber-700 dark:text-amber-400 px-3 py-1.5 text-xs font-semibold">
                  <AlertCircle className="h-3.5 w-3.5" /> كمية محدودة — متبقي {product.stock} فقط
                </div>
              ) : product.trackStock ? (
                <div className="inline-flex items-center gap-2 rounded-full bg-emerald-500/15 text-emerald-700 dark:text-emerald-400 px-3 py-1.5 text-xs font-semibold">
                  <Check className="h-3.5 w-3.5" /> متوفر
                </div>
              ) : null}
            </div>

            <p className="mt-6 text-sm leading-relaxed text-muted-foreground">
              {product.description}
            </p>

            {product.sizes.length > 0 && (
              <div className="mt-8">
                <p className="text-sm font-semibold mb-3">المقاس</p>
                <div className="flex flex-wrap gap-2">
                  {(product.sizePrices.length > 0
                    ? product.sizePrices
                    : product.sizes.map((s, i) => ({ size: s, price: product.price, sortOrder: i }))
                  ).map((sp) => (
                    <button
                      key={sp.size}
                      onClick={() => setSize(sp.size)}
                      className={`text-sm px-4 py-2 rounded-full border transition-colors ${
                        size === sp.size
                          ? "bg-foreground text-background border-foreground"
                          : "border-border hover:border-foreground"
                      }`}
                    >
                      {sp.size} · {sp.price} ج.م
                    </button>
                  ))}
                </div>
              </div>
            )}

            <div className="mt-8 flex items-stretch gap-3">
              <div className="flex items-stretch rounded-full border border-border">
                <button
                  type="button"
                  onClick={() => setQty((q) => Math.max(1, q - 1))}
                  disabled={out}
                  className="px-4 hover:bg-secondary rounded-s-full transition-colors disabled:opacity-50"
                  aria-label="إنقاص"
                >
                  <Minus className="h-4 w-4" />
                </button>
                <span className="flex w-10 items-center justify-center text-sm font-semibold">
                  {qty}
                </span>
                <button
                  type="button"
                  onClick={() => setQty((q) => Math.min(maxQty, q + 1))}
                  disabled={out || qty >= maxQty}
                  className="px-4 hover:bg-secondary rounded-e-full transition-colors disabled:opacity-50"
                  aria-label="زيادة"
                >
                  <Plus className="h-4 w-4" />
                </button>
              </div>
              <button
                onClick={handleAdd}
                disabled={out}
                className="flex-1 rounded-full bg-foreground px-6 py-3 text-sm font-semibold text-background hover:opacity-90 transition-opacity flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {out ? (
                  <>نفد المخزون</>
                ) : added ? (
                  <>
                    <Check className="h-4 w-4" /> تمت الإضافة للسلة
                  </>
                ) : (
                  <>أضف للسلة — {selectedPrice * qty} ج.م</>
                )}
              </button>
            </div>

            <div className="mt-8 grid grid-cols-2 gap-4">
              <Spec label="الخامة" value={materialLabels[product.material] ?? product.material} />
              <Spec label="اللون" value={colorLabels[product.color] ?? product.color} />
              <Spec label="الفئة" value={categoryLabels[product.category] ?? product.category} />
              <Spec label="الشحن خلال" value="3–5 أيام" />
            </div>
          </div>
        </div>
      </section>

      {related.length > 0 && (
        <section className="mx-auto max-w-[1400px] px-6 md:px-10 py-16 md:py-24 border-t border-border">
          <div className="mb-10 flex items-end justify-between">
            <h2 className="display-ar text-[clamp(1.5rem,3vw,2.25rem)] font-bold">قطع متناسقة</h2>
            <Link
              to="/shop"
              className="text-sm text-muted-foreground hover:text-foreground transition-colors"
            >
              كل الإطارات ←
            </Link>
          </div>
          <div className="grid grid-cols-1 gap-x-6 gap-y-10 sm:grid-cols-2 lg:grid-cols-3">
            {related.map((p, i) => (
              <ProductCard key={p.id} product={p} index={i} />
            ))}
          </div>
        </section>
      )}

      {zoomOpen && (
        <div
          className="fixed inset-0 z-50 bg-foreground/80 backdrop-blur-sm flex items-center justify-center p-4"
          onClick={() => setZoomOpen(false)}
        >
          <button
            type="button"
            onClick={() => setZoomOpen(false)}
            className="absolute end-4 top-4 h-10 w-10 rounded-full bg-background text-foreground inline-flex items-center justify-center"
            aria-label="إغلاق"
          >
            <X className="h-5 w-5" />
          </button>
          <img
            src={selectedImage.url}
            alt={selectedImage.altText || product.name}
            className="max-h-[88vh] max-w-[92vw] object-contain rounded-lg bg-background"
            onClick={(e) => e.stopPropagation()}
          />
        </div>
      )}
    </div>
  );
}

function Spec({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-lg border border-border p-4">
      <p className="text-xs text-muted-foreground">{label}</p>
      <p className="mt-1 text-sm">{value}</p>
    </div>
  );
}
