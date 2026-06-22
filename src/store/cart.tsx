import { createContext, useContext, useEffect, useState, type ReactNode } from "react";
import { supabase } from "@/integrations/supabase/client";
import { resolveImage } from "@/lib/product-images";

export type CartLine = {
  productId: string;
  size: string;
  quantity: number;
};

export type CartProductSnapshot = {
  id: string;
  slug: string;
  name: string;
  price: number;
  image: string;
  sizePrices: Record<string, number>;
};

type DetailedLine = CartLine & { product: CartProductSnapshot; lineTotal: number };

type CartContextValue = {
  lines: CartLine[];
  add: (productId: string, size: string, quantity?: number) => void;
  update: (productId: string, size: string, quantity: number) => void;
  remove: (productId: string, size: string) => void;
  clear: () => void;
  subtotal: number;
  count: number;
  detailed: DetailedLine[];
  loadingProducts: boolean;
};

const CartContext = createContext<CartContextValue | null>(null);
const STORAGE_KEY = "frameup-cart-v2";

export function CartProvider({ children }: { children: ReactNode }) {
  const [lines, setLines] = useState<CartLine[]>([]);
  const [hydrated, setHydrated] = useState(false);
  const [productMap, setProductMap] = useState<Record<string, CartProductSnapshot>>({});
  const [loadingProducts, setLoadingProducts] = useState(false);

  // Load from localStorage on mount
  useEffect(() => {
    try {
      const raw = typeof window !== "undefined" ? localStorage.getItem(STORAGE_KEY) : null;
      if (raw) setLines(JSON.parse(raw));
    } catch {
      // ignore
    }
    setHydrated(true);
  }, []);

  // Persist
  useEffect(() => {
    if (hydrated && typeof window !== "undefined") {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(lines));
    }
  }, [lines, hydrated]);

  // Fetch product snapshots for items in the cart
  useEffect(() => {
    if (!hydrated) return;
    const ids = Array.from(new Set(lines.map((l) => l.productId)));
    const missing = ids.filter((id) => !productMap[id]);
    if (missing.length === 0) return;

    setLoadingProducts(true);
    supabase
      .from("products")
      .select("id, slug, name, price, image_url")
      .in("id", missing)
      .then(async ({ data }) => {
        if (data) {
          const { data: sizeRows } = await (supabase as any)
            .from("product_size_prices")
            .select("product_id, size, price")
            .in("product_id", data.map((p) => p.id));
          const priceMap = ((sizeRows ?? []) as Array<{ product_id: string; size: string; price: number }>).reduce<Record<string, Record<string, number>>>((acc, row) => {
            acc[row.product_id] ??= {};
            acc[row.product_id][row.size] = Number(row.price);
            return acc;
          }, {});
          setProductMap((prev) => {
            const next = { ...prev };
            for (const p of data) {
              next[p.id] = {
                id: p.id,
                slug: p.slug,
                name: p.name,
                price: Number(p.price),
                image: resolveImage(p.image_url),
                sizePrices: priceMap[p.id] ?? {},
              };
            }
            return next;
          });
        }
        setLoadingProducts(false);
      });
  }, [lines, hydrated, productMap]);

  const add: CartContextValue["add"] = (productId, size, quantity = 1) => {
    setLines((prev) => {
      const existing = prev.find((l) => l.productId === productId && l.size === size);
      if (existing) {
        return prev.map((l) =>
          l === existing ? { ...l, quantity: l.quantity + quantity } : l,
        );
      }
      return [...prev, { productId, size, quantity }];
    });
  };

  const update: CartContextValue["update"] = (productId, size, quantity) => {
    setLines((prev) =>
      quantity <= 0
        ? prev.filter((l) => !(l.productId === productId && l.size === size))
        : prev.map((l) =>
            l.productId === productId && l.size === size ? { ...l, quantity } : l,
          ),
    );
  };

  const remove: CartContextValue["remove"] = (productId, size) => {
    setLines((prev) => prev.filter((l) => !(l.productId === productId && l.size === size)));
  };

  const clear = () => setLines([]);

  const detailed: DetailedLine[] = lines
    .map((l) => {
      const product = productMap[l.productId];
      if (!product) return null;
      const unitPrice = product.sizePrices[l.size] ?? product.price;
      return { ...l, product: { ...product, price: unitPrice }, lineTotal: unitPrice * l.quantity };
    })
    .filter((x): x is DetailedLine => x !== null);

  const subtotal = detailed.reduce((s, l) => s + l.lineTotal, 0);
  const count = lines.reduce((s, l) => s + l.quantity, 0);

  return (
    <CartContext.Provider
      value={{ lines, add, update, remove, clear, subtotal, count, detailed, loadingProducts }}
    >
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error("useCart must be used within CartProvider");
  return ctx;
}
