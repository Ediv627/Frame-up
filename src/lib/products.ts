import { supabase } from "@/integrations/supabase/client";
import { resolveImage } from "@/lib/product-images";

export type Product = {
  id: string;
  slug: string;
  name: string;
  tagline: string;
  description: string;
  price: number;
  image: string; // resolved URL
  imageRaw: string; // original stored value (for admin)
  category: string;
  material: string;
  color: string;
  sizes: string[];
  featured: boolean;
  badge: string | null;
  active: boolean;
  stock: number;
  lowStockThreshold: number;
  trackStock: boolean;
  sizePrices: SizePrice[];
  galleryImages: ProductImage[];
};

export type ProductImage = {
  id?: string;
  url: string;
  urlRaw: string;
  altText: string;
  sortOrder: number;
};

export type SizePrice = {
  id?: string;
  size: string;
  price: number;
  sortOrder: number;
};

type Row = {
  id: string;
  slug: string;
  name: string;
  tagline: string | null;
  description: string | null;
  price: number;
  image_url: string;
  category: string;
  material: string;
  color: string;
  sizes: string[];
  featured: boolean;
  badge: string | null;
  active: boolean;
  stock: number;
  low_stock_threshold: number;
  track_stock: boolean;
};

type SizePriceRow = {
  id: string;
  product_id: string;
  size: string;
  price: number;
  sort_order: number;
};
type ProductImageRow = {
  id: string;
  product_id: string;
  image_url: string;
  alt_text: string | null;
  sort_order: number;
};
type AuxQuery = {
  select: (columns: string) => AuxQuery;
  in: (column: string, values: string[]) => AuxQuery;
  order: (
    column: string,
    options: { ascending: boolean },
  ) => Promise<{ data: unknown[] | null; error: Error | null }>;
};
const auxClient = supabase as unknown as { from: (table: string) => AuxQuery };

function mapRow(r: Row, sizePrices: SizePrice[] = [], galleryImages: ProductImage[] = []): Product {
  const normalizedSizePrices =
    sizePrices.length > 0
      ? sizePrices
      : (r.sizes ?? []).map((size, index) => ({ size, price: Number(r.price), sortOrder: index }));
  const normalizedGallery =
    galleryImages.length > 0
      ? galleryImages
      : [{ url: resolveImage(r.image_url), urlRaw: r.image_url, altText: r.name, sortOrder: 0 }];

  return {
    id: r.id,
    slug: r.slug,
    name: r.name,
    tagline: r.tagline ?? "",
    description: r.description ?? "",
    price: Number(r.price),
    image: resolveImage(r.image_url),
    imageRaw: r.image_url,
    category: r.category,
    material: r.material,
    color: r.color,
    sizes: r.sizes ?? [],
    featured: r.featured,
    badge: r.badge,
    active: r.active,
    stock: r.stock ?? 0,
    lowStockThreshold: r.low_stock_threshold ?? 5,
    trackStock: r.track_stock ?? true,
    sizePrices: normalizedSizePrices,
    galleryImages: normalizedGallery,
  };
}

async function fetchSizePrices(productIds: string[]): Promise<Record<string, SizePrice[]>> {
  if (productIds.length === 0) return {};
  const { data, error } = await auxClient
    .from("product_size_prices")
    .select("id, product_id, size, price, sort_order")
    .in("product_id", productIds)
    .order("sort_order", { ascending: true });
  if (error) throw error;
  return ((data ?? []) as SizePriceRow[]).reduce<Record<string, SizePrice[]>>((acc, row) => {
    acc[row.product_id] ??= [];
    acc[row.product_id].push({
      id: row.id,
      size: row.size,
      price: Number(row.price),
      sortOrder: row.sort_order,
    });
    return acc;
  }, {});
}

async function fetchProductImages(productIds: string[]): Promise<Record<string, ProductImage[]>> {
  if (productIds.length === 0) return {};
  const { data, error } = await auxClient
    .from("product_images")
    .select("id, product_id, image_url, alt_text, sort_order")
    .in("product_id", productIds)
    .order("sort_order", { ascending: true });
  if (error) throw error;
  return ((data ?? []) as ProductImageRow[]).reduce<Record<string, ProductImage[]>>((acc, row) => {
    acc[row.product_id] ??= [];
    acc[row.product_id].push({
      id: row.id,
      url: resolveImage(row.image_url),
      urlRaw: row.image_url,
      altText: row.alt_text ?? "",
      sortOrder: row.sort_order,
    });
    return acc;
  }, {});
}

export async function fetchProducts(): Promise<Product[]> {
  const { data, error } = await supabase
    .from("products")
    .select("*")
    .eq("active", true)
    .order("sort_order", { ascending: true });
  if (error) throw error;
  const rows = data as Row[];
  const ids = rows.map((p) => p.id);
  const [prices, images] = await Promise.all([fetchSizePrices(ids), fetchProductImages(ids)]);
  return rows.map((row) => mapRow(row, prices[row.id], images[row.id]));
}

export async function fetchAllProducts(): Promise<Product[]> {
  const { data, error } = await supabase
    .from("products")
    .select("*")
    .order("sort_order", { ascending: true });
  if (error) throw error;
  const rows = data as Row[];
  const ids = rows.map((p) => p.id);
  const [prices, images] = await Promise.all([fetchSizePrices(ids), fetchProductImages(ids)]);
  return rows.map((row) => mapRow(row, prices[row.id], images[row.id]));
}

export async function fetchProductBySlug(slug: string): Promise<Product | null> {
  const { data, error } = await supabase
    .from("products")
    .select("*")
    .eq("slug", slug)
    .maybeSingle();
  if (error) throw error;
  if (!data) return null;
  const id = (data as Row).id;
  const [prices, images] = await Promise.all([fetchSizePrices([id]), fetchProductImages([id])]);
  return mapRow(data as Row, prices[id], images[id]);
}

export function getSizePrice(p: Pick<Product, "price" | "sizePrices">, size: string): number {
  return p.sizePrices.find((sp) => sp.size === size)?.price ?? p.price;
}

/** Helpers */
export function isOutOfStock(p: Pick<Product, "trackStock" | "stock">): boolean {
  return p.trackStock && p.stock <= 0;
}

export function isLowStock(
  p: Pick<Product, "trackStock" | "stock" | "lowStockThreshold">,
): boolean {
  return p.trackStock && p.stock > 0 && p.stock <= p.lowStockThreshold;
}
