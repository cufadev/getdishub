import { ArrowRight, Check } from "lucide-react";
import { SimpleNav, BrutalBtn, AccordionItem, useReveal, Footer, WhatsAppFloatButton } from "@/components/site";
import { track } from "@/lib/analytics";
import { waLink } from "@/lib/whatsapp";
import { RUBROS, type Rubro } from "@/lib/rubros";
import { EjemploRubro } from "@/components/CartasEjemplo";

const SITE = "https://getdishub.app";

export function rubroHead(r: Rubro) {
  const url = `${SITE}/${r.slug}`;
  const faqSchema = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: r.faq.map(([q, a]) => ({
      "@type": "Question",
      name: q,
      acceptedAnswer: { "@type": "Answer", text: a },
    })),
  };
  const serviceSchema = {
    "@context": "https://schema.org",
    "@type": "Service",
    name: r.plan.nombre,
    description: r.description,
    provider: { "@type": "Organization", name: "DISHub", url: SITE },
    areaServed: { "@type": "Country", name: "Argentina" },
    offers: {
      "@type": "Offer",
      price: r.plan.precio.replace(/[^\d]/g, ""),
      priceCurrency: "ARS",
    },
  };
  const breadcrumb = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      { "@type": "ListItem", position: 1, name: "Inicio", item: `${SITE}/` },
      { "@type": "ListItem", position: 2, name: r.title.split(" | ")[0], item: url },
    ],
  };
  return {
    meta: [
      { title: r.title },
      { name: "description", content: r.description },
      { property: "og:title", content: r.title },
      { property: "og:description", content: r.description },
      { property: "og:url", content: url },
      { property: "og:image", content: `${SITE}/og-image.png` },
      { name: "twitter:title", content: r.title },
      { name: "twitter:description", content: r.description },
      { name: "twitter:image", content: `${SITE}/og-image.png` },
    ],
    links: [{ rel: "canonical", href: url }],
    scripts: [
      { type: "application/ld+json", children: JSON.stringify(serviceSchema) },
      { type: "application/ld+json", children: JSON.stringify(faqSchema) },
      { type: "application/ld+json", children: JSON.stringify(breadcrumb) },
    ],
  };
}

export function RubroPage({ r }: { r: Rubro }) {
  useReveal();
  const otros = RUBROS.filter((x) => x.slug !== r.slug);
  return (
    <div className="min-h-screen bg-(--color-bg) text-(--color-text)">
      <SimpleNav badge={r.badge} />

      <section className="border-b border-(--color-border)">
        <div className="mx-auto max-w-4xl px-6 py-20 lg:py-28 text-center">
          <h1 className="reveal font-display font-extrabold text-(--color-text) leading-[0.95] text-[36px] sm:text-6xl lg:text-[60px] mb-8">
            {r.h1[0]}<br />
            <span className="text-(--color-accent)" style={{ textShadow: "4px 4px 0 var(--color-accent-shadow)" }}>
              {r.h1[1]}
            </span>
          </h1>
          <p className="reveal font-sans text-lg text-(--color-muted) mb-10 max-w-2xl mx-auto leading-relaxed">{r.intro}</p>
          <div className="reveal flex flex-wrap items-center justify-center gap-4">
            <BrutalBtn href="/demo" variant="primary">Probalo en la demo <ArrowRight size={16} /></BrutalBtn>
            <BrutalBtn
              href={waLink(`rubro_${r.slug}`, r.plan.key)}
              variant="secondary"
              target="_blank"
              rel="noopener"
              onClick={() => track("whatsapp_click", { origen: `rubro_${r.slug}` })}
            >
              Hablemos por WhatsApp
            </BrutalBtn>
          </div>
        </div>
      </section>

      <EjemploRubro k={r.ejemplo} />

      <section className="border-b border-(--color-border)">
        <div className="mx-auto max-w-7xl px-6 py-24">
          <h2 className="reveal font-display text-3xl sm:text-4xl font-extrabold text-center mb-14">LO QUE RESUELVE</h2>
          <div className="grid md:grid-cols-3 gap-8">
            {r.pains.map(([t, d]) => (
              <div key={t} className="reveal p-6" style={{ background: "var(--color-surface)", borderLeft: "4px solid var(--color-accent)" }}>
                <h3 className="font-display font-bold uppercase tracking-wide mb-3">{t}</h3>
                <p className="font-sans leading-relaxed text-sm text-(--color-muted)">{d}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="border-b border-(--color-border)">
        <div className="mx-auto max-w-5xl px-6 py-24 grid md:grid-cols-2 gap-12 items-start">
          <div className="reveal">
            <h2 className="font-display text-3xl sm:text-4xl font-extrabold mb-8">QUÉ INCLUYE</h2>
            <ul className="space-y-3">
              {r.incluye.map((t) => (
                <li key={t} className="flex items-start gap-3 text-sm">
                  <Check size={16} className="mt-0.5 shrink-0" color="#E8743B" strokeWidth={2.5} />
                  <span>{t}</span>
                </li>
              ))}
            </ul>
          </div>
          <div
            className="reveal p-8"
            style={{ background: "var(--color-surface)", border: "2px solid var(--color-accent)", boxShadow: "6px 6px 0 var(--color-accent-shadow)" }}
          >
            <div className="font-mono-tech text-[11px] uppercase tracking-widest text-(--color-muted) mb-2">{r.plan.nombre}</div>
            <div className="font-display text-4xl font-extrabold text-(--color-accent) mb-3">{r.plan.precio}</div>
            <p className="font-sans text-sm text-(--color-muted) leading-relaxed mb-6">{r.plan.nota}</p>
            <BrutalBtn href="/#planes" variant="primary">Ver planes <ArrowRight size={16} /></BrutalBtn>
          </div>
        </div>
      </section>

      <section className="border-b border-(--color-border)">
        <div className="mx-auto max-w-3xl px-6 py-24">
          <h2 className="reveal font-display text-3xl sm:text-4xl font-extrabold text-center mb-12">PREGUNTAS FRECUENTES</h2>
          <div className="space-y-3">
            {r.faq.map(([q, a]) => (
              <AccordionItem key={q} q={q} a={a} />
            ))}
          </div>
        </div>
      </section>

      <section className="border-b border-(--color-border)">
        <div className="mx-auto max-w-3xl px-6 py-16 text-center">
          <div className="font-mono-tech text-[11px] uppercase tracking-widest text-(--color-muted) mb-4">También para</div>
          <div className="flex flex-wrap justify-center gap-3">
            {otros.map((o) => (
              <a
                key={o.slug}
                href={`/${o.slug}`}
                className="font-display font-bold uppercase text-sm px-4 py-2 transition-colors hover:text-(--color-accent)"
                style={{ border: "2px solid var(--color-border)" }}
              >
                {o.badge.replace("// ", "")}
              </a>
            ))}
            <a href="/" className="font-display font-bold uppercase text-sm px-4 py-2 transition-colors hover:text-(--color-accent)" style={{ border: "2px solid var(--color-border)" }}>
              Qué es DISHub
            </a>
          </div>
        </div>
      </section>

      <Footer home={false} />
      <WhatsAppFloatButton />
    </div>
  );
}
