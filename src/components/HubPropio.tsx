import { useState } from "react";
import { ArrowRight, Check, X, MapPin, MessageCircle, UtensilsCrossed, CalendarDays, Star, Package } from "lucide-react";
import { BrutalBtn } from "@/components/site";

/* Link en bio propio de DISHub: mockup de celular + comparación contra un link genérico.
   Estado: en desarrollo (no mostrarlo como disponible hasta que exista). */

type Icono = typeof UtensilsCrossed;
type Marca = {
  id: string;
  layout: "grilla" | "centrado" | "editorial" | "cartel" | "pedir" | "ticket";
  arte?: string;
  nombre: string;
  tipo: string;
  host: string;
  /* paleta */
  bg: string; panel: string; line: string; ink: string; soft: string; accent: string; onAccent: string;
  /* tipografía de títulos */
  display: string;
  displayWeight?: number;
  /* logo */
  logo: { src: string; w: number; h: number; radius?: number } | { text: string; size: number };
  tagline: [string, string];
  saludo: [string, string];
  links: Array<[Icono, string, string]>;
};

/* Marcas de ejemplo: las cartas de ejemplo que ya muestra el sitio, más Ardente (paleta tomada de https://ardentemenu.netlify.app/). */
const BEBAS = "'Bebas Neue', var(--font-display)";
const ANTON = "'Anton', 'Bebas Neue', var(--font-display)";

