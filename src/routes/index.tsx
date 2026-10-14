import { createFileRoute } from "@tanstack/react-router";
import { useCallback, useEffect, useRef, useState } from "react";
import gsap from "gsap";
import ScrollTrigger from "gsap/ScrollTrigger";
import { Nav, Footer, BrutalBtn, WhatsAppFloatButton, useReveal, Preloader } from "@/components/site";
// CasosReales: componente en pausa (ver Index() más abajo), falta terminar los casos.
// import { CasosReales } from "@/components/CasosReales";
import { FaqHome, FAQ_HOME_ITEMS } from "@/components/FaqHome";
import { CartasHechas } from "@/components/CartasEjemplo";
import { track } from "@/lib/analytics";
import { waLink, type PlanKey } from "@/lib/whatsapp";

gsap.registerPlugin(ScrollTrigger);

import {
  Monitor,
  QrCode,
  Calendar,
  MessageCircle,
  CreditCard,
  ArrowRight,
  Check,
  X,
  MonitorSmartphone,
  Tablet,
  Link2,
  BarChart3,
  Star,
} from "lucide-react";

const SITE = "https://getdishub.app";

const schemaOrganization = {
  "@context": "https://schema.org",
  "@type": "Organization",
  "@id": `${SITE}/#organization`,
  "name": "DISHub",
  "url": SITE,
  "logo": `${SITE}/favicon.ico`,
  "description": "Hub digital para locales gastronómicos: carta digital, QR, pedidos por WhatsApp y mesas conectadas.",
  "areaServed": { "@type": "Country", "name": "Argentina" },
  "email": "hola@getdishub.app",
};

const schemaWebSite = {
  "@context": "https://schema.org",
  "@type": "WebSite",
  "@id": `${SITE}/#website`,
  "url": SITE,
  "name": "DISHub",
  "inLanguage": "es-AR",
  "publisher": { "@id": `${SITE}/#organization` },
};

const schemaService = {
  "@context": "https://schema.org",
  "@type": "Service",
  "name": "Carta digital para restaurantes y cafés",
  "serviceType": "Desarrollo de carta digital con QR y pedido por WhatsApp",
  "provider": { "@id": `${SITE}/#organization` },
  "areaServed": { "@type": "Country", "name": "Argentina" },
  "description": "Carta digital con la marca del local, editable desde una planilla de Google, con QR y pedido por WhatsApp opcional.",
  "offers": [
    { "@type": "Offer", "name": "Carta Digital", "price": "175000", "priceCurrency": "ARS", "description": "Desarrollo en pago único, sin hosting." },
    { "@type": "Offer", "name": "Carta + Pedido por WhatsApp", "price": "225000", "priceCurrency": "ARS", "description": "Desarrollo en pago único, sin hosting." },
    { "@type": "Offer", "name": "Hosting y mantenimiento", "price": "35000", "priceCurrency": "ARS", "description": "Mensual: hosting, subdominio y mantenimiento." },
  ],
};

const schemaFAQ = {
  "@context": "https://schema.org",
  "@type": "FAQPage",
  "mainEntity": FAQ_HOME_ITEMS.map(([q, a]) => ({
    "@type": "Question",
    "name": q,
    "acceptedAnswer": { "@type": "Answer", "text": a },
  })),
};

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "DISHub — Carta digital con QR y pedidos por WhatsApp para tu local" },
      { name: "description", content: "DISHub es el hub digital de tu local: carta digital con tu marca que editás desde una planilla de Google, QR para las mesas y pedido por WhatsApp. Sin comisiones. Desarrollo en pago único." },
      { name: "keywords", content: "carta digital restaurante, menú digital QR, carta QR para bar, pedido por WhatsApp restaurante, menú digital sin app, carta digital Argentina, menú digital para café" },
      { name: "robots", content: "index, follow, max-image-preview:large" },
      { property: "og:url", content: `${SITE}/` },
      { property: "og:title", content: "DISHub — Carta digital con QR y pedidos por WhatsApp" },
      { property: "og:description", content: "El hub digital de tu local: carta con tu marca, QR en las mesas y pedido por WhatsApp. Sin comisiones." },
      { property: "og:image", content: `${SITE}/og-image.png` },
      { property: "og:image:width", content: "1200" },
      { property: "og:image:height", content: "630" },
      { name: "twitter:title", content: "DISHub — Carta digital con QR y pedidos por WhatsApp" },
      { name: "twitter:description", content: "El hub digital de tu local: carta con tu marca, QR en las mesas y pedido por WhatsApp." },
      { name: "twitter:image", content: `${SITE}/og-image.png` },
    ],
    links: [
      { rel: "canonical", href: `${SITE}/` },
    ],
    scripts: [
      { type: "application/ld+json", children: JSON.stringify(schemaOrganization) },
      { type: "application/ld+json", children: JSON.stringify(schemaWebSite) },
      { type: "application/ld+json", children: JSON.stringify(schemaService) },
      { type: "application/ld+json", children: JSON.stringify(schemaFAQ) },
    ],
  }),
  component: Index,
});

/* ---------- hero background ---------- */
const AMBIENT_WORDS = [
  { word: "PLANILLA", x: "3%",  y: "10%", size: 60,  dur: 14, delay: 0   },
  { word: "QR",      x: "87%", y: "6%",  size: 110, dur: 16, delay: 2   },
  { word: "WHATSAPP", x: "70%", y: "78%", size: 44,  dur: 18, delay: 4   },
  { word: "PRECIOS", x: "1%",  y: "70%", size: 42,  dur: 20, delay: 1   },
  { word: "MENÚ",    x: "83%", y: "42%", size: 90,  dur: 13, delay: 3   },
  { word: "CARTA",   x: "52%", y: "85%", size: 72,  dur: 15, delay: 5   },
  { word: "PEDIDO",  x: "62%", y: "3%",  size: 52,  dur: 17, delay: 2.5 },
  { word: "LOCAL",   x: "5%",  y: "42%", size: 105, dur: 19, delay: 1.5 },
];

function HeroBg() {
  return (
    <div id="hero-bg" style={{ position: "absolute", inset: 0, pointerEvents: "none", zIndex: 0, overflow: "hidden" }}>
      <div style={{
        position: "absolute", inset: 0,
        backgroundImage: "radial-gradient(circle, rgba(245,240,232,0.4) 1px, transparent 1px)",
        backgroundSize: "28px 28px",
        animation: "dot-wave 8s ease-in-out infinite",
      }} />
      {AMBIENT_WORDS.map(({ word, x, y, size, dur, delay }) => (
        <div
          key={word}
          style={{
            position: "absolute", left: x, top: y,
            fontSize: `${size}px`,
            fontFamily: "var(--font-display)",
            fontWeight: 800,
            color: "#f5f0e8",
            opacity: 0.035,
            letterSpacing: "-0.02em",
            whiteSpace: "nowrap",
            animation: `float-word ${dur}s ease-in-out infinite`,
            animationDelay: `${delay}s`,
          }}
        >
          {word}
        </div>
      ))}
    </div>
  );
}

