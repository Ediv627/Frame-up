import { Outlet, Link, createRootRoute } from "@tanstack/react-router";
import { CartProvider } from "@/store/cart";
import { AuthProvider } from "@/store/auth";
import { SiteHeader } from "@/components/site-header";
import { SiteFooter } from "@/components/site-footer";
import { WhatsAppButton } from "@/components/whatsapp-button";
import { Toaster } from "@/components/ui/sonner";

function NotFoundComponent() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-background px-4">
      <p className="display text-[clamp(8rem,25vw,16rem)] leading-none">404</p>
      <p className="label mt-4">هذا الإطار فارغ</p>
      <Link
        to="/"
        className="mt-8 border border-border bg-foreground px-6 py-3 label text-background hover:bg-background hover:text-foreground transition-colors"
      >
        ← العودة للرئيسية
      </Link>
    </div>
  );
}

export const Route = createRootRoute({
  component: RootComponent,
  notFoundComponent: NotFoundComponent,
});

function RootComponent() {
  return (
    <AuthProvider>
      <CartProvider>
        <div className="flex min-h-screen flex-col">
          <SiteHeader />
          <main className="flex-1">
            <Outlet />
          </main>
          <SiteFooter />
        </div>
        <WhatsAppButton />
        <Toaster position="top-center" />
      </CartProvider>
    </AuthProvider>
  );
}
