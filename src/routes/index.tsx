import { createFileRoute, Link } from "@tanstack/react-router";
import { motion, useReducedMotion } from "framer-motion";
import heroGallery from "@/assets/hero-gallery.jpg";
import { fetchProducts, type Product } from "@/lib/products";
import { Marquee } from "@/components/marquee";
import { MotionSection, MotionItem } from "@/components/motion-section";
import { ArrowUpLeft, Star } from "lucide-react";
import { useEffect, useState } from "react";

export const Route = createFileRoute("/")({
  component: HomePage,
});

function HomePage() {
  const [products, setProducts] = useState<Product[]>([]);

  useEffect(() => {
    fetchProducts().then(setProducts);
  }, []);

  const featured = products.filter((p) => p.featured);

  return (
    <>
      <Hero heroImage={featured[0]?.image ?? products[0]?.image ?? heroGallery} />
      <TiltedMarquee />
      <Featured products={featured.length ? featured : products} />
      <CategoriesSection products={products} />
      <Promo />
      <Reviews />
    </>
  );
}

function Hero({ heroImage }: { heroImage: string }) {
  const reduce = useReducedMotion();
  const ease = [0.22, 1, 0.36, 1] as [number, number, number, number];
  const stagger = {
    hidden: {},
    visible: { transition: { staggerChildren: 0.1, delayChildren: 0.1 } },
  };
  const rise = {
    hidden: { opacity: 0, y: 28 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.8, ease } },
  };

  return (
    <section className="bg-[#f5f3ee] text-[#0d0d0d] overflow-hidden">
      <div className="mx-auto max-w-[1400px] px-6 md:px-12 py-16 md:py-24">
        <motion.div
          className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-8 items-center"
          initial={reduce ? undefined : "hidden"}
          animate={reduce ? undefined : "visible"}
          variants={stagger}
        >
          {/* Text column */}
          <div className="lg:col-span-7 space-y-8 order-2 lg:order-1">
            <motion.span
              variants={rise}
              className="block text-[#2d2d2d] uppercase tracking-[0.25em] text-xs font-semibold"
            >
              صناعة يدوية في مصر
            </motion.span>
            <motion.h1
              variants={rise}
              className="display-ar text-[clamp(3rem,9vw,7rem)] leading-[0.95]"
            >
              إطار
              <br />
              <span className="text-transparent bg-clip-text bg-gradient-to-l from-[#0d0d0d] to-[#2d2d2d]/40">
                يخلّد
              </span>
              <br />
              الذكرى.
            </motion.h1>
            <motion.p
              variants={rise}
              className="text-lg leading-relaxed max-w-md text-[#2d2d2d]/80"
            >
              نحن لا نصنع مجرد براويز، نحن نصمم قطعاً فنية يدوية تحمي ذكرياتك بأرقى الخامات الخشبية
              والزجاجية.
            </motion.p>
            <motion.div variants={rise} className="flex flex-wrap gap-4 pt-2">
              <Link
                to="/shop"
                className="bg-[#0d0d0d] text-[#f5f3ee] px-10 py-5 text-base font-bold hover:bg-[#2d2d2d] transition-colors inline-flex items-center gap-2"
              >
                تسوّق المجموعة <ArrowUpLeft className="h-4 w-4" />
              </Link>
              <Link
                to="/about"
                className="border border-[#0d0d0d] px-10 py-5 text-base font-bold hover:bg-[#e8e4dd] transition-colors"
              >
                قصتنا
              </Link>
            </motion.div>
          </div>

          {/* Image collage column */}
          <motion.div variants={rise} className="lg:col-span-5 relative order-1 lg:order-2">
            <motion.div
              whileHover={reduce ? undefined : { rotate: 0 }}
              transition={{ duration: 0.7, ease }}
              initial={{ rotate: 2 }}
              animate={{ rotate: 2 }}
              className="aspect-[4/5] bg-[#e8e4dd] border-8 border-[#0d0d0d] overflow-hidden shadow-2xl"
            >
              <img src={heroImage} alt="FRAME UP" className="w-full h-full object-cover" />
            </motion.div>
            <motion.div
              initial={{ rotate: -6, opacity: 0, y: 20 }}
              animate={{ rotate: -6, opacity: 1, y: 0 }}
              transition={{ delay: 0.6, duration: 0.7, ease }}
              className="absolute -bottom-8 -right-6 w-44 h-56 border-4 border-[#2d2d2d] bg-[#f5f3ee] hidden md:flex items-center justify-center p-2"
            >
              <div className="w-full h-full bg-[#e8e4dd] flex items-center justify-center text-center">
                <span className="text-[#0d0d0d] font-bold text-[11px] uppercase tracking-[0.2em] px-4 leading-relaxed">
                  جودة تليق
                  <br />
                  بمحتواك
                </span>
              </div>
            </motion.div>
          </motion.div>
        </motion.div>
      </div>
    </section>
  );
}