const MARCAS: Marca[] = [
  {
    id: "ardente", layout: "grilla", nombre: "Ardente", tipo: "Pizzería", host: "ardente.getdishub.app",
    bg: "#0d0a09", panel: "#161110", line: "#2b1f1b", ink: "#f4ece6", soft: "#b3a097", accent: "#f26b21", onAccent: "#160a04",
    display: BEBAS,
    logo: { src: "/ejemplos/ardente/logo.jpeg", w: 52, h: 52, radius: 12 },
    tagline: ["LA #PIZZA #VERACE", "DA ASPORTO O DELIVERY"],
    saludo: ["Bienvenido,", "arrancamos"],
    links: [[UtensilsCrossed, "Carta", "Todas las pizzas"], [MessageCircle, "Pedir", "Por WhatsApp"], [CalendarDays, "Reservas", "Guardá tu mesa"], [Star, "Reseña", "Contanos qué tal"]],
  },
  {
    id: "olazabal", layout: "centrado", arte: "/ejemplos/olazabal/assets/hombre-cafe-crema.svg", nombre: "Olazábal", tipo: "Café", host: "olazabal.getdishub.app",
    bg: "#440C1C", panel: "#601225", line: "#7a2438", ink: "#F2F1D6", soft: "#cdb9a8", accent: "#F2F1D6", onAccent: "#440C1C",
    display: BEBAS,
    logo: { src: "/ejemplos/olazabal/assets/logo-crema.svg", w: 104, h: 52 },
    tagline: ["CAFÉ", "BUENOS AIRES"],
    saludo: ["Buen día,", "un cafecito"],
    links: [[UtensilsCrossed, "Carta", "Café y pastelería"], [MessageCircle, "Pedir", "Por WhatsApp"], [CalendarDays, "Reservas", "Guardá tu mesa"], [Star, "Reseña", "Contanos qué tal"]],
  },
  {
    id: "pesto", layout: "editorial", nombre: "PESTO", tipo: "Empanadas y pizzas", host: "pesto.getdishub.app",
    bg: "#F2EEE5", panel: "#EAE5D9", line: "rgba(23,20,15,.14)", ink: "#17140F", soft: "rgba(23,20,15,.62)", accent: "#44573B", onAccent: "#F2EEE5",
    display: "'Playfair Display', serif", displayWeight: 900,
    logo: { text: "PESTO", size: 34 },
    tagline: ["EMPANADAS ARTESANALES", "Y PIZZAS NAPOLITANAS"],
    saludo: ["Hola,", "qué pedimos"],
    links: [[UtensilsCrossed, "Carta", "Empanadas y pizzas"], [MessageCircle, "Pedir", "Por WhatsApp"], [MapPin, "Retirá", "Cómo llegar"], [Star, "Reseña", "Contanos qué tal"]],
  },
  {
    id: "lugo", layout: "cartel", arte: "/ejemplos/lugo/assets/abuela-crema.svg", nombre: "LUGO", tipo: "Panadería y repostería", host: "lugo.getdishub.app",
    bg: "#F4E9CE", panel: "#EADDB9", line: "rgba(27,46,107,.18)", ink: "#1B2E6B", soft: "rgba(27,46,107,.7)", accent: "#CC1717", onAccent: "#F4E9CE",
    display: ANTON,
    logo: { text: "LUGO", size: 36 },
    tagline: ["PANADERÍA Y REPOSTERÍA", "LISTOS PARA HORNEAR"],
    saludo: ["Hola,", "qué horneamos"],
    links: [[UtensilsCrossed, "Carta", "Listos para hornear"], [MessageCircle, "Pedir", "Por WhatsApp"], [Package, "Mayorista", "Precios por mayor"], [Star, "Reseña", "Contanos qué tal"]],
  },
  {
    id: "ronnin", layout: "pedir", nombre: "Ronnin Pizza", tipo: "Pizzería", host: "ronnin.getdishub.app",
    bg: "#0c0a09", panel: "#171310", line: "#2c2520", ink: "#f5efe6", soft: "#a39c8e", accent: "#fe4e03", onAccent: "#0c0a09",
    display: ANTON,
    logo: { text: "RONNIN", size: 34 },
    tagline: ["PIZZA PARA PEDIR", "POR WHATSAPP"],
    saludo: ["Qué pizza,", "va hoy"],
    links: [[UtensilsCrossed, "Carta", "Todas las pizzas"], [MessageCircle, "Pedir", "Por WhatsApp"], [CalendarDays, "Reservas", "Guardá tu mesa"], [Star, "Reseña", "Contanos qué tal"]],
  },
  {
    id: "bastards", layout: "ticket", nombre: "bastard´s", tipo: "Hamburguesería", host: "bastards.getdishub.app",
    arte: "/ejemplos/bastards/img/w/logo.webp",
    bg: "#16100d", panel: "#221915", line: "rgb(246 234 210 / 0.22)", ink: "#f6ead2", soft: "#cdbd9f", accent: "#e4472b", onAccent: "#f6ead2",
    display: ANTON,
    logo: { text: "BASTARD´S", size: 30 },
    tagline: ["BEST BURGER", "IN TOWN"],
    saludo: ["Pedí la", "burga"],
    links: [[UtensilsCrossed, "Carta", "Burgas, papas y birras"], [MessageCircle, "Pedir", "Delivery desde las 19"], [MapPin, "Zona", "Dónde llegamos"], [Star, "Reseña", "Contanos qué tal"]],
  },
];

const COMPARACION: Array<[string, string, string]> = [
  ["Carta", "Un link a un PDF o a otra web", "Tu carta viva, editable desde una planilla"],
  ["Pedido", "Un botón de WhatsApp vacío", "Pedido armado, te llega ordenado"],
  ["Horarios", "Texto que nadie actualiza", "Muestra si estás abierto ahora"],
  ["Reservas y fidelización", "No existen", "Módulos que se suman al mismo link"],
  ["Tu marca", "Diseño y logo de otro", "Tus colores, tu logo, tu subdominio"],
  ["Hecho para", "Cualquier rubro", "Locales gastronómicos"],
];

type Hd = (size: number, extra?: React.CSSProperties) => React.CSSProperties;

function Estado({ m, mono }: { m: Marca; mono?: boolean }) {
  return (
    <div
      className={`inline-flex items-center gap-2 px-3 py-1 text-[11px] font-semibold ${mono ? "font-mono-tech uppercase tracking-wider" : "font-sans"}`}
      style={{ background: m.panel, border: `1px solid ${m.line}`, borderRadius: 999 }}
    >
      <span style={{ width: 7, height: 7, borderRadius: 999, background: m.accent, boxShadow: `0 0 8px ${m.accent}` }} />
      Abierto · 12:00
    </div>
  );
}

