import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { useCart } from "@/store/cart";
import { useAuth } from "@/store/auth";
import { supabase } from "@/integrations/supabase/client";
import { EGYPT_GOVERNORATE_SHIPPING, fetchShippingRates } from "@/lib/shipping";
import { Check } from "lucide-react";
import { toast } from "sonner";

export const Route = createFileRoute("/checkout")({
  head: () => ({ meta: [{ title: "تأكيد الطلب — FRAME UP" }] }),
  component: CheckoutPage,
});

function CheckoutPage() {
  const { detailed, subtotal, clear } = useCart();
  const { user, profile } = useAuth();
  const navigate = useNavigate();

  const [placing, setPlacing] = useState(false);
  const [done, setDone] = useState(false);
  const [orderId, setOrderId] = useState<string | null>(null);
  const [orderCode, setOrderCode] = useState<string | null>(null);

  // Form state
  const [fullName, setFullName] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [address, setAddress] = useState("");
  const [city, setCity] = useState("القاهرة");
  const [notes, setNotes] = useState("");
  const [shippingRates, setShippingRates] = useState(EGYPT_GOVERNORATE_SHIPPING);

  const [whatsappPhone, setWhatsappPhone] = useState<string>("");

  // Prefill from profile
  useEffect(() => {
    fetchShippingRates().then((rates) => {
      const activeRates = rates.filter((rate) => rate.active !== false);
      setShippingRates(activeRates.length > 0 ? activeRates : EGYPT_GOVERNORATE_SHIPPING);
    });
    (supabase as any)
      .from("site_settings")
      .select("value")
      .eq("key", "whatsapp_phone")
      .maybeSingle()
      .then(({ data }: { data: { value: string } | null }) => {
        if (data?.value) setWhatsappPhone(data.value.replace(/\D/g, ""));
      });
  }, []);

  useEffect(() => {
    if (profile) {
      setFullName(profile.full_name ?? "");
      setPhone(profile.phone ?? "");
      setAddress(profile.address ?? "");
      setCity(profile.city ?? "القاهرة");
    }
    if (user?.email) setEmail(user.email);
  }, [profile, user]);

  const governorateShipping = shippingRates.find((item) => item.name === city)?.fee ?? 0;
  const shipping = subtotal > 1200 ? 0 : governorateShipping;
  const total = subtotal + shipping;

  if (detailed.length === 0 && !done) {
    return (
      <div className="mx-auto max-w-2xl px-6 py-24 text-center">
        <p className="text-2xl font-semibold">لا يوجد ما يمكن دفعه.</p>
        <Link to="/shop" className="mt-6 inline-block rounded-full bg-foreground px-5 py-3 text-sm font-semibold text-background">
          ابحث عن شيء
        </Link>
      </div>
    );
  }

  const shortOrderId = orderCode ?? (orderId ? orderId.slice(0, 8).toUpperCase() : "");
  const waMessage = shortOrderId
    ? `أهلاً، رقم الأوردر بتاعي: ${shortOrderId}`
    : "";
  const waHref = whatsappPhone
    ? `https://wa.me/${whatsappPhone}${waMessage ? `?text=${encodeURIComponent(waMessage)}` : ""}`
    : "";

  if (done) {
    return (
      <div className="mx-auto max-w-2xl px-6 py-24 md:py-32 text-center">
        <div className="mx-auto h-16 w-16 rounded-full border border-border flex items-center justify-center">
          <Check className="h-8 w-8" />
        </div>
        <h1 className="display-ar text-[clamp(2rem,5vw,3.5rem)] font-black mt-8">تم استلام طلبك</h1>
        <p className="mt-4 text-muted-foreground">
          شكراً لك! لإتمام الطلب أرسل رقم الأوردر على الواتساب.
        </p>
        {shortOrderId && (
          <div className="mt-6 mx-auto max-w-xs rounded-xl border-2 border-foreground/20 bg-secondary/30 p-4">
            <p className="text-xs text-muted-foreground mb-1">رقم الطلب</p>
            <p className="font-mono text-3xl font-black tracking-[0.25em]">{shortOrderId}</p>
          </div>
        )}

        {whatsappPhone && (
          <div className="mt-8 mx-auto max-w-md rounded-xl border-2 border-[#25D366]/30 bg-[#25D366]/5 p-5 text-right">
            <p className="text-sm font-semibold mb-3 text-center">
              ⚠️ لتأكيد طلبك، أرسل رقم الأوردر على واتساب على الرقم:
            </p>
            <p className="text-center font-mono text-lg font-bold mb-4" dir="ltr">+{whatsappPhone}</p>
            <a
              href={waHref}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center justify-center gap-2 w-full rounded-full bg-[#25D366] px-5 py-3 text-sm font-semibold text-white hover:opacity-90 transition-opacity"
            >
              <svg viewBox="0 0 24 24" fill="currentColor" className="h-5 w-5">
                <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z" />
              </svg>
              إرسال رقم الأوردر على واتساب
            </a>
            <p className="mt-3 text-xs text-muted-foreground text-center">
              لن يتم تأكيد الطلب نهائياً إلا بعد إرسال رقم الأوردر على الواتساب.
            </p>
          </div>
        )}

        <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
          {user && (
            <Link
              to="/account"
              className="rounded-full border border-border px-5 py-3 text-sm font-semibold hover:bg-secondary transition-colors"
            >
              عرض طلباتي
            </Link>
          )}
          <Link
            to="/track"
            className="rounded-full border border-border px-5 py-3 text-sm font-semibold hover:bg-secondary transition-colors"
          >
            تتبع الطلب
          </Link>
          <Link
            to="/"
            className="rounded-full bg-foreground px-5 py-3 text-sm font-semibold text-background hover:opacity-90 transition-opacity"
          >
            العودة للرئيسية
          </Link>
        </div>
      </div>
    );
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (placing) return;
    setPlacing(true);

    try {
      // 1. Create order
      const { data: order, error: orderError } = await supabase
        .from("orders")
        .insert({
          user_id: user?.id ?? null,
          customer_name: fullName,
          customer_phone: phone,
          customer_email: email || null,
          address,
          city,
          notes: notes || null,
          subtotal,
          shipping,
          total,
        })
        .select("id, order_code")
        .single();

      if (orderError) throw orderError;

      // 2. Insert order items (stock decrement happens via DB trigger)
      const items = detailed.map((l) => ({
        order_id: order.id,
        product_id: l.productId,
        product_name: l.product.name,
        product_image: l.product.image,
        size: l.size,
        quantity: l.quantity,
        unit_price: l.product.price,
        line_total: l.lineTotal,
      }));

      const { error: itemsError } = await supabase.from("order_items").insert(items);
      if (itemsError) {
        // Roll back the empty order so we don't leave orphans
        await supabase.from("orders").delete().eq("id", order.id);
        throw itemsError;
      }

      // 3. Save profile data for logged-in users
      if (user) {
        await supabase
          .from("profiles")
          .update({ full_name: fullName, phone, address, city })
          .eq("id", user.id);
      }

      setOrderId(order.id);
      setOrderCode((order as any).order_code ?? null);
      clear();
      setDone(true);
      window.scrollTo({ top: 0 });
    } catch (err) {
      const raw = err instanceof Error ? err.message : "حدث خطأ";
      // Friendly mapping for stock errors raised by the DB trigger
      const msg = raw.includes("غير متوفرة") || raw.includes("المتاح")
        ? raw
        : `فشل تأكيد الطلب: ${raw}`;
      toast.error(msg);
    } finally {
      setPlacing(false);
    }
  };

  return (
    <div className="mx-auto max-w-[1400px] px-6 md:px-10 py-12 md:py-16">
      <div className="mb-10">
        <p className="text-sm text-muted-foreground mb-2">تأكيد الطلب</p>
        <h1 className="display-ar text-[clamp(2rem,5vw,3.5rem)] font-black">بيانات التوصيل</h1>
        {!user && (
          <p className="mt-3 text-sm text-muted-foreground">
            لديك حساب؟{" "}
            <button
              onClick={() => navigate({ to: "/auth" })}
              className="text-foreground font-semibold hover:underline"
            >
              سجّل الدخول
            </button>{" "}
            لتعبئة بياناتك تلقائياً
          </p>
        )}
      </div>

      <form onSubmit={handleSubmit} className="grid gap-12 lg:grid-cols-12">
        <div className="lg:col-span-8 space-y-12">
          <Section title="معلومات التواصل">
            <Field label="الاسم الكامل" value={fullName} onChange={setFullName} required />
            <Field label="رقم الموبايل" type="tel" value={phone} onChange={setPhone} required />
            <Field label="البريد الإلكتروني (اختياري)" type="email" value={email} onChange={setEmail} />
          </Section>

          <Section title="عنوان الشحن">
            <Field label="العنوان بالتفصيل" value={address} onChange={setAddress} required />
            <label className="block">
              <span className="text-xs text-muted-foreground block mb-2">المحافظة</span>
              <select
                value={city}
                onChange={(e) => setCity(e.target.value)}
                required
                className="w-full rounded-md border border-border bg-background px-4 py-2.5 text-sm focus:outline-none focus:border-foreground transition-colors"
              >
                {shippingRates.map((governorate) => (
                  <option key={governorate.name} value={governorate.name}>
                    {governorate.name} — {governorate.fee} ج.م
                  </option>
                ))}
              </select>
            </label>
            <label className="block">
              <span className="text-xs text-muted-foreground block mb-2">ملاحظات للطلب (اختياري)</span>
              <textarea
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                rows={3}
                className="w-full rounded-md border border-border bg-background px-4 py-2.5 text-sm focus:outline-none focus:border-foreground transition-colors"
              />
            </label>
          </Section>

          <Section title="طريقة الدفع">
            <div className="rounded-lg border border-border bg-secondary/50 p-4">
              <p className="text-sm font-semibold mb-1">الدفع عند الاستلام</p>
              <p className="text-sm text-muted-foreground">
                ادفع نقداً عند استلام الطلب. سنتواصل معك لتأكيد العنوان والموعد قبل التوصيل.
              </p>
            </div>
          </Section>
        </div>

        <aside className="lg:col-span-4">
          <div className="rounded-xl border border-border bg-card p-6 lg:sticky lg:top-28">
            <p className="text-base font-semibold mb-6">الطلب</p>
            <ul className="space-y-3 mb-6 max-h-72 overflow-auto">
              {detailed.map((l) => (
                <li key={`${l.productId}-${l.size}`} className="flex gap-3 items-center">
                  <div className="h-14 w-14 rounded-md overflow-hidden bg-secondary flex-shrink-0">
                    <img src={l.product.image} alt="" className="h-full w-full object-cover" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold truncate">{l.product.name}</p>
                    <p className="text-xs text-muted-foreground">{l.size} · ×{l.quantity}</p>
                  </div>
                  <p className="text-sm font-semibold">{l.lineTotal} ج.م</p>
                </li>
              ))}
            </ul>
            <div className="border-t border-border pt-4 space-y-2">
              <Row label="الإجمالي الفرعي" value={`${subtotal} ج.م`} />
              <Row label={`الشحن إلى ${city}`} value={shipping === 0 ? "مجاني" : `${shipping} ج.م`} />
              <div className="flex items-baseline justify-between pt-3 border-t border-border">
                <p className="text-base font-semibold">الإجمالي</p>
                <p className="text-2xl font-bold">{total} ج.م</p>
              </div>
            </div>
            {whatsappPhone && (
              <div className="mt-6 rounded-lg border border-[#25D366]/30 bg-[#25D366]/5 p-3 text-xs leading-relaxed">
                <p className="font-semibold mb-1">📱 بعد تأكيد الطلب:</p>
                <p className="text-muted-foreground">
                  أرسل رقم الأوردر على واتساب على الرقم{" "}
                  <span className="font-mono font-semibold text-foreground" dir="ltr">+{whatsappPhone}</span>{" "}
                  لإتمام الطلب.
                </p>
              </div>
            )}
            <button
              type="submit"
              disabled={placing}
              className="mt-6 w-full rounded-full bg-foreground px-6 py-3 text-sm font-semibold text-background hover:opacity-90 transition-opacity disabled:opacity-60"
            >
              {placing ? "جاري التأكيد..." : "تأكيد الطلب"}
            </button>
            <p className="mt-3 text-center text-xs text-muted-foreground">
              الدفع عند الاستلام · إرجاع مجاني خلال 30 يوم
            </p>
          </div>
        </aside>
      </form>
    </div>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div>
      <p className="text-sm font-semibold mb-4">{title}</p>
      <div className="space-y-4">{children}</div>
    </div>
  );
}

function Field({
  label,
  type = "text",
  value,
  onChange,
  required,
}: {
  label: string;
  type?: string;
  value: string;
  onChange: (v: string) => void;
  required?: boolean;
}) {
  return (
    <label className="block">
      <span className="text-xs text-muted-foreground block mb-2">{label}</span>
      <input
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        required={required}
        className="w-full rounded-md border border-border bg-background px-4 py-2.5 text-sm focus:outline-none focus:border-foreground transition-colors"
      />
    </label>
  );
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-baseline justify-between">
      <p className="text-sm text-muted-foreground">{label}</p>
      <p className="text-sm font-semibold">{value}</p>
    </div>
  );
}
