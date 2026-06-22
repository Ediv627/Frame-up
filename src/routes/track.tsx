import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { resolveImage } from "@/lib/product-images";
import { Package, Search, CheckCircle2, Clock, Truck, XCircle } from "lucide-react";
import { toast } from "sonner";

export const Route = createFileRoute("/track")({
  component: TrackPage,
});

type TrackOrder = {
  id: string;
  created_at: string;
  status: "pending" | "confirmed" | "shipped" | "delivered" | "cancelled";
  total: number;
  shipping: number;
  subtotal: number;
  customer_name: string;
  city: string;
  address: string;
};

type TrackItem = {
  product_name: string;
  size: string;
  quantity: number;
  unit_price: number;
  line_total: number;
  product_image: string | null;
};

const STATUS_STEPS = [
  { key: "pending", label: "قيد المراجعة", icon: Clock },
  { key: "confirmed", label: "تم التأكيد", icon: CheckCircle2 },
  { key: "shipped", label: "في الطريق", icon: Truck },
  { key: "delivered", label: "تم التوصيل", icon: Package },
] as const;

function TrackPage() {
  const [orderId, setOrderId] = useState("");
  const [phone, setPhone] = useState("");
  const [loading, setLoading] = useState(false);
  const [order, setOrder] = useState<TrackOrder | null>(null);
  const [items, setItems] = useState<TrackItem[]>([]);
  const [searched, setSearched] = useState(false);

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    const id = orderId.trim().toUpperCase();
    const ph = phone.trim();
    if (!id || !ph) {
      toast.error("أدخل رقم الطلب ورقم الهاتف");
      return;
    }
    if (id.length < 8) {
      toast.error("رقم الطلب قصير جداً — أدخل على الأقل أول 8 أحرف");
      return;
    }
    setLoading(true);
    setSearched(true);

    // Try RPC first if full UUID provided
    if (id.length >= 32) {
      const { data, error } = await (supabase as any).rpc("track_order", {
        _order_id: id.toLowerCase(),
        _phone: ph,
      });
      if (!error && data && data.length > 0) {
        setOrder(data[0] as TrackOrder);
        const { data: itemsData } = await (supabase as any).rpc("track_order_items", {
          _order_id: id.toLowerCase(),
          _phone: ph,
        });
        setItems((itemsData as TrackItem[]) ?? []);
        setLoading(false);
        return;
      }
    }

    // Fallback: search by first 8 chars of id + phone
    const prefix = id.slice(0, 8).toLowerCase();
    const { data: orders } = await supabase
      .from("orders")
      .select(
        "id, created_at, status, total, shipping, subtotal, customer_name, city, address, customer_phone",
      )
      .ilike("id", `${prefix}%`)
      .eq("customer_phone", ph)
      .limit(1);

    if (!orders || orders.length === 0) {
      setOrder(null);
      setItems([]);
      setLoading(false);
      return;
    }

    const foundOrder = orders[0];
    setOrder(foundOrder as TrackOrder);

    const { data: itemsData } = await supabase
      .from("order_items")
      .select("product_name, size, quantity, unit_price, line_total, product_image")
      .eq("order_id", foundOrder.id);

    setItems((itemsData as TrackItem[]) ?? []);
    setLoading(false);
  };

  const currentStepIndex = order ? STATUS_STEPS.findIndex((s) => s.key === order.status) : -1;
  const isCancelled = order?.status === "cancelled";

  return (
    <div className="mx-auto max-w-3xl px-6 py-16 md:py-24">
      <div className="text-center mb-10">
        <h1 className="text-3xl md:text-4xl font-bold mb-3">تتبع طلبك</h1>
        <p className="text-muted-foreground text-sm">
          أدخل رقم الطلب ورقم الهاتف لمعرفة حالة الشحن.
        </p>
      </div>

      <form
        onSubmit={handleSearch}
        className="rounded-2xl border border-border bg-secondary/20 p-6 space-y-4"
      >
        <div>
          <label className="block text-sm font-medium mb-2">رقم الطلب</label>
          <input
            type="text"
            value={orderId}
            onChange={(e) => setOrderId(e.target.value)}
            placeholder="أدخل رقم الطلب (مثال: A3F9B2C1)"
            className="w-full rounded-md border border-border bg-background px-4 py-2.5 text-sm focus:outline-none focus:border-foreground font-mono"
          />
        </div>
        <div>
          <label className="block text-sm font-medium mb-2">رقم الهاتف</label>
          <input
            type="tel"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            placeholder="01xxxxxxxxx"
            className="w-full rounded-md border border-border bg-background px-4 py-2.5 text-sm focus:outline-none focus:border-foreground"
          />
        </div>
        <button
          type="submit"
          disabled={loading}
          className="w-full inline-flex items-center justify-center gap-2 rounded-full bg-foreground text-background px-6 py-3 text-sm font-medium hover:opacity-90 transition disabled:opacity-50"
        >
          <Search className="h-4 w-4" />
          {loading ? "جاري البحث..." : "تتبع الطلب"}
        </button>
      </form>

      {searched && !loading && !order && (
        <div className="mt-8 rounded-xl border border-dashed border-border p-8 text-center">
          <p className="text-sm text-muted-foreground">
            لم نعثر على طلب بهذه البيانات. تأكد من رقم الطلب ورقم الهاتف.
          </p>
        </div>
      )}

      {order && (
        <div className="mt-8 space-y-6">
          <div className="rounded-xl border border-border p-6">
            <div className="flex flex-wrap items-center justify-between gap-3 mb-6">
              <div>
                <p className="text-xs text-muted-foreground">رقم الطلب</p>
                <p className="font-mono font-semibold">#{order.id.slice(0, 8).toUpperCase()}</p>
              </div>
              <div className="text-left">
                <p className="text-xs text-muted-foreground">تاريخ الطلب</p>
                <p className="text-sm">
                  {new Date(order.created_at).toLocaleDateString("ar-EG", {
                    year: "numeric",
                    month: "long",
                    day: "numeric",
                  })}
                </p>
              </div>
            </div>

            {isCancelled ? (
              <div className="flex items-center gap-3 rounded-lg bg-destructive/10 text-destructive p-4">
                <XCircle className="h-5 w-5" />
                <p className="text-sm font-medium">تم إلغاء هذا الطلب</p>
              </div>
            ) : (
              <div className="relative">
                <div className="flex justify-between relative">
                  {STATUS_STEPS.map((step, idx) => {
                    const Icon = step.icon;
                    const reached = idx <= currentStepIndex;
                    const active = idx === currentStepIndex;
                    return (
                      <div
                        key={step.key}
                        className="flex flex-col items-center gap-2 flex-1 relative z-10"
                      >
                        <div
                          className={`h-10 w-10 rounded-full flex items-center justify-center border-2 transition ${
                            reached
                              ? "bg-foreground border-foreground text-background"
                              : "bg-background border-border text-muted-foreground"
                          } ${active ? "ring-4 ring-foreground/10" : ""}`}
                        >
                          <Icon className="h-4 w-4" />
                        </div>
                        <p
                          className={`text-xs text-center ${
                            reached ? "text-foreground font-medium" : "text-muted-foreground"
                          }`}
                        >
                          {step.label}
                        </p>
                      </div>
                    );
                  })}
                </div>
                <div className="absolute top-5 right-[12.5%] left-[12.5%] h-0.5 bg-border -z-0">
                  <div
                    className="h-full bg-foreground transition-all"
                    style={{
                      width: `${currentStepIndex <= 0 ? 0 : (currentStepIndex / (STATUS_STEPS.length - 1)) * 100}%`,
                    }}
                  />
                </div>
              </div>
            )}
          </div>

          <div className="rounded-xl border border-border p-6">
            <p className="text-sm font-semibold mb-4">عنوان التوصيل</p>
            <p className="text-sm">{order.customer_name}</p>
            <p className="text-sm text-muted-foreground">
              {order.city} — {order.address}
            </p>
          </div>

          {items.length > 0 && (
            <div className="rounded-xl border border-border p-6">
              <p className="text-sm font-semibold mb-4">المنتجات</p>
              <ul className="space-y-3">
                {items.map((it, idx) => (
                  <li key={idx} className="flex gap-3 items-center">
                    {it.product_image && (
                      <div className="h-14 w-14 rounded-md overflow-hidden bg-secondary flex-shrink-0">
                        <img
                          src={resolveImage(it.product_image)}
                          alt=""
                          className="h-full w-full object-cover"
                        />
                      </div>
                    )}
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-semibold truncate">{it.product_name}</p>
                      <p className="text-xs text-muted-foreground">
                        {it.size} · ×{it.quantity}
                      </p>
                    </div>
                    <p className="text-sm font-semibold whitespace-nowrap">
                      {Number(it.line_total)} ج.م
                    </p>
                  </li>
                ))}
              </ul>
              <div className="mt-4 pt-4 border-t border-border space-y-1 text-sm">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">الفرعي</span>
                  <span>{Number(order.subtotal)} ج.م</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">الشحن</span>
                  <span>{Number(order.shipping)} ج.م</span>
                </div>
                <div className="flex justify-between font-semibold pt-2 border-t border-border">
                  <span>الإجمالي</span>
                  <span>{Number(order.total)} ج.م</span>
                </div>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
