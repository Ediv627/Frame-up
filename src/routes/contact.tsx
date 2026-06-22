import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Mail, Phone, MapPin, Facebook, Instagram, MessageCircle, Send } from "lucide-react";
import { toast } from "sonner";

export const Route = createFileRoute("/contact")({
  component: ContactPage,
});

type ContactInfo = {
  contact_email?: string;
  contact_phone?: string;
  contact_address?: string;
  whatsapp_phone?: string;
  whatsapp_message?: string;
  social_facebook?: string;
  social_instagram?: string;
};

function ContactPage() {
  const [info, setInfo] = useState<ContactInfo>({});
  const [loading, setLoading] = useState(true);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [msg, setMsg] = useState("");

  useEffect(() => {
    (supabase as any)
      .from("site_settings")
      .select("key, value")
      .in("key", [
        "contact_email",
        "contact_phone",
        "contact_address",
        "whatsapp_phone",
        "whatsapp_message",
        "social_facebook",
        "social_instagram",
      ])
      .then(({ data }: { data: { key: string; value: string }[] | null }) => {
        const map = Object.fromEntries((data ?? []).map((r) => [r.key, r.value]));
        setInfo(map);
        setLoading(false);
      });
  }, []);

  const wa = info.whatsapp_phone?.replace(/\D/g, "");
  const waHref = wa
    ? `https://wa.me/${wa}${info.whatsapp_message ? `?text=${encodeURIComponent(info.whatsapp_message)}` : ""}`
    : null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!waHref && !info.contact_email) {
      toast.error("لا توجد وسيلة تواصل مفعّلة حالياً");
      return;
    }
    const body = `الاسم: ${name}\nالبريد: ${email}\n\n${msg}`;
    if (waHref) {
      window.open(`https://wa.me/${wa}?text=${encodeURIComponent(body)}`, "_blank");
    } else {
      window.location.href = `mailto:${info.contact_email}?subject=${encodeURIComponent("استفسار من " + name)}&body=${encodeURIComponent(body)}`;
    }
  };

  return (
    <div className="mx-auto max-w-[1400px] px-6 md:px-10 py-12 md:py-20">
      <div className="mb-12 md:mb-16">
        <p className="text-sm text-muted-foreground mb-2">تواصل معنا</p>
        <h1 className="display-ar text-[clamp(2.25rem,6vw,4.5rem)] font-black leading-[1.05]">
          نحن هنا للإجابة
          <br />
          عن كل ما تريد.
        </h1>
        <p className="mt-6 max-w-xl text-base md:text-lg text-muted-foreground leading-relaxed">
          سواء كان استفسار عن منتج، طلب تصميم خاص، أو أي ملاحظة — تواصل معنا بالطريقة التي تناسبك.
        </p>
      </div>

      <div className="grid gap-12 lg:grid-cols-12">
        {/* Contact methods */}
        <div className="lg:col-span-5 space-y-4">
          {loading ? (
            <p className="text-sm text-muted-foreground">جاري التحميل...</p>
          ) : (
            <>
              {waHref && (
                <ContactCard
                  icon={<MessageCircle className="h-5 w-5" />}
                  title="واتساب"
                  value={info.whatsapp_phone!}
                  href={waHref}
                  external
                  accent="bg-[#25D366]/10 text-[#25D366]"
                />
              )}
              {info.contact_phone && (
                <ContactCard
                  icon={<Phone className="h-5 w-5" />}
                  title="الهاتف"
                  value={info.contact_phone}
                  href={`tel:${info.contact_phone.replace(/\s/g, "")}`}
                />
              )}
              {info.contact_email && (
                <ContactCard
                  icon={<Mail className="h-5 w-5" />}
                  title="البريد الإلكتروني"
                  value={info.contact_email}
                  href={`mailto:${info.contact_email}`}
                />
              )}
              {info.contact_address && (
                <ContactCard
                  icon={<MapPin className="h-5 w-5" />}
                  title="العنوان"
                  value={info.contact_address}
                />
              )}
              {(info.social_facebook || info.social_instagram) && (
                <div className="rounded-xl border border-border p-5">
                  <p className="text-xs text-muted-foreground mb-3">تابعنا على</p>
                  <div className="flex gap-3">
                    {info.social_facebook && (
                      <a
                        href={info.social_facebook}
                        target="_blank"
                        rel="noopener noreferrer"
                        aria-label="فيسبوك"
                        className="flex h-11 w-11 items-center justify-center rounded-full border border-border hover:bg-secondary transition-colors"
                      >
                        <Facebook className="h-5 w-5" />
                      </a>
                    )}
                    {info.social_instagram && (
                      <a
                        href={info.social_instagram}
                        target="_blank"
                        rel="noopener noreferrer"
                        aria-label="إنستغرام"
                        className="flex h-11 w-11 items-center justify-center rounded-full border border-border hover:bg-secondary transition-colors"
                      >
                        <Instagram className="h-5 w-5" />
                      </a>
                    )}
                  </div>
                </div>
              )}
              {!waHref && !info.contact_phone && !info.contact_email && !info.contact_address && (
                <div className="rounded-xl border border-dashed border-border p-8 text-center">
                  <p className="text-sm text-muted-foreground">
                    لم يتم إضافة بيانات التواصل بعد. يمكن للأدمن إضافتها من لوحة التحكم.
                  </p>
                </div>
              )}
            </>
          )}
        </div>

        {/* Form */}
        <div className="lg:col-span-7">
          <form
            onSubmit={handleSubmit}
            className="rounded-2xl border border-border bg-card p-6 md:p-8 space-y-5"
          >
            <div>
              <p className="text-base font-semibold mb-1">أرسل لنا رسالة</p>
              <p className="text-xs text-muted-foreground">
                سنفتح لك تلقائياً واتساب أو البريد لإرسال رسالتك.
              </p>
            </div>
            <Field label="الاسم" value={name} onChange={setName} required />
            <Field
              label="البريد الإلكتروني"
              type="email"
              value={email}
              onChange={setEmail}
              required
            />
            <label className="block">
              <span className="text-xs text-muted-foreground block mb-2">رسالتك</span>
              <textarea
                value={msg}
                onChange={(e) => setMsg(e.target.value)}
                rows={5}
                required
                className="w-full rounded-md border border-border bg-background px-4 py-2.5 text-sm focus:outline-none focus:border-foreground transition-colors"
              />
            </label>
            <button
              type="submit"
              className="inline-flex items-center gap-2 rounded-full bg-foreground px-6 py-3 text-sm font-semibold text-background hover:opacity-90 transition-opacity"
            >
              <Send className="h-4 w-4" />
              إرسال الرسالة
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}

function ContactCard({
  icon,
  title,
  value,
  href,
  external,
  accent,
}: {
  icon: React.ReactNode;
  title: string;
  value: string;
  href?: string;
  external?: boolean;
  accent?: string;
}) {
  const inner = (
    <div className="flex items-center gap-4 rounded-xl border border-border p-5 hover:border-foreground/40 hover:bg-secondary/40 transition-colors">
      <div
        className={`flex h-11 w-11 items-center justify-center rounded-full ${accent ?? "bg-secondary text-foreground"}`}
      >
        {icon}
      </div>
      <div className="min-w-0">
        <p className="text-xs text-muted-foreground">{title}</p>
        <p className="text-sm font-semibold truncate" dir="ltr">
          {value}
        </p>
      </div>
    </div>
  );
  if (!href) return inner;
  return (
    <a
      href={href}
      target={external ? "_blank" : undefined}
      rel={external ? "noopener noreferrer" : undefined}
    >
      {inner}
    </a>
  );
}

function Field({
  label,
  value,
  onChange,
  type = "text",
  required,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  type?: string;
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