function Pie({ m }: { m: Marca }) {
  return (
    <>
      <p className="mt-4 text-center font-mono-tech text-[10px] tracking-widest" style={{ color: m.soft }}>{m.host}</p>
      <div className="mx-auto mt-3 h-[4px] w-24" style={{ background: m.ink, borderRadius: 999, opacity: 0.7 }} />
    </>
  );
}

/* Cada marca tiene su propia composición, no solo sus colores. */
function Pantalla({ m, hd }: { m: Marca; hd: Hd }) {
  const A = m;
  const pedir = m.links.find((l) => l[1] === "Pedir") ?? m.links[0];
  const resto = m.links.filter((l) => l !== pedir);

  /* TICKET (bastard´s): promo + comanda de renglones, tipografía de máquina de escribir */
  if (m.layout === "ticket") {
    const typed = "'Special Elite', 'Courier New', monospace";
    return (
      <div className="px-4 pb-6 pt-12" style={{ background: A.bg, color: A.ink }}>
        <div className="flex items-center gap-3">
          {m.arte && <img src={m.arte} alt="" style={{ height: 54, width: 54, borderRadius: 999 }} />}
          <div>
            <p style={hd(26, { color: A.ink, letterSpacing: "0.02em" })}>{"text" in m.logo ? m.logo.text : ""}</p>
            <p className="font-mono-tech text-[9px] uppercase tracking-[0.2em]" style={{ color: A.soft }}>{m.tagline[0]} {m.tagline[1]}</p>
          </div>
        </div>
        <div className="mt-4 flex items-center gap-3 px-3 py-2" style={{ background: "#f2bb3b", color: "#16100d", borderRadius: 4 }}>
          <span style={hd(34, { lineHeight: 0.9 })}>2×1</span>
          <span className="font-sans text-[10px] font-bold uppercase leading-tight">Miércoles y jueves<br />Happy hour 19 a 20:30</span>
        </div>
        <p className="mt-4" style={hd(30, { textTransform: "uppercase", lineHeight: 0.95 })}>
          {m.saludo[0]} <span style={{ color: A.accent }}>{m.saludo[1]}</span>.
        </p>
        <div className="mt-3 px-3 py-2" style={{ background: "#f6ead2", color: "#16100d", fontFamily: typed, borderRadius: 3 }}>
          <div className="flex items-center justify-between text-[10px] uppercase tracking-wider" style={{ borderBottom: "1px dashed #16100d", paddingBottom: 4 }}>
            <span>Comanda</span><span>N.º 0001</span>
          </div>
          {m.links.map(([Icon, label, sub], i) => (
            <div key={label} className="flex items-center gap-2 py-2" style={{ borderBottom: i < m.links.length - 1 ? "1px dashed rgba(22,16,13,.35)" : "none" }}>
              <span className="text-[11px]">{String(i + 1).padStart(2, "0")}</span>
              <div className="flex-1">
                <p className="text-[13px] font-bold uppercase leading-none">{label}</p>
                <p className="text-[10px] opacity-70">{sub}</p>
              </div>
              <Icon size={15} />
            </div>
          ))}
        </div>
        <div className="mt-3 text-center font-sans text-[11px] font-bold uppercase tracking-wider px-3 py-2.5" style={{ background: A.accent, color: A.onAccent, borderRadius: 4 }}>
          Armar mi pedido
        </div>
        <Pie m={m} />
      </div>
    );
  }

  /* PEDIR PRIMERO (Ronnin): una sola acción gigante */
  if (m.layout === "pedir") {
    const [PIcon] = pedir;
    return (
      <div className="px-4 pb-6 pt-12" style={{ background: A.bg, color: A.ink }}>
        <div className="flex items-center justify-between">
          <span style={hd(30, { color: A.accent, letterSpacing: "0.03em" })}>{m.logo && "text" in m.logo ? m.logo.text : ""}</span>
          <Estado m={m} />
        </div>
        <div className="mt-5 px-4 py-5" style={{ background: A.accent, color: A.onAccent, borderRadius: 4 }}>
          <PIcon size={22} />
          <p className="mt-6" style={hd(66, { textTransform: "uppercase", lineHeight: 0.9 })}>{pedir[1]}</p>
          <div className="mt-2 flex items-center justify-between font-sans text-xs font-bold uppercase tracking-wide">
            {pedir[2]} <ArrowRight size={16} />
          </div>
        </div>
        <p className="mt-4" style={hd(22, { textTransform: "uppercase", color: A.soft })}>{m.saludo[0]} {m.saludo[1]}</p>
        <div className="mt-3 grid grid-cols-3 gap-2">
          {resto.map(([Icon, label]) => (
            <div key={label} className="flex flex-col items-center gap-1.5 py-3" style={{ border: `1px solid ${A.line}`, background: A.panel, borderRadius: 4 }}>
              <Icon size={16} style={{ color: A.accent }} />
              <span className="font-sans text-[11px] font-semibold">{label}</span>
            </div>
          ))}
        </div>
        <div className="mt-2 flex items-center gap-2 px-3 py-2.5 font-sans text-xs font-semibold" style={{ border: `1px solid ${A.line}`, borderRadius: 4 }}>
          <MapPin size={14} style={{ color: A.accent }} /> Encontranos · Cómo llegar
        </div>
        <Pie m={m} />
      </div>
    );
  }

  /* CARTEL (LUGO): bloque de color a sangre + botones tipo sticker */
  if (m.layout === "cartel") {
    return (
      <div style={{ background: A.bg, color: A.ink }}>
        <div className="relative px-4 pb-5 pt-12" style={{ background: A.accent, color: A.onAccent }}>
          <span style={hd(58, { lineHeight: 0.85, letterSpacing: "0.01em" })}>{"text" in m.logo ? m.logo.text : ""}</span>
          <p className="mt-3 font-sans text-[10px] font-bold uppercase leading-snug tracking-wider" style={{ maxWidth: "55%" }}>
            {m.tagline[0]}<br />{m.tagline[1]}
          </p>
          {m.arte && <img src={m.arte} alt="" className="absolute bottom-0 right-3" style={{ height: 118, width: "auto" }} />}
        </div>
        <div className="px-4 pb-6 pt-4">
          <p style={hd(24, { textTransform: "uppercase" })}>{m.saludo[0]} ¿{m.saludo[1]}?</p>
          <div className="mt-3 space-y-2.5">
            {m.links.map(([Icon, label, sub], i) => (
              <div
                key={label}
                className="flex items-center gap-3 px-3 py-2.5"
                style={{
                  background: i === 0 ? A.accent : A.panel,
                  color: i === 0 ? A.onAccent : A.ink,
                  border: `2px solid ${A.ink}`,
                  boxShadow: `3px 3px 0 ${A.ink}`,
                  borderRadius: 6,
                }}
              >
                <Icon size={18} />
                <div className="flex-1">
                  <p style={hd(18, { textTransform: "uppercase" })}>{label}</p>
                  <p className="font-sans text-[10px] font-semibold" style={{ opacity: 0.8 }}>{sub}</p>
                </div>
                <ArrowRight size={14} />
              </div>
            ))}
          </div>
          <Pie m={m} />
        </div>
      </div>
    );
  }

  /* EDITORIAL (PESTO): tipografía grande y renglones, sin cajas */
  if (m.layout === "editorial") {
    return (
      <div className="px-5 pb-6 pt-12" style={{ background: A.bg, color: A.ink }}>
        <div className="flex items-center justify-between font-mono-tech text-[10px] uppercase tracking-widest" style={{ color: A.soft }}>
          <span className="flex items-center gap-1.5"><span style={{ width: 6, height: 6, borderRadius: 99, background: A.accent }} /> Abierto · 12:00</span>
          <span>Carta</span>
        </div>
        <p className="mt-6" style={hd(64, { lineHeight: 0.85, letterSpacing: "-0.02em" })}>{"text" in m.logo ? m.logo.text : ""}</p>
        <p className="mt-3 font-mono-tech text-[10px] uppercase leading-relaxed tracking-widest" style={{ color: A.soft }}>
          {m.tagline[0]}<br />{m.tagline[1]}
        </p>
        <p className="mt-6" style={hd(20, { fontWeight: 400, fontStyle: "italic" })}>{m.saludo[0]} ¿{m.saludo[1]}?</p>
        <div className="mt-3" style={{ borderTop: `1px solid ${A.ink}` }}>
          {m.links.map(([Icon, label, sub], i) => (
            <div
              key={label}
              className="flex items-center justify-between px-1 py-3"
              style={{ borderBottom: `1px solid ${A.line}`, background: i === 0 ? A.accent : "transparent", color: i === 0 ? A.onAccent : A.ink, ...(i === 0 ? { paddingLeft: 10, paddingRight: 10 } : {}) }}
            >
              <div>
                <p style={hd(22, { fontWeight: 700 })}>{label}</p>
                <p className="font-mono-tech text-[10px] uppercase tracking-wider" style={{ opacity: 0.7 }}>{sub}</p>
              </div>
              <Icon size={16} />
            </div>
          ))}
        </div>
        <Pie m={m} />
      </div>
    );
  }

  /* CENTRADO (Olazábal): ilustración, logo y botones tipo píldora */
  if (m.layout === "centrado") {
    return (
      <div className="px-5 pb-6 pt-12 text-center" style={{ background: A.bg, color: A.ink }}>
        {m.arte && <img src={m.arte} alt="" className="mx-auto" style={{ height: 96, width: "auto" }} />}
        {"src" in m.logo && <img src={m.logo.src} alt="" className="mx-auto mt-1" style={{ height: m.logo.h, width: "auto" }} />}
        <p className="mt-1 font-mono-tech text-[10px] uppercase tracking-[0.25em]" style={{ color: A.soft }}>{m.tagline[0]} · {m.tagline[1]}</p>
        <div className="mt-3"><Estado m={m} mono /></div>
        <div className="mt-4 space-y-2">
          {m.links.map(([Icon, label, sub], i) => (
            <div
              key={label}
              className="flex items-center gap-3 px-4 py-2.5 text-left"
              style={{
                borderRadius: 999,
                background: i === 0 ? A.accent : "transparent",
                color: i === 0 ? A.onAccent : A.ink,
                border: `1px solid ${i === 0 ? A.accent : A.line}`,
              }}
            >
              <Icon size={16} />
              <span className="flex-1 leading-tight">
                <span className="block font-sans text-[13px] font-semibold">{label}</span>
                <span className="block font-sans text-[10px] opacity-70">{sub}</span>
              </span>
              <ArrowRight size={13} />
            </div>
          ))}
        </div>
        <Pie m={m} />
      </div>
    );
  }

  /* GRILLA (Ardente): mosaico 2x2 */
  return (
    <div className="px-4 pb-6 pt-12" style={{ background: A.bg, color: A.ink }}>
      <div className="flex items-center justify-between" style={{ minHeight: 52 }}>
        {"src" in m.logo && <img src={m.logo.src} alt="" width={m.logo.w} height={m.logo.h} style={{ borderRadius: m.logo.radius ?? 0, height: m.logo.h, width: "auto" }} />}
        <div className="text-right" style={{ fontFamily: BEBAS, fontSize: 13, letterSpacing: "0.06em", lineHeight: 1.2, color: A.soft }}>
          {m.tagline[0]}<br />{m.tagline[1]}
        </div>
      </div>
      <div className="mt-4"><Estado m={m} /></div>
      <p className="mt-4" style={hd(34, { lineHeight: 0.95, textTransform: "uppercase" })}>
        {m.saludo[0]}<br />¿<span style={{ color: A.accent }}>{m.saludo[1]}</span>?
      </p>
      <div className="mt-4 grid grid-cols-2 gap-2.5">
        {m.links.map(([Icon, label, sub], i) => (
          <div
            key={label}
            className="px-3 py-3"
            style={i === 0 ? { background: A.accent, color: A.onAccent, borderRadius: 14 } : { background: A.panel, color: A.ink, border: `1px solid ${A.line}`, borderRadius: 14 }}
          >
            <Icon size={16} />
            <p className="mt-2" style={hd(20, { textTransform: "uppercase" })}>{label}</p>
            <p className="font-sans text-[11px]" style={{ opacity: i === 0 ? 0.8 : 1, color: i === 0 ? A.onAccent : A.soft }}>{sub}</p>
          </div>
        ))}
      </div>
      <div className="mt-2.5 flex items-center gap-2 px-3 py-2.5 font-sans text-xs font-semibold" style={{ background: A.panel, border: `1px solid ${A.line}`, borderRadius: 14 }}>
        <MapPin size={14} style={{ color: A.accent }} /> Encontranos · Cómo llegar
      </div>
      <Pie m={m} />
    </div>
  );
}

