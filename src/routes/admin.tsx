import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useEffect, useRef, useState } from "react";
import { useAuth } from "@/store/auth";
import { supabase } from "@/integrations/supabase/client";
import {
  fetchAllProducts,
  isLowStock,
  isOutOfStock,
  type Product,
  type ProductImage,
  type SizePrice,
} from "@/lib/products";
import {
  fetchCategories,
  fetchColors,
  fetchMaterials,
  type Category,
  type Color,
  type Material,
} from "@/lib/taxonomy";
import { fetchShippingRates, type GovernorateShipping } from "@/lib/shipping";
import { resolveImage } from "@/lib/product-images";
import {
  Package,
  Plus,
  Pencil,
  Trash2,
  ShoppingBag,
  X,
  Eye,
  Tags,
  AlertCircle,
  Truck,
  MessageCircle,
  Upload,
} from "lucide-react";
import { toast } from "sonner";

export const Route = createFileRoute("/admin")({
  component: AdminPage,
});

type Tab = "products" | "orders" | "taxonomy" | "shipping" | "contact";
type AdminDbQuery = {
  delete: () => AdminDbQuery;
  update: (values: Record<string, unknown>) => AdminDbQuery;
  insert: (
    values: Record<string, unknown> | Array<Record<string, unknown>>,
  ) => Promise<{ error: Error | null }>;
  eq: (column: string, value: unknown) => Promise<{ error: Error | null }>;
};
const adminDb = supabase as unknown as { from: (table: string) => AdminDbQuery };

