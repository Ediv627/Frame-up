import { createFileRoute, Link } from "@tanstack/react-router";

export const Route = createFileRoute("/about")({
  component: AboutPage,
});

function AboutPage() {
  return (
    <div>
      <section className="border-b border-border">
        <div className="mx-auto max-w-[1400px] px-6 md:px-10 py-16 md:py-24 grid lg:grid-cols-12 gap-10 items-end">
          <div className="lg:col-span-8">
            <p className="text-sm text-muted-foreground mb-4">من الاستوديو</p>
            <h1 className="display-ar text-[clamp(2.5rem,7vw,5.5rem)] font-black leading-[1.1]">
              نحن نصنع إطارات.
              <br />
              لا مجرد ديكور.
            </h1>
          </div>
          <div className="lg:col-span-4">
            <p className="text-base leading-relaxed text-muted-foreground">
              بدأت FRAME UP في استوديو صغير عام 2019 بقاعدة واحدة: الإطار يجب ألا ينافس ما بداخله
              أبداً. بعد خمس سنوات و12 ألف حائط، ما زلنا نلتزم بهذه القاعدة.
            </p>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-[1400px] px-6 md:px-10 py-16 md:py-24">
        <div className="grid md:grid-cols-3 gap-6">
          {[
            {
              n: "01",
              t: "خامات صادقة",
              d: "خشب صلب، معدن حقيقي، ومواد مركبة معتمدة. لا خداع بالقشرة.",
            },
            {
              n: "02",
              t: "صُنع في الاستوديو",
              d: "قطع وتجميع وتشطيب يدوي في ورشتنا. كل إطار يُفحص مرتين.",
            },
            {
              n: "03",
              t: "ضمان مدى الحياة",
              d: "إذا تشقق المفصل أو خُدش الطلاء، نستبدله. للأبد. بدون أسئلة.",
            },
          ].map((p) => (
            <div key={p.n} className="rounded-xl border border-border bg-card p-8">
              <p className="text-sm text-muted-foreground">{p.n}</p>
              <p className="text-xl font-bold mt-3">{p.t}</p>
              <p className="mt-3 text-sm text-muted-foreground leading-relaxed">{p.d}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="border-t border-border">
        <div className="mx-auto max-w-[1400px] px-6 md:px-10 py-20 md:py-28 text-center">
          <p className="text-sm text-muted-foreground mb-4">اعثر على إطارك</p>
          <p className="display-ar text-[clamp(2rem,5vw,4rem)] font-black">
            الحوائط لن تملأ نفسها.
          </p>
          <Link
            to="/shop"
            className="mt-10 inline-flex items-center gap-2 rounded-full bg-foreground px-6 py-3 text-sm font-semibold text-background hover:opacity-90 transition-opacity"
          >
            تسوق المجموعة ←
          </Link>
        </div>
      </section>
    </div>
  );
}
