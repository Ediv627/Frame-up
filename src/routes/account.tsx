import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { useAuth } from "@/store/auth";
import { supabase } from "@/integrations/supabase/client";
import { LogOut, Package, User as UserIcon } from "lucide-react";
import { toast } from "sonner";

export const Route = createFileRoute("/account")({
  head: () => ({ meta: [{ title: "حسابي — FRAME UP" }] }),
  component: AccountPage,
});

type OrderRow = {
  id: string;
  created_at: string;
  status: string;
  total: number;
  customer_name: string;
};

function AccountPage() {
  const { user, profile, loading, signOut, refreshProfile } = useAuth();
  const navigate = useNavigate();
  const [orders, setOrders] = useState<OrderRow[]>([]);
  const [ordersLoading, setOrdersLoading] = useState(true);

  // Profile form state
  const [fullName, setFullName] = useState("");
  const [phone, setPhone] = useState("");
  const [address, setAddress] = useState("");
  const [city, setCity] = useState("");
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!loading && !user) navigate({ to: "/auth" });
  }, [user, loading, navigate]);

  useEffect(() => {
    if (profile) {
      setFullName(profile.full_name ?? "");
      setPhone(profile.phone ?? "");
      setAddress(profile.address ?? "");
      setCity(profile.city ?? "");
    }
  }, [profile]);

  useEffect(() => {
    if (!user) return;
    supabase
      .from("orders")
      .select("id, created_at, status, total, customer_name")
      .order("created_at", { ascending: false })
      .then(({ data }) => {
        setOrders((data as OrderRow[]) ?? []);
        setOrdersLoading(false);
      });
  }, [user]);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;
    setSaving(true);
    const { error } = await supabase
      .from("profiles")
      .update({ full_name: fullName, phone, address, city })
      .eq("id", user.id);
    setSaving(false);
    if (error) {
      toast.error("فشل الحفظ");
    } else {
      toast.success("تم حفظ بياناتك");
      refreshProfile();
    }
  };

  const handleSignOut = async () => {
    await signOut();
    toast.success("تم تسجيل الخروج");
    navigate({ to: "/" });
  };

  if (loading || !user) {
    return (
      <div className="mx-auto max-w-2xl px-6 py-24 text-center">
        <p className="text-sm text-muted-foreground">جاري التحميل...</p>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-[1100px] px-6 md:px-10 py-12 md:py-16">
      <div className="mb-10 flex items-center justify-between">
        <div>
          <p className="text-sm text-muted-foreground mb-2">مرحباً بعودتك</p>
          <h1 className="display-ar text-[clamp(2rem,5vw,3rem)] font-black">حسابي</h1>
        </div>
        <button
          onClick={handleSignOut}
          className="inline-flex items-center gap-2 rounded-full border border-border px-4 py-2 text-sm hover:bg-secondary transition-colors"
        >
          <LogOut className="h-4 w-4" /> خروج
        </button>
      </div>

      <div className="grid gap-10 lg:grid-cols-12">
        {/* Profile */}
        <section className="lg:col-span-5">
          <div className="rounded-xl border border-border p-6">
            <div className="flex items-center gap-2 mb-6">
              <UserIcon className="h-4 w-4" />
              <p className="text-base font-semibold">بياناتي</p>
            </div>
            <form onSubmit={handleSave} className="space-y-4">
              <Field label="الاسم الكامل" value={fullName} onChange={setFullName} />
              <Field label="رقم الموبايل" type="tel" value={phone} onChange={setPhone} />
              <Field label="العنوان" value={address} onChange={setAddress} />
              <Field label="المدينة" value={city} onChange={setCity} />
              <p className="text-xs text-muted-foreground">البريد: {user.email}</p>
              <button
                type="submit"
                disabled={saving}
                className="w-full rounded-full bg-foreground px-5 py-2.5 text-sm font-semibold text-background hover:opacity-90 transition-opacity disabled:opacity-60"
              >
                {saving ? "جاري الحفظ..." : "حفظ التعديلات"}
              </button>
            </form>
          </div>
        </section>

        {/* Orders */}
        <section className="lg:col-span-7">
          <div className="rounded-xl border border-border p-6">
            <div className="flex items-center gap-2 mb-6">
              <Package className="h-4 w-4" />
              <p className="text-base font-semibold">طلباتي</p>
            </div>
            {ordersLoading ? (
              <p className="text-sm text-muted-foreground">جاري التحميل...</p>
            ) : orders.length === 0 ? (
              <div className="py-10 text-center">
                <p className="text-sm text-muted-foreground mb-4">لم تقم بأي طلبات بعد</p>
                <Link
                  to="/shop"
                  className="inline-block rounded-full bg-foreground px-5 py-2.5 text-sm font-semibold text-background"
                >
                  ابدأ التسوق
                </Link>
              </div>
            ) : (
              <ul className="divide-y divide-border">
                {orders.map((o) => (
                  <li key={o.id} className="py-4 flex items-center justify-between gap-4">
                    <div>
                      <p className="text-sm font-semibold font-mono tracking-widest">{(o as any).order_code ?? `#${o.id.slice(0, 8).toUpperCase()}`}</p>
                      <p className="text-xs text-muted-foreground mt-0.5">
                        {new Date(o.created_at).toLocaleDateString("ar-EG", {
                          year: "numeric",
                          month: "long",
                          day: "numeric",
                        })}
                      </p>
                    </div>
                    <StatusBadge status={o.status} />
                    <p className="text-sm font-semibold whitespace-nowrap">{Number(o.total)} ج.م</p>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </section>
      </div>
    </div>
  );
}

const statusLabels: Record<string, { label: string; cls: string }> = {
  pending: { label: "قيد المراجعة", cls: "bg-secondary text-foreground" },
  confirmed: { label: "مؤكد", cls: "bg-blue-100 text-blue-900" },
  shipped: { label: "في الطريق", cls: "bg-amber-100 text-amber-900" },
  delivered: { label: "تم التوصيل", cls: "bg-green-100 text-green-900" },
  cancelled: { label: "ملغي", cls: "bg-red-100 text-red-900" },
};

function StatusBadge({ status }: { status: string }) {
  const s = statusLabels[status] ?? statusLabels.pending;
  return (
    <span className={`text-[11px] rounded-full px-2.5 py-1 font-semibold ${s.cls}`}>
      {s.label}
    </span>
  );
}

function Field({
  label,
  type = "text",
  value,
  onChange,
}: {
  label: string;
  type?: string;
  value: string;
  onChange: (v: string) => void;
}) {
  return (
    <label className="block">
      <span className="text-xs text-muted-foreground block mb-2">{label}</span>
      <input
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="w-full rounded-md border border-border bg-background px-4 py-2.5 text-sm focus:outline-none focus:border-foreground transition-colors"
      />
    </label>
  );
}
