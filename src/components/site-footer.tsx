import { Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Facebook, Instagram, Mail, Phone, MapPin } from "lucide-react";
import logo from "@/assets/frame-up-logo.png";

type Info = {
  contact_email?: string;
  contact_phone?: string;
  contact_address?: string;
  social_facebook?: string;
  social_instagram?: string;
};

export function SiteFooter() {
  const [info, setInfo] = useState<Info>({});

  useEffect(() => {
    (supabase as any)
      .from("site_settings")
      .select("key, value")
      .in("key", [
        "contact_email",
        "contact_phone",
        "contact_address",
        "social_facebook",
        "social_instagram",
      ])
      .then(({ data }: { data: { key: string; value: string }[] | null }) => {
        setInfo(Object.fromEntries((data ?? []).map((r) => [r.key, r.value])));
      });
  }, []);

  return (
    <footer className="mt-32 border-t border-border bg-background">
      <div className="mx-auto max-w-[1400px] px-6 py-16 md:px-10">
        <div className="grid gap-12 md:grid-cols-12">
          <div className="md:col-span-5">
            <img src={logo} alt="FRAME UP" className="h-14 w-auto" />
            <p className="mt-6 max-w-sm text-sm text-muted-foreground leading-relaxed">
              متجر متخصص في إطارات الصور الفاخرة. مصممة في الاستوديو، مبنية لتدوم لأجيال.
            </p>
            {(info.social_facebook || info.social_instagram) && (
              <div className="mt-6 flex gap-2">
                {info.social_facebook && (
                  <a
                    href={info.social_facebook}
                    target="_blank"
                    rel="noopener noreferrer"
                    aria-label="فيسبوك"
                    className="flex h-10 w-10 items-center justify-center rounded-full border border-border hover:bg-secondary transition-colors"
                  >
                    <Facebook className="h-4 w-4" />
                  </a>
                )}
                {info.social_instagram && (
                  <a
                    href={info.social_instagram}
                    target="_blank"
                    rel="noopener noreferrer"
                    aria-label="إنستغرام"
                    className="flex h-10 w-10 items-center justify-center rounded-full border border-border hover:bg-secondary transition-colors"
                  >
                    <Instagram className="h-4 w-4" />
                  </a>
                )}
              </div>
            )}
          </div>

          <div className="md:col-span-3">
            <p className="text-sm font-semibold mb-4">روابط</p>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li><Link to="/" className="hover:text-foreground transition-colors">الرئيسية</Link></li>
              <li><Link to="/shop" className="hover:text-foreground transition-colors">المتجر</Link></li>
              <li><Link to="/about" className="hover:text-foreground transition-colors">قصتنا</Link></li>
              <li><Link to="/contact" className="hover:text-foreground transition-colors">تواصل معنا</Link></li>
            </ul>
          </div>

          <div className="md:col-span-4">
            <p className="text-sm font-semibold mb-4">تواصل</p>
            <ul className="space-y-3 text-sm text-muted-foreground">
              {info.contact_phone && (
                <li className="flex items-center gap-2">
                  <Phone className="h-4 w-4 flex-shrink-0" />
                  <a href={`tel:${info.contact_phone.replace(/\s/g, "")}`} dir="ltr" className="hover:text-foreground">
                    {info.contact_phone}
                  </a>
                </li>
              )}
              {info.contact_email && (
                <li className="flex items-center gap-2">
                  <Mail className="h-4 w-4 flex-shrink-0" />
                  <a href={`mailto:${info.contact_email}`} className="hover:text-foreground break-all">
                    {info.contact_email}
                  </a>
                </li>
              )}
              {info.contact_address && (
                <li className="flex items-start gap-2">
                  <MapPin className="h-4 w-4 flex-shrink-0 mt-0.5" />
                  <span>{info.contact_address}</span>
                </li>
              )}
              {!info.contact_phone && !info.contact_email && !info.contact_address && (
                <li>
                  <Link to="/contact" className="hover:text-foreground">صفحة التواصل</Link>
                </li>
              )}
            </ul>
          </div>
        </div>
        <div className="mt-16 flex flex-col gap-2 border-t border-border pt-6 text-xs text-muted-foreground md:flex-row md:items-center md:justify-between">
          <p>© {new Date().getFullYear()} FRAME UP Studio</p>
          <p>صُنع للحوائط التي تستحق التعليق.</p>
        </div>
      </div>
    </footer>
  );
}
