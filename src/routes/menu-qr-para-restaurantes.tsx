import { createFileRoute } from "@tanstack/react-router";
import { RubroPage, rubroHead } from "@/components/RubroPage";
import { RUBRO_BY_SLUG } from "@/lib/rubros";

const rubro = RUBRO_BY_SLUG["menu-qr-para-restaurantes"];

export const Route = createFileRoute("/menu-qr-para-restaurantes")({
  head: () => rubroHead(rubro),
  component: () => <RubroPage r={rubro} />,
});
