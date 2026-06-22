import { createFileRoute, Link } from "@tanstack/react-router";
import { useCart } from "@/store/cart";
import { Minus, Plus, X, ArrowUpLeft } from "lucide-react";

export const Route = createFileRoute("/cart")({
  component: CartPage,
});

function CartPage() {
  const { detailed, update, remove, subtotal, count } = useCart();

  if (detailed.length === 0) {
    return (
      <div className="mx-auto max-w-2xl px-6 py-24 md:py-32 text-center">
        <p className="text-sm text-muted-foreground mb-3">سلتك</p>
        <h1 className="display-ar text-[clamp(2rem,6vw,4rem)] font-black">حوائط فارغة</h1>
        <p className="mt-6 text-muted-foreground max-w-md mx-auto">
          لا يوجد شيء هنا بعد. اختر إطاراً ولنبدأ بناء جاليريك.
        </p>
        <Link
          to="/shop"
          className="mt-8 inline-flex items-center gap-2 rounded-full bg-foreground px-5 py-3 text-sm font-semibold text-background hover:opacity-90 transition-opacity"
        >
          تصفح المتجر <ArrowUpLeft className="h-4 w-4" />
        </Link>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-[1400px] px-6 md:px-10 py-12 md:py-16">
      <div className="mb-10">
        <p className="text-sm text-muted-foreground mb-2">{count} قطعة</p>
        <h1 className="display-ar text-[clamp(2rem,5vw,3.5rem)] font-black">سلتك</h1>
      </div>

      <div className="grid gap-12 lg:grid-cols-12">
        <div className="lg:col-span-8">
          <ul className="divide-y divide-border border-y border-border">
            {detailed.map((line) => (
              <li
                key={`${line.productId}-${line.size}`}
                className="py-6 grid grid-cols-12 gap-4 items-center"
              >
                <div className="col-span-3 sm:col-span-2 aspect-square rounded-lg overflow-hidden bg-secondary">
                  <img
                    src={line.product.image}
                    alt={line.product.name}
                    className="h-full w-full object-cover"
                  />
                </div>
                <div className="col-span-9 sm:col-span-4">
                  <Link
                    to="/shop/$slug"
                    params={{ slug: line.product.slug }}
                    className="text-base font-semibold hover:underline underline-offset-4"
                  >
                    {line.product.name}
                  </Link>
                  <p className="text-xs mt-1 text-muted-foreground">المقاس {line.size}</p>
                  <p className="mt-1 sm:hidden text-base font-semibold">{line.product.price} ج.م</p>
                </div>
                <div className="col-span-6 sm:col-span-3">
                  <div className="inline-flex items-stretch rounded-full border border-border">
                    <button
                      onClick={() => update(line.productId, line.size, line.quantity - 1)}
                      className="px-3 py-2 hover:bg-secondary rounded-s-full"
                      aria-label="إنقاص"
                    >
                      <Minus className="h-3.5 w-3.5" />
                    </button>
                    <span className="w-10 flex items-center justify-center text-sm font-semibold">
                      {line.quantity}
                    </span>
                    <button
                      onClick={() => update(line.productId, line.size, line.quantity + 1)}
                      className="px-3 py-2 hover:bg-secondary rounded-e-full"
                      aria-label="زيادة"
                    >
                      <Plus className="h-3.5 w-3.5" />
                    </button>
                  </div>
                </div>
                <div className="col-span-6 sm:col-span-3 flex items-center justify-end gap-4">
                  <p className="text-base font-semibold">{line.lineTotal} ج.م</p>
                  <button
                    onClick={() => remove(line.productId, line.size)}
                    className="rounded-full p-2 hover:bg-secondary transition-colors text-muted-foreground"
                    aria-label="حذف"
                  >
                    <X className="h-4 w-4" />
                  </button>
                </div>
              </li>
            ))}
          </ul>
        </div>

        <aside className="lg:col-span-4">
          <div className="rounded-xl border border-border bg-card p-6 lg:sticky lg:top-28">
            <p className="text-base font-semibold mb-6">الملخص</p>
            <Row label="الإجمالي الفرعي" value={`${subtotal} ج.م`} />
            <Row label="الشحن" value="يُحسب حسب المحافظة" />
            <div className="mt-6 pt-6 border-t border-border flex items-baseline justify-between">
              <p className="text-base font-semibold">الإجمالي</p>
              <p className="text-2xl font-bold">{subtotal} ج.م</p>
            </div>
            <Link
              to="/checkout"
              className="mt-6 flex items-center justify-center gap-2 rounded-full bg-foreground px-6 py-3 text-sm font-semibold text-background hover:opacity-90 transition-opacity"
            >
              تأكيد الطلب <ArrowUpLeft className="h-4 w-4" />
            </Link>
            <Link
              to="/shop"
              className="mt-3 block text-center text-sm text-muted-foreground hover:text-foreground transition-colors"
            >
              متابعة التسوق
            </Link>
          </div>
        </aside>
      </div>
    </div>
  );
}

function Row({ label, value, small }: { label: string; value: string; small?: boolean }) {
  return (
    <div className="flex items-baseline justify-between py-2">
      <p className="text-sm text-muted-foreground">{label}</p>
      <p className={small ? "text-xs text-muted-foreground" : "text-sm font-semibold"}>{value}</p>
    </div>
  );
}