/* ---------- hero mockup ---------- */
function HeroMockup() {
  const [step, setStep] = useState(0);
  useEffect(() => {
    const i = setInterval(() => setStep((s) => (s + 1) % 3), 1000);
    return () => clearInterval(i);
  }, []);
  const btns = ["Ver menú", "Pagar cuenta", "Dejar reseña"];
  return (
    <div
      className="relative w-full max-w-sm mx-auto p-6"
      style={{
        background: "var(--color-surface)",
        border: "2px solid var(--color-border)",
        boxShadow: "6px 6px 0 var(--color-accent)",
      }}
    >
      <div className="flex items-center justify-between mb-6">
        <div className="font-display text-lg font-extrabold text-[var(--color-text)]">
          LA<span className="text-[var(--color-accent)]">BRASA</span>
        </div>
        <div className="font-mono-tech text-[10px] uppercase text-[var(--color-muted)] border border-[var(--color-border)] px-2 py-1">
          Mesa Nº 7
        </div>
      </div>
      <div className="space-y-3 mb-6">
        {btns.map((b, i) => (
          <div
            key={b}
            className="w-full p-3 font-display font-bold uppercase tracking-wide text-sm transition-opacity"
            style={{
              background: i === step ? "var(--color-accent)" : "var(--color-surface2)",
              color: i === step ? "var(--color-bg)" : "var(--color-text)",
              border: "2px solid " + (i === step ? "var(--color-accent)" : "var(--color-border)"),
              opacity: i === step ? 1 : 0.55,
            }}
          >
            {b} →
          </div>
        ))}
      </div>
      <div className="flex items-center gap-3 pt-4 border-t border-[var(--color-border)]">
        <div
          className="w-12 h-12 grid place-items-center"
          style={{ background: "var(--color-text)" }}
        >
          <QrCode size={32} color="#0d0d0d" />
        </div>
        <div className="font-mono-tech text-[10px] uppercase text-[var(--color-muted)] leading-tight">
          Escaneá<br />y pedí
        </div>
      </div>
    </div>
  );
}

