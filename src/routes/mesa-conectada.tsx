import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { ArrowRight } from "lucide-react";
import { SimpleNav, BrutalBtn, AccordionItem, useReveal, Preloader, ClosingCTA } from "@/components/site";
import { track } from "@/lib/analytics";
import { waLink } from "@/lib/whatsapp";

const FAQ_ITEMS: Array<[string, string]> = [
  [
    "¿Funciona en cualquier teléfono?",
    "En cualquier teléfono con NFC — prácticamente todos los que se vendieron en los últimos años, iPhone y Android. Para los que no lo tienen o lo tienen apagado, el mismo soporte lleva un QR impreso que abre exactamente lo mismo.",
  ],
  [
    "¿El cliente tiene que descargar una app?",
    "No. Se abre en el navegador del teléfono al instante. Cero fricción: ni cuentas, ni registros, ni permisos.",
  ],
  [
    "¿Y si me cambian los precios o la carta?",
    "La editás desde tu panel y se actualiza al instante en todas las mesas. El tag físico nunca se vuelve a tocar: apunta siempre a tu carta viva.",
  ],
  [
    "¿Se pueden robar o romper los soportes?",
    "Son impresos en 3D sin valor de reventa y el tag no sirve fuera de tu local. Si se rompe o desaparece, lo reponemos: la reposición está incluida en Pro y Table Hub, y disponible como adicional en Starter.",
  ],
  [
    "¿Alguien puede \"hackear\" el tag y mandar a mis clientes a otro lado?",
    "No. Los tags se graban y se bloquean de fábrica de forma permanente: físicamente ya no aceptan reescritura.",
  ],
  [
    "¿Qué pasa si se corta internet en el local?",
    "El hub corre en la nube: al cliente le funciona con sus datos móviles. Tu panel lo ves desde cualquier dispositivo con conexión.",
  ],
  [
    "¿Cómo llegan los llamados del mozo y los pedidos?",
    "A un panel de piso en tiempo real que abrís en cualquier tablet, celular o la compu de la barra. Suena, muestra la mesa y el tiempo de espera.",
  ],
  [
    "¿Puedo arrancar solo con la carta y sumar funciones después?",
    "Sí, es la gracia del sistema: el mismo soporte de mesa hace más cosas cuando subís de plan. Activar \"llamar al mozo\" o pedidos no requiere cambiar nada en la mesa.",
  ],
  [
    "¿Cuánto tarda la instalación de los soportes?",
    "Si ya tenés tu carta digital andando, los soportes brandeados llegan instalados en tus mesas. Si arrancás de cero, la instalación va junto con la puesta en marcha completa.",
  ],
  [
    "¿Qué necesito tener yo?",
    "Nada especial. Tu carta (nosotros la cargamos), tu logo y ganas de dejar de atender el WhatsApp a mano. No reemplazamos tu posnet ni tu sistema de facturación: convivimos con lo que ya usás.",
  ],
];

const schemaFAQMesaConectada = {
  "@context": "https://schema.org",
  "@type": "FAQPage",
  "mainEntity": FAQ_ITEMS.map(([q, a]) => ({
    "@type": "Question",
    "name": q,
    "acceptedAnswer": { "@type": "Answer", "text": a },
  })),
};

export const Route = createFileRoute("/mesa-conectada")({
  head: () => ({
    meta: [
      { title: "Mesa Conectada NFC para restaurantes | Carta digital, mozo y pagos desde la mesa — DISHub" },
      { name: "description", content: "Tus clientes apoyan el teléfono en la mesa y tienen la carta, el WiFi, el mozo y la cuenta. Tag NFC + QR por mesa, instalado. Hecho en Argentina." },
      { property: "og:title", content: "Mesa Conectada NFC para restaurantes | DISHub" },
      { property: "og:description", content: "Tus clientes apoyan el teléfono en la mesa y tienen la carta, el WiFi, el mozo y la cuenta. Tag NFC + QR por mesa, instalado." },
      { name: "robots", content: "noindex, follow" },
      { property: "og:url", content: "https://getdishub.app/mesa-conectada" },
      // TODO: reemplazar por foto real del kit impreso en 3D instalado en mesa
      { property: "og:image", content: "https://getdishub.app/og-image.png" },
    ],
    links: [
      { rel: "canonical", href: "https://getdishub.app/mesa-conectada" },
    ],
    scripts: [
      { type: "application/ld+json", children: JSON.stringify(schemaFAQMesaConectada) },
    ],
  }),
  component: MesaConectadaPage,
});

