import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { Check, X } from "lucide-react";
import { SimpleNav, useReveal, Preloader, ClosingCTA } from "@/components/site";
import { Marco } from "@/components/CartasEjemplo";
import { EJEMPLOS, type EjemploKey } from "@/lib/rubros";

/* Problema típico del rubro y cómo lo resuelve la carta. Solo lo que se ve en cada carta. */
const CASOS: Array<{ k: EjemploKey; estado: string; problema: string; solucion: string }> = [
  {
    k: "olazabal",
    estado: "Carta real",
    problema: "La carta del café es un PDF o una foto que se lee mal en el celular, y no se parece a la marca del local.",
    solucion:
      "Una carta pensada para el celular, con la paleta, la tipografía y las ilustraciones propias del café. Se llega con un QR en la mesa y la barra.",
  },
  {
    k: "pesto",
    estado: "Carta real",
    problema: "Variedades y precios que cambian, y una carta impresa que se queda vieja cada vez que sube un ingrediente.",
    solucion:
      "Pizzas y empanadas por sección, cada una con su descripción y precio, y el pedido armado con un contador. Los cambios se hacen desde una planilla de Google.",
  },
  {
    k: "lugo",
    estado: "Carta real",
    problema: "Los productos son congelados para hornear en casa, y el cliente necesita saber cómo prepararlos. En una lista de precios no hay dónde decirlo.",
    solucion:
      "Cada producto muestra peso, temperatura y tiempo de horneado junto al precio, para que el cliente lo vea antes de pedir.",
  },
  {
    k: "ronnin",
    estado: "Carta de ejemplo",
    problema: "Los pedidos llegan por WhatsApp desordenados: mensajes sueltos, sin cantidades claras y con precios que hay que reconfirmar.",
    solucion:
      "El cliente arma el pedido en la carta y te llega ordenado por WhatsApp, con lo que pidió y el total. Sin comisiones.",
  },
];

export const Route = createFileRoute("/cartas")({
  head: () => ({
    meta: [
      { title: "Cartas digitales hechas con DISHub | Café, pizzería, panadería — DISHub" },
      { name: "description", content: "Cuatro cartas digitales con la marca de cada local: café, empanadas y pizzas, panadería congelada y pizzería con pedido por WhatsApp. Probalas en vivo." },
      { property: "og:title", content: "Cartas digitales hechas con DISHub" },
      { property: "og:description", content: "Cuatro cartas con la marca de cada local. El problema de cada rubro y cómo lo resuelve la carta." },
      { property: "og:url", content: "https://getdishub.app/cartas" },
      { property: "og:image", content: "https://getdishub.app/og-image.png" },
    ],
    links: [{ rel: "canonical", href: "https://getdishub.app/cartas" }],
  }),
  component: CartasPage,
});

function CartasPage() {
  useReveal();
  const [ready, setReady] = useState(false);
  return (
    <div className="min-h-screen bg-(--color-bg) text-(--color-text)">
      {!ready && <Preloader onDone={() => setReady(true)} />}
      <SimpleNav badge="// Cartas" />

      <section className="border-b border-(--color-border)">
        <div className="mx-auto max-w-4xl px-6 pt-20 pb-12 text-center">
          <h1 className="reveal font-display text-4xl sm:text-6xl font-extrabold">CUATRO CARTAS. CUATRO PROBLEMAS.</h1>
          <p className="reveal font-sans text-lg text-(--color-muted) leading-relaxed mt-5">
            Cada local tiene su problema y su marca. Mirá la carta en vivo y cómo se resolvió. Tocá y navegá: es lo que ve un cliente al escanear el QR.
          </p>
        </div>
      </section>

      {CASOS.map((c, i) => {
        const e = EJEMPLOS[c.k];
        return (
          <section key={c.k} className="border-b border-(--color-border)">
            <div className="mx-auto max-w-5xl px-6 py-20 grid md:grid-cols-2 gap-12 items-center">
              <div className={`reveal flex justify-center ${i % 2 ? "md:order-2" : ""}`}>
                <Marco k={c.k} />
              </div>
              <div className="reveal">
                <span
                  className="inline-block px-2 py-1 mb-4 font-mono-tech text-[11px] uppercase tracking-widest"
                  style={{ border: "1px solid var(--color-border)", color: "var(--color-muted)" }}
                >
                  {c.estado} · {e.tipo}
                </span>
                <h2 className="font-display text-3xl sm:text-4xl font-extrabold uppercase mb-8">{e.nombre}</h2>
                <div className="p-5 mb-4" style={{ border: "2px dashed var(--color-border)", background: "var(--color-surface)" }}>
                  <p className="flex items-center gap-2 font-mono-tech text-[11px] uppercase tracking-widest text-(--color-muted) mb-2">
                    <X size={14} /> El problema
                  </p>
                  <p className="font-sans text-(--color-muted) leading-relaxed">{c.problema}</p>
                </div>
                <div
                  className="p-5"
                  style={{ border: "2px solid var(--color-accent)", background: "var(--color-surface)", boxShadow: "5px 5px 0 var(--color-accent-shadow)" }}
                >
                  <p className="flex items-center gap-2 font-mono-tech text-[11px] uppercase tracking-widest text-(--color-accent) mb-2">
                    <Check size={14} /> Cómo lo resuelve DISHub
                  </p>
                  <p className="font-sans text-(--color-text) leading-relaxed">{c.solucion}</p>
                </div>
              </div>
            </div>
          </section>
        );
      })}

      <ClosingCTA />
    </div>
  );
}
