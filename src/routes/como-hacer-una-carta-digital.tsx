import { createFileRoute } from "@tanstack/react-router";
import { RubroPage, rubroHead } from "@/components/RubroPage";
import { RUBRO_BY_SLUG } from "@/lib/rubros";

const rubro = RUBRO_BY_SLUG["como-hacer-una-carta-digital"];

export const Route = createFileRoute("/como-hacer-una-carta-digital")({
  head: () => rubroHead(rubro),
  component: () => <RubroPage r={rubro} />,
});
