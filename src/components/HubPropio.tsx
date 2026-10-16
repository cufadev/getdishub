import { ArrowRight, Check, X, MapPin, MessageCircle, UtensilsCrossed, CalendarDays, Star } from "lucide-react";
import { BrutalBtn } from "@/components/site";

/* Link en bio propio de DISHub: mockup de celular + comparación contra un link genérico.
   Estado: en desarrollo (no mostrarlo como disponible hasta que exista). */

const MOCK_LINKS: Array<[typeof UtensilsCrossed, string, string, boolean]> = [
  [UtensilsCrossed, "Carta", "Todas las pizzas", true],
  [MessageCircle, "Pedir", "Por WhatsApp", false],
  [CalendarDays, "Reservas", "Guardá tu mesa", false],
  [Star, "Reseña", "Contanos qué tal", false],
];

/* Marca de ejemplo: Ardente (paleta tomada de https://ardentemenu.netlify.app/) */
const ARDENTE = {
  fire: "#f26b21",
  bg: "#0d0a09",
  panel: "#161110",
  line: "#2b1f1b",
  ink: "#f4ece6",
  soft: "#b3a097",
  onFire: "#160a04",
};

const COMPARACION: Array<[string, string, string]> = [
  ["Carta", "Un link a un PDF o a otra web", "Tu carta viva, editable desde una planilla"],
  ["Pedido", "Un botón de WhatsApp vacío", "Pedido armado, te llega ordenado"],
  ["Horarios", "Texto que nadie actualiza", "Muestra si estás abierto ahora"],
  ["Reservas y fidelización", "No existen", "Módulos que se suman al mismo link"],
  ["Tu marca", "Diseño y logo de otro", "Tus colores, tu logo, tu subdominio"],
  ["Hecho para", "Cualquier rubro", "Locales gastronómicos"],
];

function PhoneMock() {
  const A = ARDENTE;
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
          <div className="absolute inset-x-0 top-0 z-10 flex items-center justify-between px-6 pt-3 font-sans text-[11px] font-semibold" style={{ color: A.ink }}>
            <span>12:00</span>
            <span className="flex items-center gap-1">
              <span style={{ width: 14, height: 8, borderRadius: 2, border: `1px solid ${A.ink}` }} />
            </span>
          </div>
          <div className="absolute left-1/2 top-2 z-20 h-[22px] w-[84px] -translate-x-1/2" style={{ background: "#000", borderRadius: 999 }} />
      <div className="px-4 pb-6 pt-12" style={{ background: A.bg, color: A.ink }}>
        <div className="flex items-center justify-between">
          <img src="/ejemplos/ardente/logo.jpeg" alt="" width={52} height={52} style={{ borderRadius: 12 }} />
          <div className="text-right" style={{ fontFamily: "'Bebas Neue', var(--font-display)", fontSize: 13, letterSpacing: "0.06em", lineHeight: 1.2, color: A.soft }}>
            LA #PIZZA #VERACE
            <br />
            DA ASPORTO O DELIVERY
          </div>
        </div>
        <div
          className="mt-4 inline-flex items-center gap-2 px-3 py-1 font-sans text-[11px] font-semibold"
          style={{ background: A.panel, border: `1px solid ${A.line}`, borderRadius: 999 }}
        >
          <span style={{ width: 7, height: 7, borderRadius: 999, background: A.fire, boxShadow: `0 0 8px ${A.fire}` }} />
          Abierto · 12:00
        </div>
        <p className="mt-4" style={{ fontFamily: "'Bebas Neue', var(--font-display)", fontSize: 34, lineHeight: 0.95 }}>
          Bienvenido,
          <br />
          ¿<span style={{ color: A.fire }}>arrancamos</span>?
        </p>
        <div className="mt-4 grid grid-cols-2 gap-2.5">
          {MOCK_LINKS.map(([Icon, label, sub, primary]) => (
            <div
              key={label}
              className="px-3 py-3"
              style={
                primary
                  ? { background: A.fire, color: A.onFire, borderRadius: 14 }
                  : { background: A.panel, color: A.ink, border: `1px solid ${A.line}`, borderRadius: 14 }
              }
            >
              <Icon size={16} />
              <p className="mt-2" style={{ fontFamily: "'Bebas Neue', var(--font-display)", fontSize: 20, lineHeight: 1 }}>{label}</p>
              <p className="font-sans text-[11px]" style={{ opacity: primary ? 0.75 : 1, color: primary ? A.onFire : A.soft }}>{sub}</p>
            </div>
          ))}
        </div>
        <div
          className="mt-2.5 flex items-center gap-2 px-3 py-2.5 font-sans text-xs font-semibold"
          style={{ background: A.panel, border: `1px solid ${A.line}`, borderRadius: 14, color: A.ink }}
        >
          <MapPin size={14} style={{ color: A.fire }} /> Encontranos · Cómo llegar
        </div>
        <p className="mt-4 text-center font-mono-tech text-[10px] tracking-widest" style={{ color: A.soft }}>ardente.getdishub.app</p>
        <div className="mx-auto mt-4 h-[4px] w-24" style={{ background: A.ink, borderRadius: 999, opacity: 0.7 }} />
      </div>
        </div>
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
            <PhoneMock />
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
