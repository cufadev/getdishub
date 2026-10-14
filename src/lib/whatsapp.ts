export const WHATSAPP_NUMBER = "5491178212733";

export function whatsappHref(text: string) {
  return `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(text)}`;
}

export type PlanKey = "menu" | "starter" | "pro" | "tablehub" | "carta" | "carta_pedido" | "hosting";

const PLAN_LABELS: Record<PlanKey, string> = {
  menu: "Menú Digital",
  starter: "Starter",
  pro: "PRO",
  tablehub: "Table Hub",
  carta: "Carta Digital",
  carta_pedido: "Carta + Pedido por WhatsApp",
  hosting: "Hosting con DISHub",
};

export function waLink(origen: string, plan?: PlanKey) {
  if (origen === "mesa_conectada") {
    return whatsappHref("Hola! Vi Mesa Conectada en la web y quiero saber más.");
  }
  if (plan) {
    return whatsappHref(`Hola! Vengo de la web de DISHub, me interesa el plan ${PLAN_LABELS[plan]}.`);
  }
  return whatsappHref("Hola! Vengo de la web de DISHub y quiero más info.");
}