function PhoneMock({ m }: { m: Marca }) {
  const A = m;
  const hd = (size: number, extra: React.CSSProperties = {}): React.CSSProperties => ({
    fontFamily: m.display, fontWeight: m.displayWeight ?? 400, fontSize: size, lineHeight: 1, ...extra,
  });
  return (
    <div aria-hidden="true" className="relative mx-auto w-[300px] shrink-0">
      {/* botones laterales */}
      <span className="absolute -left-[3px] top-24 h-8 w-[3px] rounded-l" style={{ background: "#2a2a2a" }} />
      <span className="absolute -left-[3px] top-36 h-14 w-[3px] rounded-l" style={{ background: "#2a2a2a" }} />
      <span className="absolute -left-[3px] top-52 h-14 w-[3px] rounded-l" style={{ background: "#2a2a2a" }} />
      <span className="absolute -right-[3px] top-40 h-20 w-[3px] rounded-r" style={{ background: "#2a2a2a" }} />
      <div
        className="p-[10px]"
        style={{
          background: "#111",
          border: "2px solid #333",
          borderRadius: 46,
          boxShadow: "0 0 0 1px #000, 10px 12px 0 var(--color-accent-shadow), 0 30px 60px rgba(0,0,0,0.6)",
        }}
      >
        <div className="relative overflow-hidden" style={{ borderRadius: 36 }}>
          {/* barra de estado + isla */}
          <div className="absolute inset-x-0 top-0 z-10 flex items-center justify-between px-6 pt-3 font-sans text-[11px] font-semibold" style={{ color: m.layout === "cartel" ? A.onAccent : A.ink }}>
            <span>12:00</span>
            <span className="flex items-center gap-1">
              <span style={{ width: 14, height: 8, borderRadius: 2, border: `1px solid ${m.layout === "cartel" ? A.onAccent : A.ink}` }} />
            </span>
          </div>
          <div className="absolute left-1/2 top-2 z-20 h-[22px] w-[84px] -translate-x-1/2" style={{ background: "#000", borderRadius: 999 }} />
          <Pantalla m={m} hd={hd} />
        </div>
      </div>
    </div>
  );
}

