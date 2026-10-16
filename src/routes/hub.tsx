import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { SimpleNav, useReveal, Preloader, ClosingCTA } from "@/components/site";
import { HubPropio } from "@/components/HubPropio";

export const Route = createFileRoute("/hub")({
  head: () => ({
    meta: [
      { title: "Link en bio para restaurantes | Carta, pedido y reservas en un solo link — DISHub" },
      { name: "description", content: "Un link en bio hecho para gastronomía: carta, pedido por WhatsApp, reservas y fidelización con tu marca, en un solo link para Instagram." },
      { property: "og:title", content: "Link en bio para restaurantes | DISHub" },
      { property: "og:description", content: "Un solo link para Instagram y WhatsApp con tu carta, pedido, reservas y fidelización. Con tu marca." },
      { name: "robots", content: "noindex, follow" },
      { property: "og:url", content: "https://getdishub.app/hub" },
      { property: "og:image", content: "https://getdishub.app/og-image.png" },
    ],
    links: [
      { rel: "canonical", href: "https://getdishub.app/hub" },
      { rel: "stylesheet", href: "https://fonts.googleapis.com/css2?family=Bebas+Neue&display=swap" },
    ],
  }),
  component: HubPage,
});

function HubPage() {
  useReveal();
  const [ready, setReady] = useState(false);
  return (
    <div className="min-h-screen bg-(--color-bg) text-(--color-text)">
      {!ready && <Preloader onDone={() => setReady(true)} />}
      <SimpleNav badge="// Link en bio" />
      <HubPropio />
      <ClosingCTA />
    </div>
  );
}