/* ---------- hero ---------- */
function MCHero() {
  return (
    <section className="border-b border-(--color-border)">
      <div className="mx-auto max-w-4xl px-6 py-20 lg:py-28 text-center">
        <div
          className="reveal inline-block font-mono-tech text-[11px] uppercase tracking-widest text-(--color-accent) px-3 py-1 mb-8"
          style={{ border: "2px solid var(--color-accent)" }}
        >
          // Mesa Conectada · NFC + QR
        </div>
        <h1 className="reveal font-display font-extrabold text-(--color-text) leading-[0.95] text-[38px] sm:text-6xl lg:text-[64px] mb-8">
          LA MESA QUE<br />ATIENDE SOLA.
        </h1>
        <p className="reveal font-sans text-lg text-(--color-muted) mb-10 max-w-2xl mx-auto leading-relaxed">
          Tus clientes apoyan el teléfono y tienen todo: la carta, el WiFi, el mozo y la cuenta.
          Sin descargar nada. Sin escanear nada.
        </p>
        <div className="reveal flex flex-wrap items-center justify-center gap-4">
          <BrutalBtn href="/demo" variant="primary">Probalo en la demo <ArrowRight size={16} /></BrutalBtn>
          <BrutalBtn
            href={waLink("mesa_conectada")}
            variant="secondary"
            target="_blank"
            rel="noopener"
            onClick={() => track("whatsapp_click", { origen: "mesa_conectada" })}
          >
            Hablemos por WhatsApp
          </BrutalBtn>
        </div>
      </div>
    </section>
  );
}

/* ---------- cómo funciona ---------- */
function MCComoFunciona() {
  const steps = [
    ["01", "APOYAN EL TELÉFONO", "Un tap sobre el soporte de mesa y se abre el hub de tu local. Compatible con cualquier teléfono moderno; los que no, escanean el QR del mismo soporte."],
    ["02", "TODO EN UN SOLO LUGAR", "Carta siempre actualizada, WiFi, reseñas y redes. Según tu plan: llaman al mozo, piden la cuenta, ordenan y pagan desde la silla."],
    ["03", "VOS VES TODO EN VIVO", "Cada mesa reporta al panel: llamados, pedidos, rotación y horarios pico."],
  ];
  return (
    <section id="como-funciona" className="border-b border-(--color-border)">
      <div className="mx-auto max-w-7xl px-6 py-24">
        <h2 className="reveal font-display text-3xl sm:text-5xl font-extrabold text-center text-(--color-text) mb-16">
          CÓMO FUNCIONA
        </h2>
        <div className="grid md:grid-cols-3 gap-8 relative items-stretch">
          {steps.map(([n, t, d], i) => (
            <div key={n} className="reveal relative h-full">
              <div
                className="p-6 h-full"
                style={{ background: "var(--color-surface)", borderLeft: "4px solid var(--color-accent)" }}
              >
                <div className="font-display text-5xl font-extrabold text-(--color-accent) mb-3">{n}</div>
                <h3 className="font-display font-bold uppercase tracking-wide text-(--color-text) mb-2">{t}</h3>
                <p className="font-sans leading-relaxed" style={{ fontSize: "14px", color: "#9a9a9a" }}>{d}</p>
              </div>
              {i < 2 && (
                <div className="hidden md:block absolute top-1/2 -right-4 text-(--color-accent) font-display text-2xl">
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

/* ---------- kit físico ---------- */
function MCKit() {
  const bullets = [
    "Lo instalamos nosotros",
    "Sin baterías, sin mantenimiento",
    "Reposición incluida en planes Pro y Table Hub",
  ];
  return (
    <section id="el-kit" className="border-b border-(--color-border)">
      <div className="mx-auto max-w-7xl px-6 py-24 grid lg:grid-cols-2 gap-14 items-center">
        <div className="reveal">
          <h2 className="font-display text-3xl sm:text-5xl font-extrabold text-(--color-text) mb-6">
            EL KIT MESA CONECTADA
          </h2>
          <p className="font-sans text-lg text-(--color-muted) mb-8 leading-relaxed">
            Un soporte impreso en 3D con la marca de tu local, con un tag NFC sellado y bloqueado de fábrica
            (no se puede regrabar) y un QR de respaldo impreso en el mismo soporte.
          </p>
          <ul className="space-y-3">
            {bullets.map((b) => (
              <li key={b} className="flex items-start gap-3 text-sm font-sans text-(--color-text)">
                <span className="text-(--color-accent) font-bold shrink-0">→</span>
                {b}
              </li>
            ))}
          </ul>
        </div>
        <div className="reveal">
          <img
            src="/img/nfcqr.jpg"
            alt="Soporte impreso en 3D Mesa Conectada con NFC y QR sobre una mesa de restaurante"
            width={1376}
            height={784}
            loading="lazy"
            className="w-full aspect-video object-cover"
            style={{ border: "2px solid var(--color-border)" }}
          />
        </div>
      </div>
    </section>
  );
}

/* ---------- faq ---------- */
function MCFaq() {
  return (
    <section id="faq" className="border-b border-(--color-border)">
      <div className="mx-auto max-w-3xl px-6 py-24">
        <h2 className="reveal font-display text-3xl sm:text-5xl font-extrabold text-center text-(--color-text) mb-16">
          PREGUNTAS FRECUENTES
        </h2>
        <div className="space-y-3">
          {FAQ_ITEMS.map(([q, a]) => (
            <AccordionItem key={q} q={q} a={a} />
          ))}
        </div>
      </div>
    </section>
  );
}

function MesaConectadaPage() {
  useReveal();
  const [ready, setReady] = useState(false);
  return (
    <div className="min-h-screen bg-(--color-bg) text-(--color-text)">
      {!ready && <Preloader onDone={() => setReady(true)} />}
      <SimpleNav badge="// Mesa Conectada" />
      <MCHero />
      <MCComoFunciona />
      <MCKit />
      <MCFaq />
      <ClosingCTA />
    </div>
  );
}