function PhoneConEjemplos() {
  const [i, setI] = useState(0);
  const m = MARCAS[i];
  return (
    <div>
      <PhoneMock m={m} />
      <p className="mt-8 text-center font-mono-tech text-[11px] uppercase tracking-widest text-[var(--color-muted)]">
        Ejemplo: {m.nombre} · {m.tipo}
      </p>
      <div role="tablist" aria-label="Ejemplos de link en bio" className="mt-3 flex flex-wrap justify-center gap-2">
        {MARCAS.map((x, k) => (
          <button
            key={x.id}
            type="button"
            role="tab"
            aria-selected={k === i}
            onClick={() => setI(k)}
            className="px-3 py-1.5 font-mono-tech text-[11px] uppercase tracking-wider transition-colors"
            style={
              k === i
                ? { background: "var(--color-accent)", color: "var(--color-bg)", border: "1px solid var(--color-accent)" }
                : { border: "1px solid var(--color-border)", color: "var(--color-text)" }
            }
          >
            {x.nombre}
          </button>
        ))}
      </div>
    </div>
  );
}

/* Resumen para la home: lleva a la página /hub */
export function HubPropioResumen() {
  return (
    <section id="link-en-bio" className="border-b border-[var(--color-border)]">
      <div className="mx-auto flex max-w-7xl flex-col items-start gap-6 px-6 py-16 md:flex-row md:items-center md:justify-between">
        <div className="reveal max-w-3xl">
          <span
            className="mb-4 inline-block px-2 py-1 font-mono-tech text-[11px] uppercase tracking-widest"
            style={{ border: "1px solid var(--color-accent)", color: "var(--color-accent)" }}
          >
            En desarrollo
          </span>
          <h2 className="font-display text-2xl font-extrabold text-[var(--color-text)] sm:text-4xl">
            TU LINK EN BIO. PERO DE VERDAD TUYO.
          </h2>
          <p className="mt-3 font-sans text-base leading-relaxed text-[var(--color-muted)]">
            Un solo link para Instagram y WhatsApp con tu carta, pedido, reservas y fidelización. Hecho para gastronomía, no
            para cualquier rubro.
          </p>
        </div>
        <div className="reveal shrink-0">
          <BrutalBtn variant="secondary" href="/hub">
            Ver el link en bio <ArrowRight size={16} />
          </BrutalBtn>
        </div>
      </div>
    </section>
  );
}