function TiltedMarquee() {
  return (
    <div className="bg-[#0d0d0d] py-5 overflow-hidden border-y border-[#0d0d0d]">
      <Marquee
        items={[
          "شحن مجاني للطلبات فوق 1200 ج.م",
          "✦",
          "صُنع في الاستوديو",
          "✦",
          "ضمان مدى الحياة",
          "✦",
          "توصيل سريع لكل المحافظات",
          "✦",
        ]}
      />
    </div>
  );
}

function Featured({ products }: { products: Product[] }) {
  if (products.length === 0) {
    return (
      <section className="mx-auto max-w-[1400px] px-6 md:px-12 py-16">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="aspect-square bg-[#e8e4dd] animate-pulse" />
          ))}
        </div>
      </section>
    );
  }

  const items = products.slice(0, 3);

  return (
    <MotionSection className="bg-[#f5f3ee]">
      <div className="mx-auto max-w-[1400px] px-6 md:px-12 py-20 md:py-28">
        <div className="flex justify-between items-end border-b-2 border-[#0d0d0d] pb-6 mb-16">
          <div>
            <p className="text-xs font-bold uppercase tracking-[0.25em] text-[#2d2d2d] mb-3">
              المجموعة
            </p>
            <h2 className="display-ar text-4xl md:text-5xl">المختارات</h2>
          </div>
          <Link
            to="/shop"
            className="text-[#0d0d0d] font-bold border-b-2 border-[#0d0d0d] pb-1 text-sm hover:opacity-70 transition-opacity"
          >
            مشاهدة الكل
          </Link>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-10 md:gap-12">
          {items.map((p, i) => (
            <MotionItem key={p.id} index={i} className={i === 1 ? "md:mt-16" : ""}>
              <Link to="/shop/$slug" params={{ slug: p.slug }} className="group block">
                <div
                  className={`relative overflow-hidden mb-6 border border-[#0d0d0d]/10 ${
                    i === 1 ? "aspect-[3/4] bg-[#2d2d2d]" : "aspect-square bg-[#e8e4dd]"
                  }`}
                >
                  <img
                    src={p.image}
                    alt={p.name}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
                  />
                  {p.badge && (
                    <div className="absolute top-4 right-4 bg-[#0d0d0d] text-[#f5f3ee] px-3 py-1 text-xs font-bold uppercase tracking-widest">
                      {p.badge}
                    </div>
                  )}
                </div>
                <h3 className="text-xl font-bold text-[#0d0d0d]">{p.name}</h3>
                {p.tagline && <p className="text-[#2d2d2d] opacity-60 mb-2 text-sm">{p.tagline}</p>}
                <span className="text-lg font-bold">{p.price} ج.م</span>
              </Link>
            </MotionItem>
          ))}
        </div>
      </div>
    </MotionSection>
  );
}

function CategoriesSection({ products }: { products: Product[] }) {
  const [categories, setCategories] = useState<import("@/lib/taxonomy").Category[]>([]);
  useEffect(() => {
    import("@/lib/taxonomy").then((m) => m.fetchCategories().then(setCategories));
  }, []);

  const items = categories.map((c) => ({
    slug: c.slug,
    label: c.name_ar,
    image: c.image_url,
    count: products.filter((p) => p.category === c.slug).length,
  }));

  if (items.length === 0) return null;

  return (
    <MotionSection className="bg-[#e8e4dd]/40 border-y border-[#0d0d0d]/10">
      <div className="mx-auto max-w-[1400px] px-6 md:px-12 py-20">
        <div className="mb-12">
          <p className="text-xs font-bold uppercase tracking-[0.25em] text-[#2d2d2d] mb-3">
            الفئات
          </p>
          <h2 className="display-ar text-4xl md:text-5xl">تصفّح حسب الفئة</h2>
        </div>
        <div
          dir="rtl"
          className="flex gap-4 md:gap-6 overflow-x-auto snap-x snap-mandatory scroll-smooth pb-4 -mx-6 px-6 md:-mx-12 md:px-12 [scrollbar-width:thin]"
        >
          {items.map((c, i) => (
            <motion.div
              key={c.slug}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-40px" }}
              transition={{ duration: 0.5, delay: i * 0.06, ease: [0.22, 1, 0.36, 1] }}
              whileHover={{ y: -4 }}
              className="flex-shrink-0 snap-start"
            >
              <Link
                to="/shop"
                search={{ category: c.slug } as never}
                className="group block w-[180px] sm:w-[220px] md:w-[260px] overflow-hidden border border-[#0d0d0d] bg-[#f5f3ee] hover:bg-[#0d0d0d] hover:text-[#f5f3ee] transition-colors"
              >
                <div className="aspect-square bg-[#e8e4dd] overflow-hidden">
                  {c.image ? (
                    <img
                      src={c.image}
                      alt={c.label}
                      loading="lazy"
                      className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-110"
                    />
                  ) : (
                    <div className="h-full w-full flex items-center justify-center text-4xl font-black opacity-30">
                      {c.label.charAt(0)}
                    </div>
                  )}
                </div>
                <div className="p-4 flex items-center justify-between">
                  <p className="font-bold">{c.label}</p>
                  <p className="text-xs opacity-70">{c.count} منتج</p>
                </div>
              </Link>
            </motion.div>
          ))}
        </div>
      </div>
    </MotionSection>
  );
}

