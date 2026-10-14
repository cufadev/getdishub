export type OnboardingItemSeed = {
  item_key: string;
  label: string;
  sort_order: number;
};

export const ONBOARDING_BASE_ITEMS: OnboardingItemSeed[] = [
  { item_key: "logo", label: "Logo recibido", sort_order: 10 },
  { item_key: "carta", label: "Carta completa (productos + precios)", sort_order: 20 },
  { item_key: "fotos", label: "Sesión de fotos realizada", sort_order: 30 },
  { item_key: "identidad", label: "Identidad visual definida", sort_order: 40 },
  { item_key: "whatsapp", label: "Número de WhatsApp de pedidos confirmado", sort_order: 50 },
  { item_key: "horarios", label: "Horarios y zonas de entrega cargados", sort_order: 60 },
  { item_key: "datos", label: "Dirección, redes y Google Maps", sort_order: 70 },
  { item_key: "dominio", label: "Subdominio activo y verificado", sort_order: 80 },
  { item_key: "revision", label: "Revisión final con el cliente", sort_order: 90 },
];

export const ONBOARDING_PLAN_ITEMS: Record<string, OnboardingItemSeed[]> = {
  pro: [{ item_key: "reservas", label: "Políticas de reserva definidas", sort_order: 65 }],
  table_hub: [
    { item_key: "reservas", label: "Políticas de reserva definidas", sort_order: 65 },
    { item_key: "mesas", label: "Mesas numeradas y QRs generados", sort_order: 66 },
  ],
};

export function onboardingItemsForPlan(plan: string): OnboardingItemSeed[] {
  const items = [...ONBOARDING_BASE_ITEMS, ...(ONBOARDING_PLAN_ITEMS[plan] ?? [])];
  return items.sort((a, b) => a.sort_order - b.sort_order);
}
