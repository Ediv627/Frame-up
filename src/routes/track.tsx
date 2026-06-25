import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { resolveImage } from "@/lib/product-images";
import { Package, Search, CheckCircle2, Clock, Truck, XCircle, MessageCircle, AlertTriangle } from "lucide-react";
import { toast } from "sonner";

export const Route = createFileRoute("/track")({
  head: () => ({
    meta: [
      { title: "تتبع طلبك — FRAME UP" },
      { name: "description", content: "تتبع حالة طلبك من إطارات FRAME UP عبر رقم الطلب ورقم الهاتف." },
      { property: "og:title", content: "تتبع طلبك — FRAME UP" },
      { property: "og:description", content: "اعرف حالة طلبك في أي وقت." },
    ],
  }),
  component: TrackPage,
});

type TrackOrder = {
  id: string;
  order_code: string;
  created_at: string;
  status: "pending" | "confirmed" | "shipped" | "delivered" | "cancelled";
  total: number;
  shipping: number;
  subtotal: number;
  customer_name: string;
  city: string;
  address: string;
  whatsapp_confirmed: boolean;
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
  const [whatsappPhone, setWhatsappPhone] = useState<string>("");

  useEffect(() => {
    (supabase as any)
      .from("site_settings")
      .select("value")
      .eq("key", "whatsapp_phone")
      .maybeSingle()
      .then(({ data }: { data: { value: string } | null }) => {
        if (data?.value) setWhatsappPhone(data.value.replace(/\D/g, ""));
      });
  }, []);

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    const id = orderId.trim();
    const ph = phone.trim();
    if (!id || !ph) {
      toast.error("أدخل رقم الطلب ورقم الهاتف");
      return;
    }
    if (id.length < 6) {
      toast.error("رقم الطلب غير صحيح");
      return;
    }
    setLoading(true);
    setSearched(true);
    const { data, error } = await (supabase as any).rpc("track_order", {
      _order_id: id,
      _phone: ph,
    });
    if (error || !data || data.length === 0) {
      setOrder(null);
      setItems([]);
      setLoading(false);
      return;
    }
    setOrder(data[0] as TrackOrder);
    const { data: itemsData } = await (supabase as any).rpc("track_order_items", {
      _order_id: id,
      _phone: ph,
    });
    setItems((itemsData as TrackItem[]) ?? []);
    setLoading(false);
  };

  const currentStepIndex = order
    ? STATUS_STEPS.findIndex((s) => s.key === order.status)
    : -1;
  const isCancelled = order?.status === "cancelled";
  const awaitingWhatsapp = order ? !order.whatsapp_confirmed && order.status === "pending" : false;
  const shortOrderId = order ? order.order_code : "";
  const waHref = whatsappPhone && order
    ? `https://wa.me/${whatsappPhone}?text=${encodeURIComponent(`أهلاً، رقم الأوردر بتاعي: ${shortOrderId}`)}`
    : "";

  return (
    <div className="mx-auto max-w-3xl px-6 py-16 md:py-24">
      <div className="text-center mb-10">
        <h1 className="text-3xl md:text-4xl font-bold mb-3">تتبع طلبك</h1>
        <p className="text-muted-foreground text-sm">أدخل رقم الطلب ورقم الهاتف لمعرفة حالة الشحن.</p>
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
            placeholder="مثال: A1B2C3D4"
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
          {awaitingWhatsapp && (
            <div className="rounded-xl border-2 border-amber-500/40 bg-amber-500/10 p-5 space-y-4">
              <div className="flex items-start gap-3">
                <AlertTriangle className="h-6 w-6 text-amber-600 dark:text-amber-400 flex-shrink-0 mt-0.5" />
                <div className="flex-1">
                  <p className="font-semibold text-amber-900 dark:text-amber-200 mb-1">
                    في انتظار تأكيد الواتساب
                  </p>
                  <p className="text-sm text-amber-800 dark:text-amber-300">
                    ⚠️ لم تقم بإرسال رقم طلبك على الواتساب بعد، يرجى إرسال رقم الأوردر لإتمام الطلب.
                  </p>
                </div>
              </div>
              {whatsappPhone && (
                <a
                  href={waHref}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center justify-center gap-2 w-full rounded-full bg-[#25D366] px-5 py-3 text-sm font-semibold text-white hover:opacity-90 transition-opacity"
                >
                  <MessageCircle className="h-5 w-5" />
                  إرسال رقم الأوردر على واتساب
                </a>
              )}
            </div>
          )}

          <div className="rounded-xl border border-border p-6">
            <div className="flex flex-wrap items-center justify-between gap-3 mb-6">
              <div>
                <p className="text-xs text-muted-foreground mb-1">رقم الطلب</p>
                <p className="font-mono text-2xl font-black tracking-[0.2em]">{shortOrderId}</p>
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
            ) : awaitingWhatsapp ? (
              <div className="flex items-center gap-3 rounded-lg bg-amber-500/10 text-amber-700 dark:text-amber-400 p-4">
                <MessageCircle className="h-5 w-5" />
                <p className="text-sm font-medium">في انتظار تأكيد الواتساب</p>
              </div>
            ) : (
              <div className="relative">
                <div className="flex justify-between relative">
                  {STATUS_STEPS.map((step, idx) => {
                    const Icon = step.icon;
                    const reached = idx <= currentStepIndex;
                    const active = idx === currentStepIndex;
                    return (
                      <div key={step.key} className="flex flex-col items-center gap-2 flex-1 relative z-10">
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
            <p className="text-sm text-muted-foreground">{order.city} — {order.address}</p>
          </div>

          {items.length > 0 && (
            <div className="rounded-xl border border-border p-6">
              <p className="text-sm font-semibold mb-4">المنتجات</p>
              <ul className="space-y-3">
                {items.map((it, idx) => (
                  <li key={idx} className="flex gap-3 items-center">
                    {it.product_image && (
                      <div className="h-14 w-14 rounded-md overflow-hidden bg-secondary flex-shrink-0">
                        <img src={resolveImage(it.product_image)} alt="" className="h-full w-full object-cover" />
                      </div>
                    )}
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-semibold truncate">{it.product_name}</p>
                      <p className="text-xs text-muted-foreground">{it.size} · ×{it.quantity}</p>
                    </div>
                    <p className="text-sm font-semibold whitespace-nowrap">{Number(it.line_total)} ج.م</p>
                  </li>
                ))}
              </ul>
              <div className="mt-4 pt-4 border-t border-border space-y-1 text-sm">
                <div className="flex justify-between"><span className="text-muted-foreground">الفرعي</span><span>{Number(order.subtotal)} ج.م</span></div>
                <div className="flex justify-between"><span className="text-muted-foreground">الشحن</span><span>{Number(order.shipping)} ج.م</span></div>
                <div className="flex justify-between font-semibold pt-2 border-t border-border"><span>الإجمالي</span><span>{Number(order.total)} ج.م</span></div>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
