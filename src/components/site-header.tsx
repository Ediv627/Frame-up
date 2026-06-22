import { Link } from "@tanstack/react-router";
import { useState } from "react";
import { useCart } from "@/store/cart";
import { useAuth } from "@/store/auth";
import { Menu, X, ShoppingBag, User, ShieldCheck } from "lucide-react";
import logo from "@/assets/frame-up-logo.png";

const nav = [
  { to: "/", label: "الرئيسية" },
  { to: "/shop", label: "المتجر" },
  { to: "/about", label: "قصتنا" },
  { to: "/track", label: "تتبع طلبك" },
  { to: "/contact", label: "تواصل معنا" },
];

export function SiteHeader() {
  const { count } = useCart();
  const { user, isAdmin } = useAuth();
  const [open, setOpen] = useState(false);

  return (
    <header className="sticky top-0 z-50 border-b border-border bg-background/85 backdrop-blur-md">
      <div className="mx-auto flex h-20 max-w-[1400px] items-center justify-between px-6 md:px-10">
        <Link to="/" className="flex items-center gap-2">
          <img src={logo} alt="FRAME UP" className="h-12 w-auto" />
        </Link>

        <nav className="hidden items-center gap-10 md:flex">
          {nav.map((n) => (
            <Link
              key={n.to}
              to={n.to}
              className="text-sm text-muted-foreground hover:text-foreground transition-colors"
              activeProps={{ className: "text-sm text-foreground font-medium" }}
              activeOptions={{ exact: n.to === "/" }}
            >
              {n.label}
            </Link>
          ))}
          {isAdmin && (
            <Link
              to="/admin"
              className="text-sm text-muted-foreground hover:text-foreground transition-colors inline-flex items-center gap-1"
              activeProps={{ className: "text-sm text-foreground font-medium" }}
            >
              <ShieldCheck className="h-3.5 w-3.5" /> الأدمن
            </Link>
          )}
        </nav>

        <div className="flex items-center gap-2">
          <Link
            to={user ? "/account" : "/auth"}
            className="hidden sm:inline-flex h-10 items-center gap-2 rounded-full border border-border px-4 text-sm hover:bg-secondary transition-colors"
          >
            <User className="h-4 w-4" />
            <span>{user ? "حسابي" : "دخول"}</span>
          </Link>
          <Link
            to="/cart"
            className="relative inline-flex h-10 items-center gap-2 rounded-full border border-border px-4 text-sm hover:bg-secondary transition-colors"
          >
            <ShoppingBag className="h-4 w-4" />
            <span className="hidden sm:inline">السلة</span>
            {count > 0 && (
              <span className="ms-1 inline-flex h-5 min-w-5 items-center justify-center rounded-full bg-foreground px-1.5 text-background text-[11px] font-semibold">
                {count}
              </span>
            )}
          </Link>
          <button
            className="md:hidden flex h-10 w-10 items-center justify-center rounded-full border border-border hover:bg-secondary transition-colors"
            onClick={() => setOpen((v) => !v)}
            aria-label="القائمة"
          >
            {open ? <X className="h-4 w-4" /> : <Menu className="h-4 w-4" />}
          </button>
        </div>
      </div>

      {open && (
        <div className="border-t border-border bg-background md:hidden">
          <nav className="flex flex-col">
            {nav.map((n) => (
              <Link
                key={n.to}
                to={n.to}
                onClick={() => setOpen(false)}
                className="border-b border-border px-6 py-4 text-sm"
              >
                {n.label}
              </Link>
            ))}
            <Link
              to={user ? "/account" : "/auth"}
              onClick={() => setOpen(false)}
              className="border-b border-border px-6 py-4 text-sm"
            >
              {user ? "حسابي" : "تسجيل الدخول"}
            </Link>
            {isAdmin && (
              <Link
                to="/admin"
                onClick={() => setOpen(false)}
                className="border-b border-border px-6 py-4 text-sm"
              >
                لوحة الأدمن
              </Link>
            )}
          </nav>
        </div>
      )}
    </header>
  );
}