export function HubPropio() {
  return (
    <section id="link-en-bio" className="border-b border-[var(--color-border)]">
      <div className="mx-auto max-w-7xl px-6 py-24">
        <div className="grid items-center gap-14 lg:grid-cols-5">
          <div className="reveal lg:col-span-3">
            <span
              className="mb-5 inline-block px-2 py-1 font-mono-tech text-[11px] uppercase tracking-widest"
              style={{ border: "1px solid var(--color-accent)", color: "var(--color-accent)" }}
            >
              En desarrollo
            </span>
            <h2 className="font-display text-3xl font-extrabold text-[var(--color-text)] sm:text-5xl">
              TU LINK EN BIO. PERO DE VERDAD TUYO.
            </h2>
            <p className="mt-5 max-w-2xl font-sans text-lg leading-relaxed text-[var(--color-muted)]">
              Los links en bio genéricos sirven para cualquiera, y por eso no resuelven nada de tu local. El de DISHub está hecho
              para gastronomía: un solo link para Instagram y WhatsApp que lleva a tu carta, al pedido, a la reserva y a la
              tarjeta de fidelización, con tu marca y siempre al día.
            </p>
            <div className="mt-8">
              <BrutalBtn variant="primary" href="#planes">
                Ver planes <ArrowRight size={16} />
              </BrutalBtn>
            </div>
          </div>
          <div className="reveal lg:col-span-2">
            <PhoneConEjemplos />
          </div>
        </div>

        <div className="reveal mt-20 overflow-x-auto">
          <div className="min-w-[640px]" style={{ border: "2px solid var(--color-border)", background: "var(--color-surface)" }}>
            <div className="grid grid-cols-3 font-mono-tech text-xs uppercase tracking-widest">
              <div className="p-4 text-[var(--color-muted)]" />
              <div className="p-4 text-[var(--color-muted)]" style={{ borderLeft: "1px solid var(--color-border)" }}>
                Link en bio genérico
              </div>
              <div
                className="p-4 font-bold"
                style={{ background: "var(--color-accent)", color: "var(--color-bg)" }}
              >
                DISHub
              </div>
            </div>
            {COMPARACION.map(([fila, generico, dish]) => (
              <div key={fila} className="grid grid-cols-3 font-sans text-sm" style={{ borderTop: "1px solid var(--color-border)" }}>
                <div className="p-4 font-display font-bold uppercase tracking-wide text-[var(--color-text)]">{fila}</div>
                <div className="flex items-start gap-2 p-4 text-[var(--color-muted)]" style={{ borderLeft: "1px solid var(--color-border)" }}>
                  <X size={16} className="mt-0.5 shrink-0" />
                  {generico}
                </div>
                <div className="flex items-start gap-2 p-4 text-[var(--color-text)]">
                  <Check size={16} className="mt-0.5 shrink-0 text-[var(--color-accent)]" />
                  {dish}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
