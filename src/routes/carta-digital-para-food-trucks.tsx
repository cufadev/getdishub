import { createFileRoute } from "@tanstack/react-router";
import { RubroPage, rubroHead } from "@/components/RubroPage";
import { RUBRO_BY_SLUG } from "@/lib/rubros";

const rubro = RUBRO_BY_SLUG["carta-digital-para-food-trucks"];

export const Route = createFileRoute("/carta-digital-para-food-trucks")({
  head: () => rubroHead(rubro),
  component: () => <RubroPage r={rubro} />,
});