/* ---------- hero ---------- */
function Hero() {
  useEffect(() => {
    const ctx = gsap.context(() => {
      gsap.to("#hero-bg", {
        yPercent: 25,
        ease: "none",
        scrollTrigger: {
          trigger: "#hero-section",
          start: "top top",
          end: "bottom top",
          scrub: 1,
        },
      });
    });

    const onMessage = (e: MessageEvent) => {
      if (e.data?.scrollTo) {
        document.querySelector(e.data.scrollTo)?.scrollIntoView({ behavior: "smooth" });
      }
    };
    window.addEventListener("message", onMessage);

    return () => {
      ctx.revert();
      window.removeEventListener("message", onMessage);
    };
  }, []);

  return (
    <section id="hero-section" className="relative overflow-hidden border-b border-(--color-border)">
      <HeroBg />
      <div className="relative mx-auto max-w-7xl px-6 py-20 lg:py-28 grid lg:grid-cols-5 gap-12 items-center">
        <div className="lg:col-span-3 reveal">
          <div className="inline-block font-mono-tech text-[11px] uppercase tracking-widest text-[var(--color-accent)] px-3 py-1 mb-8"
               style={{ border: "2px solid var(--color-accent)" }}>
            Hub gastronómico · ARG
          </div>
          <h1 className="font-display font-extrabold text-[var(--color-text)] leading-[0.95] text-[42px] sm:text-6xl lg:text-[72px] mb-8">
            TU CARTA<br />
            DIGITAL,<br />
            <span
              className="inline-block text-(--color-accent)"
              style={{ textShadow: "4px 4px 0 var(--color-accent-shadow)" }}
            >
              PROPIA
            </span><br />
            Y AL DÍA.
          </h1>
          <p className="font-sans text-lg text-[var(--color-muted)] mb-10 max-w-xl leading-relaxed">
            DISHub es el hub digital de tu local: carta, pedidos y mesas en un solo lugar. Hoy arrancás con tu carta, el QR y el pedido por WhatsApp; el resto se suma cuando lo necesites.
          </p>
          <div className="flex flex-wrap gap-4">
            <BrutalBtn href="#planes" variant="primary" onClick={() => track("cta_ver_planes")}>Ver planes <ArrowRight size={16} /></BrutalBtn>
            <BrutalBtn href="#como" variant="secondary" onClick={() => track("cta_demo")}>Ver demo en vivo</BrutalBtn>
          </div>
        </div>
        <div className="lg:col-span-2 reveal flex justify-center items-center">
          <iframe
            src="/dishub-phone-mockup.html"
            title="Dishub Phone Mockup"
            scrolling="no"
            style={{
              border: "none",
              width: "320px",
              height: "600px",
              background: "transparent",
              overflow: "hidden",
            }}
          />
        </div>
      </div>

      {/* stats bar */}
      <div className="relative border-t border-(--color-border)">
        <div className="mx-auto max-w-7xl grid grid-cols-2 md:grid-cols-4">
          {[
            ["100%", "Con tu marca"],
            ["0%", "Comisiones"],
            ["2", "Planes"],
            ["1 PAGO", "De desarrollo"],
          ].map(([n, l], i) => (
            <div
              key={l}
              className={`px-6 py-8 text-center ${i < 3 ? "md:border-r border-[var(--color-border)]" : ""} ${i === 1 ? "border-r md:border-r border-[var(--color-border)]" : ""} ${i < 2 ? "border-b md:border-b-0 border-[var(--color-border)]" : ""}`}
            >
              <div className="font-display text-4xl font-extrabold text-[var(--color-accent)]">{n}</div>
              <div className="font-mono-tech text-xs uppercase tracking-widest text-[var(--color-muted)] mt-2">{l}</div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ---------- hub ---------- */
type HubEstado = "hoy" | "desarrollo" | "proximo";
const HUB_ESTADO: Record<HubEstado, string> = {
  hoy: "Disponible hoy",
  desarrollo: "En desarrollo",
  proximo: "Próximamente",
};

const HUB_MODULES: Array<[string, string, HubEstado]> = [
  ["Carta digital", "Tu carta con tu marca, editable desde una planilla de Google.", "hoy"],
  ["QR por mesa y mostrador", "Un QR que siempre lleva a la carta actualizada.", "hoy"],
  ["Pedido por WhatsApp", "El cliente arma el pedido y te llega ordenado, sin comisiones.", "hoy"],
  ["Tarjeta de fidelización", "Una tarjeta en el Wallet del celular para que tus clientes vuelvan, con campañas solo a quienes aceptan.", "desarrollo"],
  ["Mesa Conectada (NFC + QR)", "Apoyan el teléfono en la mesa y tienen carta, WiFi y reseñas del local.", "proximo"],
  ["Llamar al mozo y pedir la cuenta", "Desde la mesa, sin levantar la mano.", "proximo"],
  ["Reservas online", "Confirmación automática, sin perderlas en el hilo de WhatsApp.", "proximo"],
  ["Pagos desde la mesa", "Mercado Pago o Stripe, sin esperar al mozo.", "proximo"],
];

function Hub() {
  return (
    <section id="hub" className="border-b border-[var(--color-border)]">
      <div className="mx-auto max-w-7xl px-6 py-24">
        <h2 className="reveal font-display text-3xl sm:text-5xl font-extrabold text-center text-[var(--color-text)] mb-4">
          UN HUB. TODO TU LOCAL ADENTRO.
        </h2>
        <p className="reveal font-sans text-lg text-[var(--color-muted)] text-center max-w-3xl mx-auto mb-14 leading-relaxed">
          DISHub reúne en un solo lugar todo lo que tu cliente usa de tu local: la carta, el pedido y la mesa.
          Empezás por lo que necesitás hoy y sumás módulos cuando quieras, sin rehacer nada.
        </p>
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {HUB_MODULES.map(([t, d, estado]) => {
            const on = estado === "hoy";
            const dev = estado === "desarrollo";
            return (
            <div
              key={t}
              className="reveal p-6 flex flex-col"
              style={{
                background: "var(--color-surface)",
                border: on ? "2px solid var(--color-accent)" : dev ? "2px dashed var(--color-accent)" : "2px dashed var(--color-border)",
                boxShadow: on ? "5px 5px 0 var(--color-accent-shadow)" : "none",
              }}
            >
              <span
                className="self-start font-mono-tech text-[11px] uppercase tracking-widest px-2 py-1 mb-4"
                style={on
                  ? { background: "var(--color-accent)", color: "var(--color-bg)" }
                  : dev
                    ? { border: "1px solid var(--color-accent)", color: "var(--color-accent)" }
                    : { border: "1px solid var(--color-border)", color: "var(--color-muted)" }}
              >
                {HUB_ESTADO[estado]}
              </span>
              <h3 className="font-display font-bold uppercase tracking-wide text-[var(--color-text)] mb-2">{t}</h3>
              <p className="font-sans text-sm text-[var(--color-muted)] leading-relaxed">{d}</p>
            </div>
            );
          })}
        </div>
        <div className="reveal mt-12 text-center">
          <BrutalBtn variant="primary" href="#planes">Ver planes <ArrowRight size={16} /></BrutalBtn>
        </div>
      </div>
    </section>
  );
}

/* ---------- pain / before-after ---------- */
const BEFORE_ITEMS = [
  "Menú en PDF desactualizado o foto de pizarrón",
  "Precios que cambian y la carta impresa no",
  "Sin web propia, solo un link de Instagram",
  "Cada cambio depende de que alguien lo mande a imprimir",
];

const AFTER_ITEMS = [
  "Carta digital con tu marca, cómoda de leer en el celular",
  "Cambiás precios y platos desde una planilla de Google",
  "QR en mesas y mostrador que siempre lleva a la versión actual",
  "Pedidos armados y enviados por WhatsApp (plan Carta + Pedido)",
];

function PainSection() {
  return (
    <section className="border-b border-(--color-border)">
      <div className="mx-auto max-w-7xl px-6 py-28">

        {/* Encabezado de sección */}
        <div className="reveal text-center mb-20">
          <div
            className="inline-block font-mono-tech text-[11px] uppercase tracking-widest text-(--color-accent) px-3 py-1 mb-6"
            style={{ border: "2px solid var(--color-accent)" }}
          >
            // antes vs. ahora
          </div>
          <h2 className="font-display text-3xl sm:text-5xl font-extrabold text-(--color-text) leading-[1.05]">
            ¿QUÉ CAMBIA CON{" "}
            <span
              className="text-(--color-accent)"
              style={{ textShadow: "3px 3px 0 var(--color-accent-shadow)" }}
            >
              DISHub
            </span>
            ?
          </h2>
        </div>

        {/* Dos columnas */}
        <div className="reveal flex flex-col md:flex-row md:items-stretch">

          {/* Columna ANTES */}
          <div className="flex-1 md:pr-16">
            {/* Header de columna */}
            <div className="flex items-center gap-3 mb-10">
              <div
                className="w-9 h-9 flex items-center justify-center shrink-0"
                style={{ background: "rgba(192,80,79,0.12)", border: "1px solid rgba(192,80,79,0.35)" }}
              >
                <X size={16} strokeWidth={2.5} style={{ color: "#c0504f" }} />
              </div>
              <h3
                className="font-display text-base font-bold uppercase tracking-widest"
                style={{ color: "#c0504f" }}
              >
                Hoy, tu restaurante<br />depende de:
              </h3>
            </div>

            <ul className="space-y-0">
              {BEFORE_ITEMS.map((text) => (
                <li
                  key={text}
                  className="flex items-start gap-5 py-5 border-b border-(--color-border) last:border-b-0"
                >
                  <X size={16} strokeWidth={2.5} className="mt-0.5 shrink-0" style={{ color: "#c0504f" }} />
                  <span className="font-sans text-base leading-relaxed" style={{ color: "var(--color-muted)" }}>
                    {text}
                  </span>
                </li>
              ))}
            </ul>
          </div>

          {/* Separador — vertical en desktop, horizontal en mobile */}
          <div
            className="h-px my-12 md:h-auto md:my-0 md:w-px md:mx-12 self-stretch"
            style={{ background: "rgba(232,116,59,0.4)" }}
          />

          {/* Columna DESPUÉS */}
          <div className="flex-1 md:pl-16">
            {/* Header de columna */}
            <div className="flex items-center gap-3 mb-10">
              <div
                className="w-9 h-9 flex items-center justify-center shrink-0"
                style={{ background: "rgba(232,116,59,0.12)", border: "1px solid rgba(232,116,59,0.35)" }}
              >
                <Check size={16} strokeWidth={2.5} style={{ color: "#E8743B" }} />
              </div>
              <h3 className="font-display text-base font-bold uppercase tracking-widest text-(--color-accent)">
                Con DishHub:
              </h3>
            </div>

            <ul className="space-y-0">
              {AFTER_ITEMS.map((text) => (
                <li
                  key={text}
                  className="flex items-start gap-5 py-5 border-b border-(--color-border) last:border-b-0"
                >
                  <Check size={16} strokeWidth={2.5} className="mt-0.5 shrink-0" style={{ color: "#E8743B" }} />
                  <span className="font-sans text-base leading-relaxed text-(--color-text)">
                    {text}
                  </span>
                </li>
              ))}
            </ul>
          </div>

        </div>

        {/* Comparativa visual antes / después */}
        <div className="reveal flex flex-col md:flex-row gap-6 mt-16">
          <div className="flex-1">
            <div className="font-mono-tech text-[11px] uppercase tracking-widest text-[var(--color-muted)] mb-3 flex items-center gap-2">
              <X size={14} strokeWidth={2.5} style={{ color: "#a0a0a0" }} />
              // antes
            </div>
            <img
              src="/images/antes-pizarron.jpg"
              alt="Pizarrón con menú escrito a mano, antes de DishHub"
              loading="lazy"
              className="w-full h-64 object-cover block"
              style={{ borderRadius: 0, border: "2px solid var(--color-border)" }}
              onError={(e) => {
                const img = e.currentTarget;
                img.style.display = "none";
                const parent = img.parentElement;
                if (parent) parent.style.background = "#0d0d0d";
              }}
            />
          </div>
          <div className="flex-1">
            <div className="font-mono-tech text-[11px] uppercase tracking-widest text-[var(--color-accent)] mb-3 flex items-center gap-2">
              <Check size={14} strokeWidth={2.5} style={{ color: "#E8743B" }} />
              // con dishub
            </div>
            <img
              src="/images/despues-carta.jpg"
              alt="Carta digital de DishHub en un celular"
              loading="lazy"
              className="w-full h-64 object-cover block"
              style={{ borderRadius: 0, border: "2px solid #E8743B" }}
              onError={(e) => {
                const img = e.currentTarget;
                img.style.display = "none";
                const parent = img.parentElement;
                if (parent) parent.style.background = "#0d0d0d";
              }}
            />
          </div>
        </div>

        {/* Línea de cierre */}
        <p
          className="reveal mt-20 text-center font-sans text-sm italic leading-relaxed max-w-2xl mx-auto"
          style={{ color: "#a0a0a0" }}
        >
          La mayoría de los restaurantes en LATAM siguen usando herramientas improvisadas. DishHub los saca de ahí.
        </p>

      </div>
    </section>
  );
}

/* ---------- productos ---------- */
type ProductDetail = {
  Icon: React.ComponentType<{ size?: number; color?: string; strokeWidth?: number }>;
  title: string;
  desc: string;
  tag: string;
  featured?: boolean;
  headline: string;
  body: string;
  bullets: string[];
};

const PRODUCTS: ProductDetail[] = [
  {
    Icon: Monitor,
    title: "Web Institucional",
    desc: "Tu presencia online profesional. Diseño a medida, no un template. SEO incluido desde el día uno.",
    tag: "✓ Todos los planes",
    headline: "Tu restaurante en internet, bien.",
    body: "Construimos tu sitio desde cero. No adaptamos un template — diseñamos para tu marca, tu menú y tus clientes.",
    bullets: [
      "Diseño a medida de tu identidad visual",
      "SEO on-page incluido desde el día uno",
      "Galería de fotos del local y los platos",
      "Integración directa con tu carta digital",
      "Adaptado a mobile, tablet y desktop",
      "Hosting y dominio gestionados por nosotros",
    ],
  },
  {
    Icon: QrCode,
    title: "Carta Digital",
    desc: "QR en cada mesa. Menú actualizable en tiempo real desde el admin. Sin papel. Sin desactualización.",
    tag: "✓ Todos los planes",
    headline: "El menú siempre actualizado, sin imprimir.",
    body: "QR en cada mesa. El cliente lo escanea y en segundos ve tu carta completa. Vos la actualizás desde el panel en tiempo real.",
    bullets: [
      "Cambios de precios y platos en segundos",
      "Fotos y descripción de cada producto",
      "Categorías, filtros y destacados del día",
      "Sin apps — se abre directo en el navegador",
      "Disponible en español e inglés",
      "Sin costo de impresión nunca más",
    ],
  },
  {
    Icon: Calendar,
    title: "Reservas Online",
    desc: "Booking 24/7 sin WhatsApp. El cliente elige fecha, hora y sector. Vos confirmás desde el panel.",
    tag: "→ Plan PRO y Table Hub",
    headline: "Booking 24/7, sin depender del teléfono.",
    body: "Tus clientes reservan solos desde tu web o el QR. Vos recibís la solicitud y confirmás desde el panel. Sin llamadas, sin mensajes de voz.",
    bullets: [
      "Calendario visual para que el cliente elija",
      "Sectores y horarios configurables",
      "Notificación automática al confirmar la reserva",
      "Historial completo de reservas desde el panel",
      "Límite de capacidad por turno configurable",
      "Recordatorio automático al cliente el día antes",
    ],
  },
  {
    Icon: MessageCircle,
    title: "WhatsApp IA Agent",
    desc: "Tu mozo digital que nunca duerme. Toma pedidos y reservas por Wapp. Powered by Claude AI.",
    tag: "→ Plan PRO y Table Hub",
    headline: "Tu negocio responde solo, las 24 horas.",
    body: "Un agente de IA conectado a tu WhatsApp Business que conoce tu menú, toma reservas y responde consultas automáticamente.",
    bullets: [
      "Responde en menos de 10 segundos, las 24hs",
      "Conoce tu menú y disponibilidad en tiempo real",
      "Toma reservas sin intervención humana",
      "Escala a vos si la consulta lo requiere",
      "Powered by Claude AI (Anthropic)",
      "Entrenado específicamente en tu local",
    ],
  },
  {
    Icon: CreditCard,
    title: "Table Hub",
    desc: "QR en mesa → carta → pedido → pago → reseña. Todo sin mozo. Comandas en tiempo real al admin.",
    tag: "→ Plan Table Hub",
    featured: true,
    headline: "La experiencia completa, sin mozo.",
    body: "El cliente escanea el QR de la mesa, ve la carta, pide, paga y deja reseña — todo desde su celular. Las comandas llegan en tiempo real a tu panel.",
    bullets: [
      "Pedidos en tiempo real a cocina y admin",
      "Pago integrado con Mercado Pago y Stripe",
      "Reseñas automáticas post-pago",
      "Analytics por mesa, turno y producto",
      "Comandas digitales — cero errores de orden",
      "Integrable con tu sistema de POS existente",
    ],
  },
];

function ProductModal({ product, onClose }: { product: ProductDetail; onClose: () => void }) {
  const overlayRef = useRef<HTMLDivElement>(null);
  const boxRef = useRef<HTMLDivElement>(null);

  const close = useCallback(() => {
    gsap.to(overlayRef.current, { opacity: 0, duration: 0.2 });
    gsap.to(boxRef.current, { opacity: 0, y: 14, duration: 0.2, ease: "power2.in", onComplete: onClose });
  }, [onClose]);

  useEffect(() => {
    gsap.fromTo(overlayRef.current, { opacity: 0 }, { opacity: 1, duration: 0.25 });
    gsap.fromTo(boxRef.current,
      { opacity: 0, y: 28, scale: 0.96 },
      { opacity: 1, y: 0, scale: 1, duration: 0.38, ease: "power3.out" }
    );
  }, []);

  useEffect(() => {
    const handler = (e: KeyboardEvent) => { if (e.key === "Escape") close(); };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [close]);

  const { Icon, title, headline, body, bullets, tag } = product;

  return (
    <div
      ref={overlayRef}
      onClick={close}
      style={{
        position: "fixed", inset: 0, zIndex: 200,
        background: "rgba(0,0,0,0.85)",
        display: "flex", alignItems: "center", justifyContent: "center",
        padding: "24px",
      }}
    >
      <div
        ref={boxRef}
        onClick={(e) => e.stopPropagation()}
        style={{
          background: "#1a1a1a",
          border: "2px solid #E8743B",
          boxShadow: "6px 6px 0 #b85a2b",
          maxWidth: "560px",
          width: "100%",
          padding: "40px",
          position: "relative",
          maxHeight: "90vh",
          overflowY: "auto",
        }}
      >
        <button
          onClick={close}
          style={{
            position: "absolute", top: 16, right: 16,
            background: "transparent", border: "none",
            color: "#6b6b6b", cursor: "pointer",
            fontFamily: "var(--font-mono)", fontSize: "16px", lineHeight: 1,
          }}
          aria-label="Cerrar"
        >
          ✕
        </button>

        <Icon size={32} color="#E8743B" strokeWidth={1.75} />
        <h2 style={{ fontFamily: "var(--font-display)", fontSize: "22px", fontWeight: 800, color: "#f5f0e8", textTransform: "uppercase", letterSpacing: "-0.02em", marginTop: "16px", marginBottom: "4px" }}>
          {title}
        </h2>
        <p style={{ fontFamily: "var(--font-display)", fontSize: "15px", fontWeight: 600, color: "#E8743B", marginBottom: "20px" }}>
          {headline}
        </p>

        <div style={{ height: "1px", background: "#2a2a2a", marginBottom: "20px" }} />

        <p style={{ fontFamily: "var(--font-sans)", fontSize: "14px", color: "#9a9a9a", lineHeight: 1.75, marginBottom: "24px" }}>
          {body}
        </p>

        <ul style={{ listStyle: "none", display: "flex", flexDirection: "column", gap: "10px", marginBottom: "32px" }}>
          {bullets.map((b) => (
            <li key={b} style={{ display: "flex", alignItems: "flex-start", gap: "10px", fontSize: "13px", color: "#f5f0e8", fontFamily: "var(--font-sans)" }}>
              <span style={{ color: "#E8743B", flexShrink: 0, fontWeight: 700 }}>→</span>
              {b}
            </li>
          ))}
        </ul>

        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: "12px" }}>
          <div style={{ fontFamily: "var(--font-mono)", fontSize: "10px", textTransform: "uppercase", letterSpacing: "0.05em", color: "#6b6b6b", border: "1px solid #2a2a2a", padding: "4px 8px" }}>
            {tag}
          </div>
          <a
            href="#planes"
            onClick={close}
            style={{ fontFamily: "var(--font-display)", fontSize: "13px", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.03em", color: "#0d0d0d", background: "#E8743B", padding: "10px 20px", textDecoration: "none" }}
          >
            Ver planes →
          </a>
        </div>
      </div>
    </div>
  );
}

function ProductCard({ product, onOpen }: { product: ProductDetail; onOpen: () => void }) {
  const { Icon, title, desc, tag, featured = false } = product;
  const isCartaDigital = title === "Carta Digital";
  return (
    <div
      className="reveal p-7 transition-all duration-200 cursor-pointer relative"
      style={{
        background: isCartaDigital
          ? "linear-gradient(rgba(13,13,13,0.85), rgba(13,13,13,0.85)), url(/images/carta-thumb.jpg) center/cover"
          : "var(--color-surface)",
        border: featured ? "3px solid #E8743B" : "2px solid var(--color-border)",
        boxShadow: featured ? "6px 6px 0 #b85a2b" : "none",
      }}
      onClick={onOpen}
      onMouseEnter={(e) => {
        const el = e.currentTarget as HTMLElement;
        el.style.transform = "translateY(-3px)";
        el.style.borderColor = "#E8743B";
        if (!featured) el.style.boxShadow = "4px 4px 0 #E8743B";
      }}
      onMouseLeave={(e) => {
        const el = e.currentTarget as HTMLElement;
        el.style.transform = "";
        if (!featured) {
          el.style.borderColor = "var(--color-border)";
          el.style.boxShadow = "none";
        } else {
          el.style.borderColor = "#E8743B";
        }
      }}
    >
      {featured && (
        <div
          className="absolute left-0 font-mono-tech uppercase"
          style={{ top: 0, transform: "translateY(-100%)", background: "#E8743B", color: "#0d0d0d", fontSize: "11px", fontWeight: 700, padding: "4px 12px", letterSpacing: "0.05em" }}
        >
          ★ PLAN COMPLETO
        </div>
      )}
      <Icon size={28} color="#E8743B" strokeWidth={1.75} />
      <h3 className="font-display text-base font-bold uppercase tracking-wide text-[var(--color-text)] mt-5 mb-3">
        {title}
      </h3>
      <div className="h-px bg-[var(--color-border)] mb-4" />
      <p className="font-sans text-sm text-[var(--color-muted)] leading-relaxed mb-5">{desc}</p>
      <div className="flex items-center justify-between gap-3 flex-wrap">
        <div
          className="inline-block font-mono-tech text-[10px] uppercase tracking-widest px-2 py-1"
          style={{ border: "1px solid var(--color-border)", color: "var(--color-text)" }}
        >
          {tag}
        </div>
        <span className="font-mono-tech text-[11px] uppercase tracking-widest text-[var(--color-accent)]">
          Ver más →
        </span>
      </div>
    </div>
  );
}

function Productos() {
  const [active, setActive] = useState<ProductDetail | null>(null);
  return (
    <section id="productos" className="border-b border-[var(--color-border)]">
      <div className="mx-auto max-w-7xl px-6 py-24">
        <h2 className="reveal font-display text-3xl sm:text-5xl font-extrabold text-center text-[var(--color-text)] mb-4">
          TODO LO QUE TU RESTAURANTE NECESITA
        </h2>
        <p className="reveal font-mono-tech text-xs uppercase tracking-widest text-[var(--color-muted)] text-center mb-16">
          // suite completa · sin add-ons ocultos
        </p>
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {PRODUCTS.map((p) => (
            <ProductCard key={p.title} product={p} onOpen={() => setActive(p)} />
          ))}
        </div>
      </div>
      {active && <ProductModal product={active} onClose={() => setActive(null)} />}
    </section>
  );
}

/* ---------- cómo funciona ---------- */
function Como() {
  const steps = [
    ["01", "NOS PASÁS TU CARTA", "Tu carta, tu logo y los datos del local: horarios, Instagram y dirección."],
    ["02", "LA ARMAMOS CON TU MARCA", "Te la mostramos para que la apruebes y te dejamos tu planilla de Google para editarla."],
    ["03", "SALÍS AL AIRE", "Carta online y QR listos para imprimir, en tu dominio o en un subdominio nuestro."],
  ];
  return (
    <section id="como" className="border-b border-[var(--color-border)]">
      <div className="mx-auto max-w-7xl px-6 py-24">
        <h2 className="reveal font-display text-3xl sm:text-5xl font-extrabold text-center text-[var(--color-text)] mb-16">
          TRES PASOS. UNA CARTA LISTA.
        </h2>
        <div className="grid md:grid-cols-3 gap-8 relative">
          {steps.map(([n, t, d], i) => (
            <div key={n} className="reveal relative">
              <div
                className="p-6"
                style={{
                  background: "var(--color-surface)",
                  borderLeft: "4px solid var(--color-accent)",
                }}
              >
                <div className="font-display text-5xl font-extrabold text-[var(--color-accent)] mb-3">{n}</div>
                <h3 className="font-display font-bold uppercase tracking-wide text-[var(--color-text)] mb-2">{t}</h3>
                <p className="font-sans leading-relaxed" style={{ fontSize: "14px", color: "#9a9a9a" }}>{d}</p>
              </div>
              {i < 2 && (
                <div className="hidden md:block absolute top-1/2 -right-4 text-[var(--color-accent)] font-display text-2xl">
                  →
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ---------- mesa conectada ---------- */
function MesaConectada() {
  const steps = [
    ["01", "APOYAN EL TELÉFONO", "Un tap y se abre el hub de tu local. Funciona en todos los teléfonos: el que no tiene NFC, escanea el QR de respaldo y llega al mismo lugar."],
    ["02", "PIDEN SIN FRICCIÓN", "Carta siempre actualizada, WiFi del local y mozo a un botón, según tu plan."],
    ["03", "VOS VES TODO", "Cada mesa, cada pedido, cada horario pico — todo desde tu panel."],
  ];
  return (
    <section id="mesa-conectada" className="border-b border-[var(--color-border)]">
      <div className="mx-auto max-w-7xl px-6 py-24">
        <h2 className="reveal font-display text-3xl sm:text-5xl font-extrabold text-center text-[var(--color-text)] mb-4">
          LA MESA QUE ATIENDE SOLA
        </h2>
        <p className="reveal font-sans text-lg text-[var(--color-muted)] text-center max-w-2xl mx-auto mb-16 leading-relaxed">
          Tus clientes apoyan el teléfono y tienen todo: la carta, el WiFi, el mozo y la cuenta.
          Sin descargar nada. Sin escanear nada.
        </p>
        <div className="grid md:grid-cols-3 gap-8 relative mb-14 items-stretch">
          {steps.map(([n, t, d], i) => (
            <div key={n} className="reveal relative h-full">
              <div
                className="p-6 h-full"
                style={{
                  background: "var(--color-surface)",
                  borderLeft: "4px solid var(--color-accent)",
                }}
              >
                <div className="font-display text-5xl font-extrabold text-[var(--color-accent)] mb-3">{n}</div>
                <h3 className="font-display font-bold uppercase tracking-wide text-[var(--color-text)] mb-2">{t}</h3>
                <p className="font-sans leading-relaxed" style={{ fontSize: "14px", color: "#9a9a9a" }}>{d}</p>
              </div>
              {i < 2 && (
                <div className="hidden md:block absolute top-1/2 -right-4 text-[var(--color-accent)] font-display text-2xl">
                  →
                </div>
              )}
            </div>
          ))}
        </div>
        <div className="reveal flex flex-wrap items-center justify-center gap-4">
          <BrutalBtn variant="primary" href="#cta">
            Pedí una demo con tu carta <ArrowRight size={16} />
          </BrutalBtn>
          <BrutalBtn variant="secondary" href="/mesa-conectada">
            Conocé Mesa Conectada <ArrowRight size={16} />
          </BrutalBtn>
        </div>
      </div>
    </section>
  );
}

/* ---------- planes ---------- */
function PlanCard({
  name, deploy, monthly, features, cta, plan, borderColor, shadowColor, badge, pitch, audience,
}: {
  name: string; deploy: string; monthly: string;
  features: Array<[boolean, string]>; cta: string; plan: PlanKey;
  borderColor: string; shadowColor?: string; badge?: string; pitch?: string; audience?: string[];
}) {
  return (
    <div
      className="reveal p-8 relative flex flex-col"
      style={{
        background: "var(--color-surface)",
        border: `2px solid ${borderColor}`,
        boxShadow: shadowColor ? `6px 6px 0 ${shadowColor}` : "none",
      }}
    >
      {badge && (
        <div
          className="absolute -top-3 left-6 font-mono-tech text-[10px] uppercase tracking-widest px-2 py-1"
          style={{ background: "var(--color-accent)", color: "var(--color-bg)" }}
        >
          {badge}
        </div>
      )}
      <div className="font-display text-2xl font-extrabold uppercase tracking-tight text-[var(--color-text)] mb-4">{name}</div>
      <div className="mb-6">
        <div className="font-display text-3xl font-extrabold text-[var(--color-text)]">{deploy}</div>
        <div className="font-mono-tech text-sm text-[var(--color-muted)] mt-1">{monthly}</div>
        {pitch && (
          <p className="font-sans text-xs text-(--color-muted) mt-3 leading-relaxed italic border-l-2 pl-3" style={{ borderColor }}>
            "{pitch}"
          </p>
        )}
      </div>
      <div className="h-px bg-[var(--color-border)] mb-5" />
      {audience && (
        <div className="mb-5">
          <div className="font-mono-tech text-[10px] uppercase tracking-widest text-(--color-muted) mb-2">Ideal para:</div>
          <ul className="space-y-1">
            {audience.map((a) => (
              <li key={a} className="font-sans text-xs text-(--color-text) flex items-start gap-2">
                <span style={{ color: borderColor === "#2a2a2a" ? "#E8743B" : borderColor }} className="shrink-0 mt-0.5">·</span>
                {a}
              </li>
            ))}
          </ul>
          <div className="h-px bg-(--color-border) mt-5" />
        </div>
      )}
      <ul className="space-y-3 mb-6 flex-1">
        {features.map(([ok, t]) => {
          const isMesaConectada = ok && t.startsWith("Mesa Conectada (NFC + QR)");
          return (
            <li key={t} className="flex items-start gap-3 text-sm">
              {ok ? <Check size={16} className="mt-0.5 shrink-0" color="#E8743B" strokeWidth={2.5} /> :
                    <X size={16} className="mt-0.5 shrink-0" color="#3a3a3a" strokeWidth={2} />}
              {isMesaConectada ? (
                <a href="/mesa-conectada" className="text-[var(--color-text)] hover:underline">{t}</a>
              ) : (
                <span className={ok ? "text-[var(--color-text)]" : "text-[#3a3a3a] line-through"}>{t}</span>
              )}
            </li>
          );
        })}
      </ul>
      <a
        href={waLink("plan_card", plan)}
        target="_blank"
        rel="noopener"
        onClick={() => {
          track("plan_click", { plan });
          track("whatsapp_click", { origen: "plan_card" });
        }}
        className="mt-auto block w-full text-center font-display font-extrabold uppercase tracking-wide text-sm py-3 transition-all hover:-translate-y-0.5"
        style={{
          background: "transparent",
          color: borderColor,
          border: `2px solid ${borderColor}`,
        }}
        onMouseEnter={(e) => {
          const el = e.currentTarget as HTMLElement;
          el.style.background = borderColor === "#2a2a2a" ? "#E8743B" : borderColor;
          el.style.color = "#0d0d0d";
        }}
        onMouseLeave={(e) => {
          const el = e.currentTarget as HTMLElement;
          el.style.background = "transparent";
          el.style.color = borderColor;
        }}
      >
        {cta} →
      </a>
    </div>
  );
}

function Planes() {
  const mantenimiento = [
    "Hosting con HTTPS, siempre online",
    "Subdominio tulocal.getdishub.app incluido",
    "Cambios de contenido: todo lo que no puedas hacer vos desde la planilla",
    "Soporte por WhatsApp en horario hábil",
    "Corrección de errores sin costo",
    "Respaldo de la carta y la planilla",
    "Reposición del QR si algo cambia",
  ];
  return (
    <section id="planes" className="border-b border-[var(--color-border)]">
      <div className="mx-auto max-w-7xl px-6 py-24">
        <h2 className="reveal font-display text-3xl sm:text-5xl font-extrabold text-center text-[var(--color-text)] mb-3">
          PLANES <span className="text-(--color-text)">DIS</span><span className="text-(--color-accent)">Hub</span>
        </h2>
        <p className="reveal font-mono-tech text-xs uppercase tracking-widest text-[var(--color-muted)] text-center mb-16">
          // desarrollo en un solo pago · hosting opcional
        </p>
        <div className="grid sm:grid-cols-2 gap-8 max-w-4xl mx-auto">
          <PlanCard
            name="Carta Digital" deploy="AR$ 175.000" monthly="pago único · sin hosting"
            audience={["Cafés y bares", "Restaurantes", "Locales que ya reciben pedidos por otro lado"]}
            features={[
              [true,  "Carta digital con tu marca"],
              [true,  "Mobile-first, rápida y liviana"],
              [true,  "Planilla de Google para editar precios y platos"],
              [true,  "QR de la carta (archivo listo para imprimir)"],
              [true,  "Datos del local: Instagram, WiFi, horarios y cómo llegar"],
              [false, "Pedido por WhatsApp"],
              [false, "Especiales con vigencia automática"],
            ]}
            cta="Quiero la Carta Digital" plan="carta" borderColor="#2a2a2a"
          />
          <PlanCard
            name="Carta + Pedido" deploy="AR$ 225.000" monthly="pago único · sin hosting"
            audience={["Pizzerías y empanaderías", "Delivery y take away", "Locales con pedidos por WhatsApp"]}
            features={[
              [true, "Todo lo de Carta Digital"],
              [true, "Carrito: el cliente arma el pedido en la carta"],
              [true, "El pedido te llega ordenado por WhatsApp"],
              [true, "Especiales del día con vigencia automática"],
              [true, "Sin comisiones por venta"],
            ]}
            cta="Quiero Carta + Pedido" plan="carta_pedido" borderColor="#E8743B" shadowColor="#b85a2b" badge="Recomendado"
          />
        </div>

        <div id="hosting" className="mt-24">
          <h3 className="reveal font-display text-2xl sm:text-4xl font-extrabold text-center text-[var(--color-text)] mb-3">
            ¿DÓNDE VIVE TU CARTA?
          </h3>
          <p className="reveal font-sans text-[var(--color-muted)] text-center max-w-2xl mx-auto mb-12 leading-relaxed">
            Los precios de arriba son solo el desarrollo. El hosting lo elegís vos.
          </p>
          <div className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto">
            <div className="reveal p-8 flex flex-col" style={{ background: "var(--color-surface)", border: "2px solid #2a2a2a" }}>
              <div className="font-display text-xl font-extrabold uppercase text-[var(--color-text)] mb-2">En tu hosting y dominio</div>
              <p className="font-sans text-sm text-[var(--color-muted)] leading-relaxed mb-4">
                Si ya tenés dónde alojarla, te entregamos la carta lista para publicar. Sin cargo mensual con nosotros.
              </p>
              <div className="font-mono-tech text-xs uppercase tracking-widest text-[var(--color-muted)] mt-auto">Bienvenido, sin vueltas</div>
            </div>
            <div
              className="reveal p-8 flex flex-col"
              style={{ background: "var(--color-surface)", border: "2px solid #E8743B", boxShadow: "6px 6px 0 #b85a2b" }}
            >
              <div className="font-display text-xl font-extrabold uppercase text-[var(--color-text)] mb-1">Con nosotros</div>
              <div className="font-display text-3xl font-extrabold text-[var(--color-accent)] mb-1">AR$ 35.000 / mes</div>
              <div className="font-mono-tech text-xs text-[var(--color-muted)] mb-5">hosting + subdominio + mantenimiento</div>
              <ul className="space-y-3 mb-6">
                {mantenimiento.map((t) => (
                  <li key={t} className="flex items-start gap-3 text-sm">
                    <Check size={16} className="mt-0.5 shrink-0" color="#E8743B" strokeWidth={2.5} />
                    <span className="text-[var(--color-text)]">{t}</span>
                  </li>
                ))}
              </ul>
              <a
                href={waLink("plan_card", "hosting")}
                target="_blank"
                rel="noopener"
                onClick={() => {
                  track("plan_click", { plan: "hosting" });
                  track("whatsapp_click", { origen: "plan_card" });
                }}
                className="mt-auto block w-full text-center font-display font-extrabold uppercase tracking-wide text-sm py-3 transition-all hover:-translate-y-0.5"
                style={{ background: "transparent", color: "#E8743B", border: "2px solid #E8743B" }}
              >
                Quiero el hosting →
              </a>
            </div>
          </div>
        </div>

        <div className="reveal mt-10 font-mono-tech text-xs text-[var(--color-muted)] space-y-1 max-w-4xl mx-auto">
          <p>* El mantenimiento no incluye rediseños, secciones nuevas, fotografía gastronómica ni la impresión del QR; se cotizan aparte.</p>
          <p>* Si querés un dominio propio (.com.ar, .com) y lo gestionamos nosotros, su renovación se cobra aparte. Si usás tu propio dominio y hosting, corre por tu cuenta.</p>
        </div>
      </div>
    </section>
  );
}

/* ---------- a medida ---------- */
function AMedida() {
  const cases = [
    [MonitorSmartphone, "MENUBOARD DIGITAL", "Pantalla en salón con carta en tiempo real."],
    [Tablet, "KIOSCO DE AUTOPEDIDO", "Pantalla táctil para que el cliente pida solo."],
    [Link2, "INTEGRACIÓN CON POS", "Conectamos con tu sistema actual sin reemplazarlo."],
    [BarChart3, "ANALYTICS A MEDIDA", "Reportes y dashboards según tu negocio."],
  ] as const;
  return (
    <section className="border-b border-[var(--color-border)]">
      <div className="mx-auto max-w-7xl px-6 py-24">
        <h2 className="reveal font-display text-3xl sm:text-5xl font-extrabold text-[var(--color-text)] mb-5 max-w-3xl">
          ¿TENÉS UNA IDEA? <span className="text-[var(--color-accent)]">LA CONSTRUIMOS.</span>
        </h2>
        <p className="reveal font-sans text-lg text-[var(--color-muted)] max-w-3xl mb-14 leading-relaxed">
          No solo digitalizamos lo que existe: somos el partner tecnológico de tu negocio. Si necesitás un menuboard
          para tu salón, un kiosco de autopedido, integración con tu POS, o cualquier solución tech para tu negocio
          — lo diseñamos y lo construimos.
        </p>
        <div className="grid md:grid-cols-2 gap-6 mb-12">
          {cases.map(([Icon, t, d]) => (
            <div
              key={t}
              className="reveal p-6 transition-all duration-200"
              style={{ background: "var(--color-surface)", border: "2px dashed var(--color-border)" }}
              onMouseEnter={(e) => {
                const el = e.currentTarget as HTMLElement;
                el.style.border = "2px solid var(--color-accent)";
              }}
              onMouseLeave={(e) => {
                const el = e.currentTarget as HTMLElement;
                el.style.border = "2px dashed var(--color-border)";
              }}
            >
              <Icon size={28} color="#E8743B" strokeWidth={1.75} />
              <h3 className="font-display font-bold uppercase tracking-wide text-[var(--color-text)] mt-4 mb-2">{t}</h3>
              <p className="font-sans text-sm text-[var(--color-muted)] leading-relaxed">{d}</p>
            </div>
          ))}
        </div>
        <a
          href="#cta"
          className="reveal block w-full text-center font-display uppercase"
          style={{
            background: "#E8743B",
            color: "#0d0d0d",
            padding: "20px",
            fontSize: "18px",
            fontWeight: 800,
            letterSpacing: "0.5px",
            border: "none",
            boxShadow: "5px 5px 0 #b85a2b",
            transition: "transform 150ms, box-shadow 150ms",
          }}
          onMouseEnter={(e) => {
            const el = e.currentTarget as HTMLElement;
            el.style.transform = "translate(-2px, -2px)";
            el.style.boxShadow = "7px 7px 0 #b85a2b";
          }}
          onMouseLeave={(e) => {
            const el = e.currentTarget as HTMLElement;
            el.style.transform = "";
            el.style.boxShadow = "5px 5px 0 #b85a2b";
          }}
        >
          HABLEMOS DE TU PROYECTO →
        </a>
      </div>
    </section>
  );
}

/* ---------- para quién ---------- */
const audiencias = [
  {
    id: "bar", label: "Bar / café",
    body: "Una carta que cambia en el día (agotados, platos del día) sin reimprimir nada. QR en cada mesa y en la barra.",
    plan: "CARTA DIGITAL", stat: "Sin imprimir menús",
  },
  {
    id: "pizza", label: "Pizzería / delivery",
    body: "Tu cliente arma el pedido en la carta y te llega ordenado por WhatsApp. Sin comisiones por venta.",
    plan: "CARTA + PEDIDO", stat: "0% de comisiones",
  },
  {
    id: "resto", label: "Restaurante",
    body: "Una carta cuidada con tu marca y QR en las mesas. La mantenés vos desde una planilla de Google.",
    plan: "CARTA DIGITAL", stat: "Sin panel ni contraseñas",
  },
];

function ParaQuien() {
  const [active, setActive] = useState(audiencias[0].id);
  const cur = audiencias.find((a) => a.id === active)!;
  return (
    <section className="border-b border-[var(--color-border)]">
      <div className="mx-auto max-w-7xl px-6 py-24">
        <h2 className="reveal font-display text-3xl sm:text-5xl font-extrabold text-center text-[var(--color-text)] mb-12">
          ¿PARA QUIÉN ES DIS<span className="text-(--color-accent)">Hub</span>?
        </h2>
        <div className="reveal flex flex-wrap justify-center gap-3 mb-12">
          {audiencias.map((a) => (
            <button
              key={a.id}
              onClick={() => setActive(a.id)}
              className="font-mono-tech text-xs uppercase tracking-widest px-4 py-2 transition-all"
              style={{
                background: active === a.id ? "var(--color-accent)" : "transparent",
                color: active === a.id ? "var(--color-bg)" : "var(--color-text)",
                border: active === a.id ? "2px solid var(--color-accent)" : "2px solid var(--color-border)",
              }}
            >
              {a.label}
            </button>
          ))}
        </div>
        <div
          key={cur.id}
          className="max-w-3xl mx-auto p-8"
          style={{
            background: "var(--color-surface)",
            border: "2px solid var(--color-border)",
            borderLeft: "4px solid var(--color-accent)",
            animation: "reveal-up 0.4s ease-out",
          }}
        >
          <p className="font-sans text-lg text-[var(--color-text)] leading-relaxed mb-6">{cur.body}</p>
          <div className="flex flex-wrap items-center gap-4 pt-4 border-t border-[var(--color-border)]">
            <div className="font-mono-tech text-xs uppercase tracking-widest text-[var(--color-muted)]">
              Recomendado: <span className="text-[var(--color-accent)]">{cur.plan}</span>
            </div>
            <div className="font-mono-tech text-xs uppercase tracking-widest text-[var(--color-muted)] flex items-center gap-2">
              <Star size={12} color="#E8743B" /> {cur.stat}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

/* ---------- CTA final ---------- */
function CTAFinal() {
  return (
    <section id="cta" style={{ background: "var(--color-accent)" }}>
      <div className="mx-auto max-w-7xl px-6 py-24">
        <h2 className="reveal font-display font-extrabold leading-[0.95] text-[var(--color-bg)] text-[40px] sm:text-6xl lg:text-[64px] mb-10">
          TU RESTAURANTE<br />
          MERECE MÁS<br />
          QUE UN LINK DE<br />
          INSTAGRAM.
        </h2>
        <div className="reveal flex flex-wrap gap-4">
          <BrutalBtn variant="dark" href="#planes" onClick={() => track("cta_final")}>Empezar ahora <ArrowRight size={16} /></BrutalBtn>
          <a
            href="/agendar"
            className="inline-flex items-center justify-center gap-2 font-display font-extrabold uppercase tracking-wide px-6 py-3 text-sm transition-all hover:-translate-x-0.5 hover:-translate-y-0.5"
            style={{
              background: "transparent",
              color: "var(--color-bg)",
              border: "2px solid var(--color-bg)",
            }}
          >
            Agendar demo
          </a>
          <a
            href={waLink("cta_final")}
            target="_blank"
            rel="noopener"
            onClick={() => track("whatsapp_click", { origen: "cta_final" })}
            className="inline-flex items-center justify-center gap-2 font-display font-extrabold uppercase tracking-wide px-6 py-3 text-sm transition-all hover:-translate-x-0.5 hover:-translate-y-0.5"
            style={{
              background: "transparent",
              color: "var(--color-bg)",
              border: "2px solid var(--color-bg)",
            }}
          >
            Hablemos por WhatsApp <ArrowRight size={16} />
          </a>
        </div>
        <a
          href="mailto:hola@getdishub.app"
          onClick={() => track("email_click", { origen: "cta_final" })}
          className="reveal inline-block font-mono-tech text-xs uppercase tracking-widest mt-6"
          style={{ color: "var(--color-bg)", opacity: 0.75 }}
        >
          o escribinos a hola@getdishub.app →
        </a>
      </div>
    </section>
  );
}


/* ---------- page ---------- */
function Index() {
  useReveal();
  const [ready, setReady] = useState(false);

  return (
    <div className="min-h-screen bg-[var(--color-bg)] text-[var(--color-text)]">
      {!ready && <Preloader onDone={() => setReady(true)} />}
      <Nav />
      <Hero />
      <Hub />
      <CartasHechas />
      <PainSection />
      <Como />
      <Planes />
      {/* CasosReales: sacada temporalmente, faltan terminar los casos y reordenar la sección */}
      <ParaQuien />
      <FaqHome />
      <CTAFinal />
      <Footer />
      <WhatsAppFloatButton />
    </div>
  );
}