function Promo() {
  return (
    <MotionSection className="bg-[#f5f3ee]">
      <div className="mx-auto max-w-[1400px] px-6 md:px-12 py-20">
        <motion.div
          whileHover={{ scale: 1.005 }}
          transition={{ duration: 0.4 }}
          className="relative overflow-hidden bg-[#0d0d0d] p-12 md:p-20 text-[#f5f3ee] border-8 border-[#0d0d0d]"
        >
          <motion.div
            className="absolute -inset-x-20 -top-20 h-40 bg-gradient-to-r from-transparent via-[#f5f3ee]/10 to-transparent blur-2xl"
            animate={{ x: ["-30%", "130%"] }}
            transition={{ duration: 6, repeat: Infinity, ease: "linear" }}
          />
          <div className="relative max-w-2xl">
            <p className="text-xs uppercase tracking-[0.3em] text-[#e8e4dd]/60 mb-4">عرض محدود</p>
            <h3 className="display-ar text-[clamp(2rem,5vw,4rem)]">
              خصم 20% على
              <br />
              مجموعات الثلاثيات
            </h3>
            <p className="mt-6 text-[#e8e4dd]/70 leading-relaxed text-lg max-w-lg">
              ثلاثة إطارات. حوار واحد. ابنِ جداراً يستحق الحديث عنه.
            </p>
            <Link
              to="/shop"
              className="mt-10 inline-flex items-center gap-2 bg-[#f5f3ee] text-[#0d0d0d] px-10 py-5 text-base font-bold hover:bg-[#e8e4dd] transition-colors"
            >
              تسوّق العرض <ArrowUpLeft className="h-4 w-4" />
            </Link>
          </div>
        </motion.div>
      </div>
    </MotionSection>
  );
}

function Reviews() {
  const reviews = [
    {
      name: "مايا ر.",
      role: "مصورة، القاهرة",
      text: "هذه ليست إطارات. هذه علامات ترقيم. إطار مونوليث جعل صوري تبدو كقطع متحفية.",
    },
    {
      name: "دانيال ك.",
      role: "معماري، الإسكندرية",
      text: "خامات صادقة، بدون تكلف. إطار البلوط الطبيعي موجود الآن في كل غرفة من شقتي.",
    },
    {
      name: "بريا س.",
      role: "أمينة معرض، دبي",
      text: "أخيراً علامة إطارات تفهم الفن. النحاس العميق رائع بشكل جنوني في الإضاءة الخافتة.",
    },
  ];
  return (
    <MotionSection className="bg-[#e8e4dd]/30 border-t border-[#0d0d0d]/10">
      <div className="mx-auto max-w-[1400px] px-6 md:px-12 py-20">
        <div className="mb-12">
          <p className="text-xs font-bold uppercase tracking-[0.25em] text-[#2d2d2d] mb-3">
            آراؤهم
          </p>
          <h2 className="display-ar text-4xl md:text-5xl">ما يقوله عملاؤنا</h2>
        </div>
        <div className="grid gap-px bg-[#0d0d0d] border border-[#0d0d0d] md:grid-cols-3">
          {reviews.map((r, i) => (
            <MotionItem key={i} index={i} className="bg-[#f5f3ee]">
              <div className="p-8 flex flex-col h-full">
                <div className="flex gap-0.5 mb-6">
                  {[...Array(5)].map((_, j) => (
                    <Star key={j} className="h-4 w-4 fill-[#0d0d0d] text-[#0d0d0d]" />
                  ))}
                </div>
                <p className="text-base leading-relaxed flex-1">«{r.text}»</p>
                <div className="mt-8 pt-4 border-t border-[#0d0d0d]/15">
                  <p className="font-bold text-sm">{r.name}</p>
                  <p className="text-xs mt-0.5 text-[#2d2d2d]/60">{r.role}</p>
                </div>
              </div>
            </MotionItem>
          ))}
        </div>
      </div>
    </MotionSection>
  );
}