function AdminPage() {
  const { user, isAdmin, loading } = useAuth();
  const navigate = useNavigate();
  const [tab, setTab] = useState<Tab>("products");

  useEffect(() => {
    if (loading) return;
    if (!user) navigate({ to: "/auth" });
  }, [user, loading, navigate]);

  if (loading) {
    return (
      <div className="mx-auto max-w-2xl px-6 py-24 text-center">
        <p className="text-sm text-muted-foreground">جاري التحميل...</p>
      </div>
    );
  }

  if (!user) return null;

  if (!isAdmin) {
    return (
      <div className="mx-auto max-w-2xl px-6 py-24 text-center">
        <h1 className="display-ar text-3xl font-black mb-4">غير مصرّح</h1>
        <p className="text-sm text-muted-foreground mb-6">
          هذه الصفحة متاحة للمشرفين فقط. تواصل مع الإدارة لرفع صلاحياتك.
        </p>
        <p className="text-xs text-muted-foreground mb-6 font-mono break-all">
          معرّف المستخدم: {user.id}
        </p>
        <Link
          to="/"
          className="inline-block rounded-full bg-foreground px-5 py-3 text-sm text-background"
        >
          العودة للرئيسية
        </Link>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-[1400px] px-6 md:px-10 py-12 md:py-16">
      <div className="mb-10">
        <p className="text-sm text-muted-foreground mb-2">FRAME UP Admin</p>
        <h1 className="display-ar text-[clamp(2rem,5vw,3rem)] font-black">لوحة التحكم</h1>
      </div>

      <div className="mb-8 flex gap-2 border-b border-border overflow-x-auto">
        <TabBtn active={tab === "products"} onClick={() => setTab("products")}>
          <Package className="h-4 w-4" /> المنتجات
        </TabBtn>
        <TabBtn active={tab === "taxonomy"} onClick={() => setTab("taxonomy")}>
          <Tags className="h-4 w-4" /> الفئات والخيارات
        </TabBtn>
        <TabBtn active={tab === "shipping"} onClick={() => setTab("shipping")}>
          <Truck className="h-4 w-4" /> الشحن
        </TabBtn>
        <TabBtn active={tab === "orders"} onClick={() => setTab("orders")}>
          <ShoppingBag className="h-4 w-4" /> الطلبات
        </TabBtn>
        <TabBtn active={tab === "contact"} onClick={() => setTab("contact")}>
          <MessageCircle className="h-4 w-4" /> التواصل
        </TabBtn>
      </div>

      {tab === "products" && <ProductsTab />}
      {tab === "taxonomy" && <TaxonomyTab />}
      {tab === "shipping" && <ShippingTab />}
      {tab === "orders" && <OrdersTab />}
      {tab === "contact" && <ContactTab />}
    </div>
  );
}

function TabBtn({
  active,
  onClick,
  children,
}: {
  active: boolean;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <button
      onClick={onClick}
      className={`inline-flex items-center gap-2 px-5 py-3 text-sm border-b-2 -mb-px transition-colors ${
        active
          ? "border-foreground font-semibold"
          : "border-transparent text-muted-foreground hover:text-foreground"
      }`}
    >
      {children}
    </button>
  );
}

/* ============ PRODUCTS TAB ============ */
function ProductsTab() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState<Product | null>(null);
  const [creating, setCreating] = useState(false);

  const reload = () => {
    setLoading(true);
    fetchAllProducts()
      .then(setProducts)
      .finally(() => setLoading(false));
  };

  useEffect(reload, []);

  const handleDelete = async (id: string) => {
    if (!confirm("هل أنت متأكد من حذف هذا المنتج؟")) return;
    const { error } = await supabase.from("products").delete().eq("id", id);
    if (error) {
      toast.error("فشل الحذف");
    } else {
      toast.success("تم الحذف");
      reload();
    }
  };

  return (
    <div>
      <div className="mb-6 flex items-center justify-between">
        <p className="text-sm text-muted-foreground">{products.length} منتج</p>
        <button
          onClick={() => setCreating(true)}
          className="inline-flex items-center gap-2 rounded-full bg-foreground px-5 py-2.5 text-sm font-semibold text-background hover:opacity-90"
        >
          <Plus className="h-4 w-4" /> إضافة منتج
        </button>
      </div>

      {loading ? (
        <p className="text-sm text-muted-foreground py-12 text-center">جاري التحميل...</p>
      ) : (
        <div className="grid gap-4">
          {products.map((p) => (
            <div key={p.id} className="rounded-lg border border-border p-4 flex items-center gap-4">
              <div className="h-16 w-16 rounded-md overflow-hidden bg-secondary flex-shrink-0">
                <img src={p.image} alt="" className="h-full w-full object-cover" />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 flex-wrap">
                  <p className="text-sm font-semibold truncate">{p.name}</p>
                  {!p.active && (
                    <span className="text-[10px] bg-secondary px-2 py-0.5 rounded-full">مخفي</span>
                  )}
                  {p.featured && (
                    <span className="text-[10px] bg-foreground text-background px-2 py-0.5 rounded-full">
                      مميز
                    </span>
                  )}
                  {!p.trackStock ? (
                    <span className="text-[10px] bg-secondary text-muted-foreground px-2 py-0.5 rounded-full">
                      بدون تتبع
                    </span>
                  ) : isOutOfStock(p) ? (
                    <span className="text-[10px] bg-destructive text-destructive-foreground px-2 py-0.5 rounded-full inline-flex items-center gap-1">
                      <AlertCircle className="h-2.5 w-2.5" /> نفد
                    </span>
                  ) : isLowStock(p) ? (
                    <span className="text-[10px] bg-amber-500 text-white px-2 py-0.5 rounded-full">
                      منخفض
                    </span>
                  ) : null}
                </div>
                <p className="text-xs text-muted-foreground mt-0.5 truncate">{p.tagline}</p>
              </div>
              <div className="text-end whitespace-nowrap">
                <p className="text-sm font-semibold">{p.price} ج.م</p>
                {p.trackStock && (
                  <p className="text-xs text-muted-foreground mt-0.5">المخزون: {p.stock}</p>
                )}
              </div>
              <div className="flex gap-1">
                <button
                  onClick={() => setEditing(p)}
                  className="h-9 w-9 rounded-full hover:bg-secondary inline-flex items-center justify-center"
                  aria-label="تعديل"
                >
                  <Pencil className="h-4 w-4" />
                </button>
                <button
                  onClick={() => handleDelete(p.id)}
                  className="h-9 w-9 rounded-full hover:bg-secondary inline-flex items-center justify-center text-red-600"
                  aria-label="حذف"
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {(editing || creating) && (
        <ProductFormDialog
          product={editing}
          onClose={() => {
            setEditing(null);
            setCreating(false);
          }}
          onSaved={() => {
            setEditing(null);
            setCreating(false);
            reload();
          }}
        />
      )}
    </div>
  );
}

function formatSizePrices(product: Product | null): string {
  if (!product) return "20x30=850, 30x40=1100";
  const rows =
    product.sizePrices.length > 0
      ? product.sizePrices
      : product.sizes.map((size, index) => ({ size, price: product.price, sortOrder: index }));
  return rows.map((sp) => `${sp.size}=${sp.price}`).join(", ");
}

function parseSizePrices(input: string, fallbackPrice: number): SizePrice[] {
  const parts = input
    .split(",")
    .map((part) => part.trim())
    .filter(Boolean);
  const parsed = parts
    .map((part, index) => {
      const [rawSize, rawPrice] = part.split("=").map((v) => v.trim());
      return {
        size: rawSize,
        price: Math.max(0, Number(rawPrice || fallbackPrice) || fallbackPrice || 0),
        sortOrder: index,
      };
    })
    .filter((sp) => sp.size);
  return parsed.length > 0
    ? parsed
    : [{ size: "افتراضي", price: Math.max(0, fallbackPrice || 0), sortOrder: 0 }];
}

function formatGalleryImages(product: Product | null): string {
  if (!product) return "";
  return product.galleryImages.map((image) => image.urlRaw).join("\n");
}

function parseGalleryImages(input: string, mainImage: string): ProductImage[] {
  const urls = input
    .split(/\n|,/)
    .map((part) => part.trim())
    .filter(Boolean);
  const normalized = urls.length > 0 ? urls : [mainImage.trim()].filter(Boolean);
  return normalized.map((url, index) => ({ url, urlRaw: url, altText: "", sortOrder: index }));
}

function ProductFormDialog({
  product,
  onClose,
  onSaved,
}: {
  product: Product | null;
  onClose: () => void;
  onSaved: () => void;
}) {
  const [form, setForm] = useState({
    slug: product?.slug ?? "",
    name: product?.name ?? "",
    tagline: product?.tagline ?? "",
    description: product?.description ?? "",
    price: product?.price ?? 0,
    image_url: product?.imageRaw ?? "",
    gallery_images: formatGalleryImages(product),
    category: product?.category ?? "wall",
    material: product?.material ?? "wood",
    color: product?.color ?? "black",
    sizes: formatSizePrices(product),
    featured: product?.featured ?? false,
    badge: product?.badge ?? "",
    active: product?.active ?? true,
    stock: product?.stock ?? 0,
    low_stock_threshold: product?.lowStockThreshold ?? 5,
    track_stock: product?.trackStock ?? true,
  });
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [categories, setCategories] = useState<Category[]>([]);
  const [colors, setColors] = useState<Color[]>([]);
  const [materials, setMaterials] = useState<Material[]>([]);

  useEffect(() => {
    Promise.all([fetchCategories(), fetchColors(), fetchMaterials()]).then(([c, co, m]) => {
      setCategories(c);
      setColors(co);
      setMaterials(m);
    });
  }, []);

  const handleUpload = async (file: File) => {
    setUploading(true);
    try {
      const ext = file.name.split(".").pop() ?? "jpg";
      const path = `${Date.now()}-${Math.random().toString(36).slice(2)}.${ext}`;
      const { error } = await supabase.storage.from("product-images").upload(path, file);
      if (error) throw error;
      const { data } = supabase.storage.from("product-images").getPublicUrl(path);
      setForm((f) => ({
        ...f,
        image_url: f.image_url || data.publicUrl,
        gallery_images: [f.gallery_images, data.publicUrl].filter(Boolean).join("\n"),
      }));
      toast.success("تم رفع الصورة");
    } catch {
      toast.error("فشل رفع الصورة");
    } finally {
      setUploading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    const sizePrices = parseSizePrices(form.sizes, Number(form.price));
    const galleryImages = parseGalleryImages(form.gallery_images, form.image_url);
    const payload = {
      slug: form.slug.trim(),
      name: form.name.trim(),
      tagline: form.tagline.trim() || null,
      description: form.description.trim() || null,
      price: Math.min(...sizePrices.map((sp) => sp.price)),
      image_url: form.image_url.trim(),
      category: form.category,
      material: form.material,
      color: form.color,
      sizes: sizePrices.map((sp) => sp.size),
      featured: form.featured,
      badge: form.badge.trim() || null,
      active: form.active,
      stock: Math.max(0, Math.floor(Number(form.stock) || 0)),
      low_stock_threshold: Math.max(0, Math.floor(Number(form.low_stock_threshold) || 0)),
      track_stock: form.track_stock,
    };

    const productResult = product
      ? await supabase.from("products").update(payload).eq("id", product.id).select("id").single()
      : await supabase.from("products").insert(payload).select("id").single();

    const error = productResult.error;
    const savedProductId = product?.id ?? productResult.data?.id;

    if (!error && savedProductId) {
      const rows = sizePrices.map((sp) => ({
        product_id: savedProductId,
        size: sp.size,
        price: sp.price,
        sort_order: sp.sortOrder,
      }));
      await adminDb.from("product_size_prices").delete().eq("product_id", savedProductId);
      const { error: priceError } = await adminDb.from("product_size_prices").insert(rows);
      if (priceError) {
        setSaving(false);
        toast.error(`فشل حفظ أسعار المقاسات: ${priceError.message}`);
        return;
      }
      await adminDb.from("product_images").delete().eq("product_id", savedProductId);
      const imageRows = galleryImages.map((image) => ({
        product_id: savedProductId,
        image_url: image.urlRaw,
        alt_text: form.name.trim(),
        sort_order: image.sortOrder,
      }));
      const { error: imageError } = await adminDb.from("product_images").insert(imageRows);
      if (imageError) {
        setSaving(false);
        toast.error(`فشل حفظ صور المنتج: ${imageError.message}`);
        return;
      }
    }

    setSaving(false);
    if (error) {
      toast.error(`فشل الحفظ: ${error.message}`);
    } else {
      toast.success(product ? "تم التحديث" : "تم الإضافة");
      onSaved();
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-foreground/40 backdrop-blur-sm flex items-center justify-center p-4 overflow-auto">
      <div className="bg-background rounded-xl border border-border max-w-2xl w-full my-8 max-h-[90vh] overflow-auto">
        <div className="sticky top-0 bg-background border-b border-border px-6 py-4 flex items-center justify-between">
          <p className="font-semibold">{product ? "تعديل منتج" : "إضافة منتج جديد"}</p>
          <button
            onClick={onClose}
            className="h-8 w-8 rounded-full hover:bg-secondary inline-flex items-center justify-center"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div className="grid sm:grid-cols-2 gap-4">
            <Field
              label="المعرّف (slug)"
              value={form.slug}
              onChange={(v) => setForm({ ...form, slug: v })}
              required
            />
            <Field
              label="الاسم"
              value={form.name}
              onChange={(v) => setForm({ ...form, name: v })}
              required
            />
          </div>
          <Field
            label="العنوان الفرعي"
            value={form.tagline}
            onChange={(v) => setForm({ ...form, tagline: v })}
          />
          <label className="block">
            <span className="text-xs text-muted-foreground block mb-2">الوصف</span>
            <textarea
              value={form.description}
              onChange={(e) => setForm({ ...form, description: e.target.value })}
              rows={3}
              className="w-full rounded-md border border-border bg-background px-4 py-2.5 text-sm focus:outline-none focus:border-foreground"
            />
          </label>
          <div className="grid sm:grid-cols-2 gap-4">
            <Field
              label="السعر (ج.م)"
              type="number"
              value={String(form.price)}
              onChange={(v) => setForm({ ...form, price: Number(v) })}
              required
            />
            <Field
              label="الشارة (badge)"
              value={form.badge}
              onChange={(v) => setForm({ ...form, badge: v })}
            />
          </div>

          <div>
            <span className="text-xs text-muted-foreground block mb-2">صور المنتج</span>
            {form.image_url && (
              <div className="mb-3 h-32 w-32 rounded-md overflow-hidden bg-secondary border border-border">
                <img
                  src={resolveImage(form.image_url)}
                  alt=""
                  className="h-full w-full object-cover"
                />
              </div>
            )}
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              disabled={uploading}
              onChange={(e) => {
                const f = e.target.files?.[0];
                if (f) handleUpload(f);
              }}
              className="sr-only"
            />
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              disabled={uploading}
              className="inline-flex items-center gap-2 rounded-full bg-foreground px-5 py-2.5 text-sm font-semibold text-background hover:opacity-90 disabled:opacity-60"
            >
              <Upload className="h-4 w-4" />
              {uploading ? "جاري الرفع..." : "رفع صورة"}
            </button>
            {uploading && <p className="text-xs text-muted-foreground mt-2">جاري الرفع...</p>}
            <input
              type="text"
              value={form.image_url}
              onChange={(e) => setForm({ ...form, image_url: e.target.value })}
              placeholder="الصورة الرئيسية"
              className="mt-2 w-full rounded-md border border-border bg-background px-4 py-2 text-xs focus:outline-none focus:border-foreground"
            />
            <textarea
              value={form.gallery_images}
              onChange={(e) => setForm({ ...form, gallery_images: e.target.value })}
              rows={4}
              placeholder="روابط صور المعرض — كل رابط في سطر"
              className="mt-2 w-full rounded-md border border-border bg-background px-4 py-2 text-xs focus:outline-none focus:border-foreground"
            />
            {form.gallery_images && (
              <div className="mt-3 grid grid-cols-4 gap-2">
                {parseGalleryImages(form.gallery_images, form.image_url)
                  .slice(0, 8)
                  .map((image, index) => (
                    <div
                      key={`${image.urlRaw}-${index}`}
                      className="aspect-square rounded-md overflow-hidden bg-secondary border border-border"
                    >
                      <img
                        src={resolveImage(image.urlRaw)}
                        alt=""
                        className="h-full w-full object-cover"
                      />
                    </div>
                  ))}
              </div>
            )}
          </div>

          <Field
            label="المقاسات وأسعارها — مثال: 20x30=850, 30x40=1100"
            value={form.sizes}
            onChange={(v) => setForm({ ...form, sizes: v })}
          />

          <div className="grid sm:grid-cols-3 gap-4">
            <Select
              label="الفئة"
              value={form.category}
              onChange={(v) => setForm({ ...form, category: v })}
              options={categories.map((c) => [c.slug, c.name_ar])}
            />
            <Select
              label="الخامة"
              value={form.material}
              onChange={(v) => setForm({ ...form, material: v })}
              options={materials.map((m) => [m.slug, m.name_ar])}
            />
            <Select
              label="اللون"
              value={form.color}
              onChange={(v) => setForm({ ...form, color: v })}
              options={colors.map((c) => [c.slug, c.name_ar])}
            />
          </div>

          {/* Stock management */}
          <div className="rounded-lg border border-border bg-secondary/30 p-4 space-y-4">
            <div className="flex items-center justify-between">
              <p className="text-sm font-semibold">إدارة المخزون</p>
              <label className="inline-flex items-center gap-2 text-xs cursor-pointer">
                <input
                  type="checkbox"
                  checked={form.track_stock}
                  onChange={(e) => setForm({ ...form, track_stock: e.target.checked })}
                />
                تتبّع المخزون
              </label>
            </div>
            {form.track_stock ? (
              <div className="grid sm:grid-cols-2 gap-4">
                <Field
                  label="الكمية المتاحة"
                  type="number"
                  value={String(form.stock)}
                  onChange={(v) => setForm({ ...form, stock: Number(v) })}
                />
                <Field
                  label="حد التنبيه (كمية محدودة)"
                  type="number"
                  value={String(form.low_stock_threshold)}
                  onChange={(v) => setForm({ ...form, low_stock_threshold: Number(v) })}
                />
              </div>
            ) : (
              <p className="text-xs text-muted-foreground">
                المخزون غير محدود — لن يتم خصم الكمية تلقائياً عند الطلب.
              </p>
            )}
          </div>

          <div className="flex gap-6">
            <label className="inline-flex items-center gap-2 text-sm cursor-pointer">
              <input
                type="checkbox"
                checked={form.featured}
                onChange={(e) => setForm({ ...form, featured: e.target.checked })}
              />
              مميز
            </label>
            <label className="inline-flex items-center gap-2 text-sm cursor-pointer">
              <input
                type="checkbox"
                checked={form.active}
                onChange={(e) => setForm({ ...form, active: e.target.checked })}
              />
              نشط (معروض في المتجر)
            </label>
          </div>

          <div className="flex justify-end gap-2 pt-4 border-t border-border">
            <button
              type="button"
              onClick={onClose}
              className="px-5 py-2.5 rounded-full border border-border text-sm hover:bg-secondary"
            >
              إلغاء
            </button>
            <button
              type="submit"
              disabled={saving}
              className="rounded-full bg-foreground px-5 py-2.5 text-sm font-semibold text-background hover:opacity-90 disabled:opacity-60"
            >
              {saving ? "جاري الحفظ..." : "حفظ"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

/* ============ ORDERS TAB ============ */
type AdminOrder = {
  id: string;
  created_at: string;
  status: string;
  total: number;
  customer_name: string;
  customer_phone: string;
  city: string;
};

type OrderItem = {
  product_name: string;
  size: string;
  quantity: number;
  unit_price: number;
  line_total: number;
  product_image: string | null;
};

function OrdersTab() {
  const [orders, setOrders] = useState<AdminOrder[]>([]);
  const [loading, setLoading] = useState(true);
  const [viewing, setViewing] = useState<AdminOrder | null>(null);

  const reload = () => {
    setLoading(true);
    supabase
      .from("orders")
      .select("id, created_at, status, total, customer_name, customer_phone, city")
      .order("created_at", { ascending: false })
      .then(({ data }) => {
        setOrders((data as AdminOrder[]) ?? []);
        setLoading(false);
      });
  };

  useEffect(reload, []);

  const updateStatus = async (id: string, status: string) => {
    const { error } = await supabase
      .from("orders")
      .update({ status: status as "pending" | "confirmed" | "shipped" | "delivered" | "cancelled" })
      .eq("id", id);
    if (error) {
      toast.error("فشل التحديث");
    } else {
      toast.success("تم التحديث");
      reload();
    }
  };

  const deleteOrder = async (id: string) => {
    if (!confirm("هل أنت متأكد من حذف هذا الطلب؟ لا يمكن التراجع.")) return;
    const { error } = await supabase.from("orders").delete().eq("id", id);
    if (error) {
      toast.error("فشل الحذف");
    } else {
      toast.success("تم حذف الطلب");
      reload();
    }
  };

  return (
    <div>
      <p className="text-sm text-muted-foreground mb-6">{orders.length} طلب</p>
      {loading ? (
        <p className="text-sm text-muted-foreground py-12 text-center">جاري التحميل...</p>
      ) : orders.length === 0 ? (
        <div className="py-16 text-center border border-dashed border-border rounded-lg">
          <p className="text-sm text-muted-foreground">لا توجد طلبات حتى الآن</p>
        </div>
      ) : (
        <div className="rounded-lg border border-border overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-secondary/40 text-xs">
              <tr>
                <Th>رقم</Th>
                <Th>التاريخ</Th>
                <Th>العميل</Th>
                <Th>المدينة</Th>
                <Th>الإجمالي</Th>
                <Th>الحالة</Th>
                <Th>عرض</Th>
                <Th>حذف</Th>
              </tr>
            </thead>
            <tbody>
              {orders.map((o) => (
                <tr key={o.id} className="border-t border-border">
                  <Td>
                    <span className="font-mono text-xs">#{o.id.slice(0, 8).toUpperCase()}</span>
                  </Td>
                  <Td>{new Date(o.created_at).toLocaleDateString("ar-EG")}</Td>
                  <Td>
                    <p>{o.customer_name}</p>
                    <p className="text-xs text-muted-foreground">{o.customer_phone}</p>
                  </Td>
                  <Td>{o.city}</Td>
                  <Td className="font-semibold whitespace-nowrap">{Number(o.total)} ج.م</Td>
                  <Td>
                    <select
                      value={o.status}
                      onChange={(e) => updateStatus(o.id, e.target.value)}
                      className="rounded-full border border-border bg-background px-3 py-1 text-xs focus:outline-none focus:border-foreground"
                    >
                      <option value="pending">قيد المراجعة</option>
                      <option value="confirmed">مؤكد</option>
                      <option value="shipped">في الطريق</option>
                      <option value="delivered">تم التوصيل</option>
                      <option value="cancelled">ملغي</option>
                    </select>
                  </Td>
                  <Td>
                    <button
                      onClick={() => setViewing(o)}
                      className="h-8 w-8 rounded-full hover:bg-secondary inline-flex items-center justify-center"
                    >
                      <Eye className="h-4 w-4" />
                    </button>
                  </Td>
                  <Td>
                    <button
                      onClick={() => deleteOrder(o.id)}
                      className="h-8 w-8 rounded-full hover:bg-destructive/10 text-destructive inline-flex items-center justify-center"
                      title="حذف الطلب"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </Td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {viewing && <OrderDetailDialog order={viewing} onClose={() => setViewing(null)} />}
    </div>
  );
}

function OrderDetailDialog({ order, onClose }: { order: AdminOrder; onClose: () => void }) {
  const [items, setItems] = useState<OrderItem[]>([]);
  const [details, setDetails] = useState<Record<string, string | number | null> | null>(null);

  useEffect(() => {
    Promise.all([
      supabase.from("orders").select("*").eq("id", order.id).single(),
      supabase.from("order_items").select("*").eq("order_id", order.id),
    ]).then(([orderRes, itemsRes]) => {
      setDetails(orderRes.data as Record<string, string | number | null>);
      setItems((itemsRes.data as OrderItem[]) ?? []);
    });
  }, [order.id]);

  return (
    <div className="fixed inset-0 z-50 bg-foreground/40 backdrop-blur-sm flex items-center justify-center p-4 overflow-auto">
      <div className="bg-background rounded-xl border border-border max-w-2xl w-full my-8 max-h-[90vh] overflow-auto">
        <div className="sticky top-0 bg-background border-b border-border px-6 py-4 flex items-center justify-between">
          <p className="font-semibold">تفاصيل الطلب #{order.id.slice(0, 8).toUpperCase()}</p>
          <button
            onClick={onClose}
            className="h-8 w-8 rounded-full hover:bg-secondary inline-flex items-center justify-center"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
        <div className="p-6 space-y-6">
          {details && (
            <div className="grid grid-cols-2 gap-4 text-sm">
              <Info label="العميل" value={String(details.customer_name)} />
              <Info label="الموبايل" value={String(details.customer_phone)} />
              <Info label="البريد" value={(details.customer_email as string) ?? "—"} />
              <Info label="المدينة" value={String(details.city)} />
              <Info label="العنوان" value={String(details.address)} />
              {details.notes && <Info label="ملاحظات" value={String(details.notes)} />}
            </div>
          )}
          <div className="border-t border-border pt-6">
            <p className="text-sm font-semibold mb-3">المنتجات</p>
            <ul className="space-y-3">
              {items.map((it, idx) => (
                <li key={idx} className="flex gap-3 items-center">
                  {it.product_image && (
                    <div className="h-12 w-12 rounded-md overflow-hidden bg-secondary flex-shrink-0">
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
                  <p className="text-sm font-semibold">{Number(it.line_total)} ج.م</p>
                </li>
              ))}
            </ul>
          </div>
          {details && (
            <div className="border-t border-border pt-4 space-y-1 text-sm">
              <div className="flex justify-between">
                <span className="text-muted-foreground">الفرعي</span>
                <span>{Number(details.subtotal)} ج.م</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">الشحن</span>
                <span>{Number(details.shipping)} ج.م</span>
              </div>
              <div className="flex justify-between font-semibold pt-2 border-t border-border">
                <span>الإجمالي</span>
                <span>{Number(details.total)} ج.م</span>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

/* ============ SHIPPING TAB ============ */
function ShippingTab() {
  const [rates, setRates] = useState<GovernorateShipping[]>([]);
  const [loading, setLoading] = useState(true);
  const [savingId, setSavingId] = useState<string | null>(null);

  const reload = () => {
    setLoading(true);
    fetchShippingRates()
      .then(setRates)
      .finally(() => setLoading(false));
  };

  useEffect(reload, []);

  const updateFee = async (rate: GovernorateShipping, fee: number) => {
    if (!rate.id) return;
    setSavingId(rate.id);
    const { error } = await adminDb
      .from("shipping_rates")
      .update({ fee: Math.max(0, fee) })
      .eq("id", rate.id);
    setSavingId(null);
    if (error) {
      toast.error(`فشل تحديث الشحن: ${error.message}`);
    } else {
      toast.success("تم تحديث سعر الشحن");
      reload();
    }
  };

  return (
    <div>
      <div className="mb-6">
        <p className="text-sm text-muted-foreground">
          عدّل سعر الشحن لكل محافظة، وسيظهر السعر مباشرة في صفحة تأكيد الطلب.
        </p>
      </div>
      {loading ? (
        <p className="text-sm text-muted-foreground py-12 text-center">جاري التحميل...</p>
      ) : (
        <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
          {rates.map((rate) => (
            <div key={rate.name} className="rounded-lg border border-border p-4">
              <div className="mb-3 flex items-center justify-between gap-3">
                <p className="text-sm font-semibold">{rate.name}</p>
                <span className="text-xs text-muted-foreground">{rate.fee} ج.م</span>
              </div>
              <div className="flex gap-2">
                <input
                  type="number"
                  min={0}
                  defaultValue={rate.fee}
                  onBlur={(e) => updateFee(rate, Number(e.target.value))}
                  className="w-full rounded-md border border-border bg-background px-4 py-2.5 text-sm focus:outline-none focus:border-foreground"
                />
                <button
                  type="button"
                  disabled={savingId === rate.id}
                  onClick={(e) => {
                    const input = e.currentTarget.parentElement?.querySelector("input");
                    updateFee(rate, Number(input?.value ?? rate.fee));
                  }}
                  className="rounded-full bg-foreground px-4 py-2 text-sm font-semibold text-background hover:opacity-90 disabled:opacity-60"
                >
                  حفظ
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

/* ============ shared small components ============ */
function Th({ children }: { children: React.ReactNode }) {
  return <th className="text-start px-4 py-3 font-semibold text-muted-foreground">{children}</th>;
}
function Td({ children, className }: { children: React.ReactNode; className?: string }) {
  return <td className={`px-4 py-3 ${className ?? ""}`}>{children}</td>;
}
function Info({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <p className="text-xs text-muted-foreground">{label}</p>
      <p className="text-sm">{value}</p>
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
function Select({
  label,
  value,
  onChange,
  options,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  options: Array<[string, string]>;
}) {
  return (
    <label className="block">
      <span className="text-xs text-muted-foreground block mb-2">{label}</span>
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="w-full rounded-md border border-border bg-background px-4 py-2.5 text-sm focus:outline-none focus:border-foreground"
      >
        {options.map(([v, l]) => (
          <option key={v} value={v}>
            {l}
          </option>
        ))}
      </select>
    </label>
  );
}

/* ============ TAXONOMY TAB ============ */
type TaxKind = "categories" | "colors" | "materials";

function TaxonomyTab() {
  const [kind, setKind] = useState<TaxKind>("categories");

  return (
    <div>
      <div className="mb-6 inline-flex rounded-full border border-border p-1 bg-secondary/30">
        <SubTabBtn active={kind === "categories"} onClick={() => setKind("categories")}>
          الفئات
        </SubTabBtn>
        <SubTabBtn active={kind === "colors"} onClick={() => setKind("colors")}>
          الألوان
        </SubTabBtn>
        <SubTabBtn active={kind === "materials"} onClick={() => setKind("materials")}>
          الخامات
        </SubTabBtn>
      </div>
      {kind === "categories" && <TaxonomyList kind="categories" />}
      {kind === "colors" && <TaxonomyList kind="colors" />}
      {kind === "materials" && <TaxonomyList kind="materials" />}
    </div>
  );
}

function SubTabBtn({
  active,
  onClick,
  children,
}: {
  active: boolean;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <button
      onClick={onClick}
      className={`px-4 py-1.5 text-sm rounded-full transition-colors ${
        active ? "bg-foreground text-background" : "text-muted-foreground hover:text-foreground"
      }`}
    >
      {children}
    </button>
  );
}

type TaxRow = {
  id: string;
  slug: string;
  name_ar: string;
  sort_order: number;
  hex?: string;
  image_url?: string | null;
};

function TaxonomyList({ kind }: { kind: TaxKind }) {
  const [rows, setRows] = useState<TaxRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState<TaxRow | null>(null);
  const [creating, setCreating] = useState(false);

  const reload = () => {
    setLoading(true);
    const fetcher =
      kind === "categories" ? fetchCategories : kind === "colors" ? fetchColors : fetchMaterials;
    fetcher()
      .then((d) => setRows(d as TaxRow[]))
      .finally(() => setLoading(false));
  };

  useEffect(reload, [kind]);

  const handleDelete = async (id: string) => {
    if (!confirm("حذف هذا العنصر؟ المنتجات اللي بتستخدمه هتفضل بنفس الـ slug.")) return;
    const { error } = await supabase.from(kind).delete().eq("id", id);
    if (error) {
      toast.error("فشل الحذف");
    } else {
      toast.success("تم الحذف");
      reload();
    }
  };

  const labels: Record<TaxKind, string> = {
    categories: "فئة",
    colors: "لون",
    materials: "خامة",
  };

  return (
    <div>
      <div className="mb-4 flex items-center justify-between">
        <p className="text-sm text-muted-foreground">
          {rows.length} {labels[kind]}
        </p>
        <button
          onClick={() => setCreating(true)}
          className="inline-flex items-center gap-2 rounded-full bg-foreground px-4 py-2 text-sm font-semibold text-background hover:opacity-90"
        >
          <Plus className="h-4 w-4" /> إضافة {labels[kind]}
        </button>
      </div>

      {loading ? (
        <p className="text-sm text-muted-foreground py-12 text-center">جاري التحميل...</p>
      ) : (
        <div className="grid gap-2">
          {rows.map((r) => (
            <div key={r.id} className="rounded-lg border border-border p-3 flex items-center gap-3">
              {kind === "colors" && r.hex && (
                <span
                  className="h-8 w-8 rounded-full border border-border flex-shrink-0"
                  style={{ backgroundColor: r.hex }}
                />
              )}
              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold truncate">{r.name_ar}</p>
                <p className="text-xs text-muted-foreground font-mono truncate">
                  {r.slug}
                  {kind === "colors" && r.hex ? ` · ${r.hex}` : ""}
                </p>
              </div>
              <span className="text-xs text-muted-foreground">ترتيب: {r.sort_order}</span>
              <div className="flex gap-1">
                <button
                  onClick={() => setEditing(r)}
                  className="h-9 w-9 rounded-full hover:bg-secondary inline-flex items-center justify-center"
                  aria-label="تعديل"
                >
                  <Pencil className="h-4 w-4" />
                </button>
                <button
                  onClick={() => handleDelete(r.id)}
                  className="h-9 w-9 rounded-full hover:bg-secondary inline-flex items-center justify-center text-destructive"
                  aria-label="حذف"
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {(editing || creating) && (
        <TaxonomyFormDialog
          kind={kind}
          row={editing}
          onClose={() => {
            setEditing(null);
            setCreating(false);
          }}
          onSaved={() => {
            setEditing(null);
            setCreating(false);
            reload();
          }}
        />
      )}
    </div>
  );
}

function TaxonomyFormDialog({
  kind,
  row,
  onClose,
  onSaved,
}: {
  kind: TaxKind;
  row: TaxRow | null;
  onClose: () => void;
  onSaved: () => void;
}) {
  const [form, setForm] = useState({
    slug: row?.slug ?? "",
    name_ar: row?.name_ar ?? "",
    hex: row?.hex ?? "#000000",
    image_url: row?.image_url ?? "",
    sort_order: row?.sort_order ?? 0,
  });
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const titles: Record<TaxKind, string> = {
    categories: "فئة",
    colors: "لون",
    materials: "خامة",
  };

  const handleUpload = async (file: File) => {
    setUploading(true);
    try {
      const ext = file.name.split(".").pop() ?? "jpg";
      const path = `categories/${Date.now()}-${Math.random().toString(36).slice(2)}.${ext}`;
      const { error } = await supabase.storage.from("product-images").upload(path, file);
      if (error) throw error;
      const { data } = supabase.storage.from("product-images").getPublicUrl(path);
      setForm((f) => ({ ...f, image_url: data.publicUrl }));
      toast.success("تم رفع الصورة");
    } catch {
      toast.error("فشل رفع الصورة");
    } finally {
      setUploading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    const base: Record<string, unknown> = {
      slug: form.slug.trim(),
      name_ar: form.name_ar.trim(),
      sort_order: Number(form.sort_order),
    };
    if (kind === "colors") base.hex = form.hex;
    if (kind === "categories") base.image_url = form.image_url.trim() || null;

    const { error } = row
      ? await adminDb.from(kind).update(base).eq("id", row.id)
      : await adminDb.from(kind).insert(base);

    setSaving(false);
    if (error) {
      toast.error(`فشل الحفظ: ${error.message}`);
    } else {
      toast.success(row ? "تم التحديث" : "تم الإضافة");
      onSaved();
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-foreground/40 backdrop-blur-sm flex items-center justify-center p-4 overflow-auto">
      <div className="bg-background rounded-xl border border-border max-w-md w-full">
        <div className="border-b border-border px-6 py-4 flex items-center justify-between">
          <p className="font-semibold">
            {row ? `تعديل ${titles[kind]}` : `إضافة ${titles[kind]} جديد`}
          </p>
          <button
            onClick={onClose}
            className="h-8 w-8 rounded-full hover:bg-secondary inline-flex items-center justify-center"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <Field
            label="الاسم بالعربية"
            value={form.name_ar}
            onChange={(v) => setForm({ ...form, name_ar: v })}
            required
          />
          <Field
            label="المعرّف (slug — إنجليزي بدون مسافات)"
            value={form.slug}
            onChange={(v) => setForm({ ...form, slug: v })}
            required
          />
          {kind === "colors" && (
            <label className="block">
              <span className="text-xs text-muted-foreground block mb-2">كود اللون</span>
              <div className="flex gap-2 items-center">
                <input
                  type="color"
                  value={form.hex}
                  onChange={(e) => setForm({ ...form, hex: e.target.value })}
                  className="h-10 w-14 rounded-md border border-border cursor-pointer"
                />
                <input
                  type="text"
                  value={form.hex}
                  onChange={(e) => setForm({ ...form, hex: e.target.value })}
                  className="flex-1 rounded-md border border-border bg-background px-4 py-2.5 text-sm font-mono focus:outline-none focus:border-foreground"
                />
              </div>
            </label>
          )}
          {kind === "categories" && (
            <div>
              <span className="text-xs text-muted-foreground block mb-2">صورة الفئة</span>
              {form.image_url && (
                <img
                  src={form.image_url}
                  alt=""
                  className="mb-2 h-24 w-24 rounded-md object-cover border border-border"
                />
              )}
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={(e) => {
                  const f = e.target.files?.[0];
                  if (f) handleUpload(f);
                }}
                disabled={uploading}
                className="sr-only"
              />
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                disabled={uploading}
                className="inline-flex items-center gap-2 rounded-full bg-foreground px-5 py-2.5 text-sm font-semibold text-background hover:opacity-90 disabled:opacity-60"
              >
                <Upload className="h-4 w-4" />
                {uploading ? "جاري الرفع..." : "رفع صورة"}
              </button>
              <input
                type="text"
                value={form.image_url}
                onChange={(e) => setForm({ ...form, image_url: e.target.value })}
                placeholder="أو ألصق رابط الصورة"
                className="mt-2 w-full rounded-md border border-border bg-background px-3 py-2 text-xs focus:outline-none focus:border-foreground"
              />
              {uploading && <p className="mt-1 text-xs text-muted-foreground">جاري الرفع...</p>}
            </div>
          )}
          <Field
            label="ترتيب العرض (الأصغر يظهر أولاً)"
            type="number"
            value={String(form.sort_order)}
            onChange={(v) => setForm({ ...form, sort_order: Number(v) })}
          />
          <div className="flex justify-end gap-2 pt-4 border-t border-border">
            <button
              type="button"
              onClick={onClose}
              className="px-5 py-2.5 rounded-full border border-border text-sm hover:bg-secondary"
            >
              إلغاء
            </button>
            <button
              type="submit"
              disabled={saving}
              className="rounded-full bg-foreground px-5 py-2.5 text-sm font-semibold text-background hover:opacity-90 disabled:opacity-60"
            >
              {saving ? "جاري الحفظ..." : "حفظ"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

function ContactTab() {
  const [phone, setPhone] = useState("");
  const [message, setMessage] = useState("");
  const [contactEmail, setContactEmail] = useState("");
  const [contactPhone, setContactPhone] = useState("");
  const [contactAddress, setContactAddress] = useState("");
  const [facebook, setFacebook] = useState("");
  const [instagram, setInstagram] = useState("");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    (supabase as any)
      .from("site_settings")
      .select("key, value")
      .in("key", [
        "whatsapp_phone",
        "whatsapp_message",
        "contact_email",
        "contact_phone",
        "contact_address",
        "social_facebook",
        "social_instagram",
      ])
      .then(({ data }: { data: { key: string; value: string }[] | null }) => {
        const map = Object.fromEntries((data ?? []).map((r) => [r.key, r.value]));
        setPhone(map.whatsapp_phone ?? "");
        setMessage(map.whatsapp_message ?? "");
        setContactEmail(map.contact_email ?? "");
        setContactPhone(map.contact_phone ?? "");
        setContactAddress(map.contact_address ?? "");
        setFacebook(map.social_facebook ?? "");
        setInstagram(map.social_instagram ?? "");
        setLoading(false);
      });
  }, []);

  const save = async () => {
    setSaving(true);
    const cleanPhone = phone.replace(/\D/g, "");
    const { error } = await (supabase as any).from("site_settings").upsert(
      [
        { key: "whatsapp_phone", value: cleanPhone },
        { key: "whatsapp_message", value: message },
        { key: "contact_email", value: contactEmail },
        { key: "contact_phone", value: contactPhone },
        { key: "contact_address", value: contactAddress },
        { key: "social_facebook", value: facebook },
        { key: "social_instagram", value: instagram },
      ],
      { onConflict: "key" },
    );
    setSaving(false);
    if (error) {
      toast.error("فشل الحفظ: " + error.message);
    } else {
      setPhone(cleanPhone);
      toast.success("تم حفظ بيانات التواصل");
    }
  };

  if (loading) {
    return <p className="text-sm text-muted-foreground py-12 text-center">جاري التحميل...</p>;
  }

  const preview = phone
    ? `https://wa.me/${phone.replace(/\D/g, "")}${
        message ? `?text=${encodeURIComponent(message)}` : ""
      }`
    : "";

  return (
    <div className="max-w-2xl space-y-10">
      {/* WhatsApp */}
      <section className="space-y-5">
        <div>
          <p className="text-base font-semibold mb-1">زر واتساب العائم</p>
          <p className="text-xs text-muted-foreground">
            الرقم الذي يظهر في زر التواصل أسفل الصفحة. أدخله بصيغة دولية بدون + (مثال: 201001234567)
          </p>
        </div>

        <label className="block">
          <span className="text-xs text-muted-foreground block mb-2">رقم الواتساب</span>
          <input
            type="tel"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            placeholder="201001234567"
            dir="ltr"
            className="w-full rounded-md border border-border bg-background px-4 py-2.5 text-sm focus:outline-none focus:border-foreground"
          />
        </label>

        <label className="block">
          <span className="text-xs text-muted-foreground block mb-2">
            الرسالة الافتراضية (اختياري)
          </span>
          <textarea
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            rows={3}
            placeholder="مرحباً، أريد الاستفسار عن منتجاتكم"
            className="w-full rounded-md border border-border bg-background px-4 py-2.5 text-sm focus:outline-none focus:border-foreground"
          />
        </label>

        {preview && (
          <div className="rounded-lg border border-border bg-secondary/40 p-4 text-sm">
            <p className="text-xs text-muted-foreground mb-2">معاينة الرابط</p>
            <a
              href={preview}
              target="_blank"
              rel="noopener noreferrer"
              dir="ltr"
              className="text-xs font-mono text-foreground break-all hover:underline"
            >
              {preview}
            </a>
          </div>
        )}
      </section>

      {/* Contact info */}
      <section className="space-y-5 border-t border-border pt-8">
        <div>
          <p className="text-base font-semibold mb-1">بيانات التواصل</p>
          <p className="text-xs text-muted-foreground">
            تظهر في صفحة "تواصل معنا" والفوتر. اتركها فارغة إذا لم ترغب في عرضها.
          </p>
        </div>

        <label className="block">
          <span className="text-xs text-muted-foreground block mb-2">البريد الإلكتروني</span>
          <input
            type="email"
            value={contactEmail}
            onChange={(e) => setContactEmail(e.target.value)}
            placeholder="hello@frameup.com"
            dir="ltr"
            className="w-full rounded-md border border-border bg-background px-4 py-2.5 text-sm focus:outline-none focus:border-foreground"
          />
        </label>

        <label className="block">
          <span className="text-xs text-muted-foreground block mb-2">رقم الهاتف</span>
          <input
            type="tel"
            value={contactPhone}
            onChange={(e) => setContactPhone(e.target.value)}
            placeholder="+20 100 123 4567"
            dir="ltr"
            className="w-full rounded-md border border-border bg-background px-4 py-2.5 text-sm focus:outline-none focus:border-foreground"
          />
        </label>

        <label className="block">
          <span className="text-xs text-muted-foreground block mb-2">العنوان</span>
          <textarea
            value={contactAddress}
            onChange={(e) => setContactAddress(e.target.value)}
            rows={2}
            placeholder="القاهرة، مصر"
            className="w-full rounded-md border border-border bg-background px-4 py-2.5 text-sm focus:outline-none focus:border-foreground"
          />
        </label>
      </section>

      {/* Social */}
      <section className="space-y-5 border-t border-border pt-8">
        <div>
          <p className="text-base font-semibold mb-1">روابط السوشيال ميديا</p>
          <p className="text-xs text-muted-foreground">روابط كاملة تبدأ بـ https://</p>
        </div>

        <label className="block">
          <span className="text-xs text-muted-foreground block mb-2">فيسبوك</span>
          <input
            type="url"
            value={facebook}
            onChange={(e) => setFacebook(e.target.value)}
            placeholder="https://facebook.com/frameup"
            dir="ltr"
            className="w-full rounded-md border border-border bg-background px-4 py-2.5 text-sm focus:outline-none focus:border-foreground"
          />
        </label>

        <label className="block">
          <span className="text-xs text-muted-foreground block mb-2">إنستغرام</span>
          <input
            type="url"
            value={instagram}
            onChange={(e) => setInstagram(e.target.value)}
            placeholder="https://instagram.com/frameup"
            dir="ltr"
            className="w-full rounded-md border border-border bg-background px-4 py-2.5 text-sm focus:outline-none focus:border-foreground"
          />
        </label>
      </section>

      <button
        onClick={save}
        disabled={saving}
        className="rounded-full bg-foreground px-6 py-3 text-sm font-semibold text-background hover:opacity-90 disabled:opacity-60"
      >
        {saving ? "جاري الحفظ..." : "حفظ كل البيانات"}
      </button>
    </div>
  );
}
