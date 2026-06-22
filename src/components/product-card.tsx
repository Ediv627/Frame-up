import { Link } from "@tanstack/react-router";
import { useState } from "react";
import { getSizePrice, isLowStock, isOutOfStock, type Product } from "@/lib/products";
import { useCart } from "@/store/cart";
import { Check, ShoppingBag } from "lucide-react";
import { toast } from "sonner";

export function ProductCard({ product }: { product: Product; index?: number }) {
  const out = isOutOfStock(product);
  const low = isLowStock(product);
  const { add } = useCart();
  const [picking, setPicking] = useState(false);
  const [added, setAdded] = useState(false);

  const handleQuickAdd = (e: React.MouseEvent, size?: string) => {
    e.preventDefault();
    e.stopPropagation();
    if (out) return;

    // If multiple sizes and no size chosen yet, open the size picker
    if (!size && product.sizes.length > 1) {
      setPicking(true);
      return;
    }

    const finalSize = size ?? product.sizes[0] ?? "افتراضي";
    add(product.id, finalSize, 1);
    setPicking(false);
    setAdded(true);
    toast.success(`تمت إضافة ${product.name} للسلة`);
    setTimeout(() => setAdded(false), 1800);
  };

  return (
    <Link
      to="/$slug"
      params={{ slug: product.slug }}
      className="group block"
    >
      <div className="relative aspect-square overflow-hidden rounded-lg bg-secondary">
        <img
          src={product.image}
          alt={product.name}
          loading="lazy"
          width={1024}
          height={1024}
          className={`h-full w-full object-cover transition-transform duration-700 group-hover:scale-[1.03] ${
            out ? "opacity-60" : ""
          }`}
        />

        {/* Badges */}
        {product.badge && !out && (
          <span className="absolute end-3 top-3 rounded-full bg-background/90 backdrop-blur px-3 py-1 text-[11px] font-semibold">
            {product.badge}
          </span>
        )}
        {out && (
          <span className="absolute end-3 top-3 rounded-full bg-foreground text-background px-3 py-1 text-[11px] font-semibold">
            نفد المخزون
          </span>
        )}
        {!out && low && (
          <span className="absolute end-3 top-3 rounded-full bg-amber-500 text-white px-3 py-1 text-[11px] font-semibold">
            كمية محدودة
          </span>
        )}

        {/* Quick add button — bottom of image */}
        {!out && !picking && (
          <button
            type="button"
            onClick={(e) => handleQuickAdd(e)}
            className="absolute inset-x-3 bottom-3 inline-flex items-center justify-center gap-2 rounded-full bg-background/95 backdrop-blur px-4 py-2.5 text-xs font-semibold opacity-0 group-hover:opacity-100 transition-opacity hover:bg-foreground hover:text-background shadow-md focus:opacity-100"
            aria-label={`أضف ${product.name} للسلة`}
          >
            {added ? (
              <>
                <Check className="h-3.5 w-3.5" /> تمت الإضافة
              </>
            ) : (
              <>
                <ShoppingBag className="h-3.5 w-3.5" /> أضف للسلة
              </>
            )}
          </button>
        )}

        {/* Size picker overlay */}
        {picking && (
          <div
            className="absolute inset-0 bg-background/95 backdrop-blur-sm flex flex-col items-center justify-center p-4 gap-3"
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
            }}
          >
            <p className="text-xs font-semibold">اختر المقاس</p>
            <div className="flex flex-wrap justify-center gap-2 max-w-full">
              {(product.sizePrices.length > 0 ? product.sizePrices : product.sizes.map((s, i) => ({ size: s, price: product.price, sortOrder: i }))).map((sp) => (
                <button
                  key={sp.size}
                  type="button"
                  onClick={(e) => handleQuickAdd(e, sp.size)}
                  className="text-xs px-3 py-1.5 rounded-full border border-border bg-background hover:bg-foreground hover:text-background transition-colors"
                >
                  {sp.size} · {sp.price} ج.م
                </button>
              ))}
            </div>
            <button
              type="button"
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                setPicking(false);
              }}
              className="text-[11px] text-muted-foreground hover:text-foreground mt-1"
            >
              إلغاء
            </button>
          </div>
        )}
      </div>

      <div className="mt-4 flex items-start justify-between gap-4">
        <div>
          <h3 className="text-base font-semibold">{product.name}</h3>
          <p className="mt-0.5 text-sm text-muted-foreground">{product.tagline}</p>
        </div>
        <p className="text-base font-semibold whitespace-nowrap">
          {product.sizePrices.length > 1 ? "من " : ""}{getSizePrice(product, product.sizePrices[0]?.size ?? product.sizes[0] ?? "")} ج.م
        </p>
      </div>
    </Link>
  );
}
