import type { PlanKey } from "@/lib/whatsapp";

export type EjemploKey = "olazabal" | "pesto";

export const EJEMPLOS: Record<EjemploKey, { nombre: string; tipo: string; nota: string; url: string }> = {
  olazabal: { nombre: "Olazábal", tipo: "Café", nota: "Carta con la marca del local", url: "/ejemplos/olazabal/index.html" },
  pesto: { nombre: "PESTO", tipo: "Empanadas artesanales y pizzas napolitanas", nota: "Chivilcoy · Top 10 Mundial de la Empanada 2026", url: "/ejemplos/pesto/index.html" },
};

export type Rubro = {
  slug: string;
  ejemplo: EjemploKey;
  badge: string;
  title: string;
  description: string;
  h1: [string, string];
  intro: string;
  pains: Array<[string, string]>;
  incluye: string[];
  plan: { key: PlanKey; nombre: string; precio: string; nota: string };
  faq: Array<[string, string]>;
};

const FAQ_COMUN: Array<[string, string]> = [
  [
    "¿Cuánto sale y qué incluye el precio?",
    "El desarrollo es un pago único (Carta Digital AR$ 175.000, Carta + Pedido por WhatsApp AR$ 225.000) y no incluye hosting. Si no tenés dónde alojarla, la alojamos nosotros en un subdominio por AR$ 35.000 por mes, con mantenimiento incluido.",
  ],
  [
    "¿Cómo actualizo precios y platos?",
    "Desde una planilla de Google, como editar un Excel. No hay panel ni contraseñas: cambiás la celda y la carta se actualiza.",
  ],
  [
    "¿Pagan comisión por los pedidos?",
    "No. DISHub no cobra comisión por venta: lo que vendés es tuyo.",
  ],
];

export const RUBROS: Rubro[] = [
  {
    slug: "carta-digital-para-cafes",
    ejemplo: "olazabal",
    badge: "// Cafés y cafeterías",
    title: "Carta digital para cafés y cafeterías | DISHub",
    description:
      "Carta digital con QR para tu café: con la marca de tu local, precios que cambiás desde una planilla de Google y sin imprimir menús de nuevo. Pago único.",
    h1: ["CARTA DIGITAL", "PARA TU CAFÉ."],
    intro:
      "Una carta mobile-first con la identidad de tu café, que tus clientes abren escaneando un QR en la mesa o en la barra. La actualizás vos en minutos, sin volver a imprimir.",
    pains: [
      ["Los precios cambian y la carta impresa no", "Con la carta digital cambiás un precio en la planilla y queda al instante, en todas las mesas."],
      ["Se acaban cosas durante el día", "Marcás el plato como no disponible y deja de aparecer, sin tachar ni explicar mesa por mesa."],
      ["Tu carta no se parece a tu marca", "La armamos con tu paleta, tu tipografía y tus ilustraciones, no con una plantilla genérica."],
    ],
    incluye: [
      "Carta digital con la marca de tu café",
      "Calientes, fríos, pastelería y brunch: las secciones que necesites",
      "Planilla de Google para editar precios, platos y disponibilidad",
      "QR listo para imprimir (archivo)",
      "Instagram, WiFi, horarios y cómo llegar en la misma carta",
    ],
    plan: {
      key: "carta",
      nombre: "Carta Digital",
      precio: "AR$ 175.000",
      nota: "Pago único de desarrollo. Hosting opcional: AR$ 35.000 por mes.",
    },
    faq: [
      ["¿Mi café necesita saber de tecnología?", "No. Te entregamos todo funcionando y la planilla lista para que la completes. Si algo no podés hacer vos, lo hacemos nosotros."],
      ["¿El cliente tiene que descargar una app?", "No. La carta se abre en el navegador del teléfono al escanear el QR."],
      ...FAQ_COMUN,
    ],
  },
  {
    slug: "carta-digital-para-pizzerias",
    ejemplo: "pesto",
    badge: "// Pizzerías y empanaderías",
    title: "Carta digital con pedido por WhatsApp para pizzerías | DISHub",
    description:
      "Carta digital para pizzerías y empanaderías: el cliente arma el pedido y te llega ordenado por WhatsApp. Sin comisiones. Desarrollo en pago único.",
    h1: ["TU CARTA CON", "PEDIDO POR WHATSAPP."],
    intro:
      "Tus clientes eligen sabores y cantidades en la carta y te mandan el pedido ya armado por WhatsApp. Sin comisiones y sin transcribir audios.",
    pains: [
      ["Pedidos desordenados por WhatsApp", "El mensaje llega con cantidades, productos y total, listo para preparar."],
      ["Sabores y promos que cambian seguido", "Actualizás la planilla y la carta refleja el cambio, incluidos los especiales del día con fecha de inicio y fin."],
      ["Las apps de delivery se quedan con un porcentaje", "Con tu propia carta, el pedido va directo a tu WhatsApp y no pagás comisión."],
    ],
    incluye: [
      "Carta digital con la marca de tu local",
      "Carrito: el cliente suma productos y cantidades",
      "Pedido armado y enviado a tu WhatsApp",
      "Especiales del día con vigencia automática",
      "Planilla de Google para precios y disponibilidad",
      "QR listo para imprimir (archivo)",
    ],
    plan: {
      key: "carta_pedido",
      nombre: "Carta + Pedido por WhatsApp",
      precio: "AR$ 225.000",
      nota: "Pago único de desarrollo. Hosting opcional: AR$ 35.000 por mes.",
    },
    faq: [
      ["¿Cómo recibo los pedidos?", "Por WhatsApp, en tu número. El cliente confirma desde la carta y se abre la conversación con el pedido ya escrito: productos, cantidades y total."],
      ["¿Se cobra online?", "Hoy el pedido se coordina por WhatsApp, y el cobro lo resolvés como ya lo hacés. Los pagos desde la carta están en el plan a futuro."],
      ...FAQ_COMUN,
    ],
  },
  {
    slug: "menu-qr-para-restaurantes",
    ejemplo: "olazabal",
    badge: "// Restaurantes y bares",
    title: "Menú QR para restaurantes y bares | DISHub",
    description:
      "Menú digital con QR para restaurantes y bares: una carta cuidada con tu marca que actualizás desde una planilla de Google. Sin comisiones, pago único.",
    h1: ["MENÚ QR PARA", "TU RESTAURANTE."],
    intro:
      "Una carta digital con tu marca, accesible desde un QR en cada mesa. La mantenés vos mismo desde una planilla, sin depender de un programador cada vez que cambia un precio.",
    pains: [
      ["Menús impresos que hay que reimprimir", "Un cambio en la planilla actualiza la carta en todas las mesas. El QR se imprime una sola vez."],
      ["Depender de otra persona para cada cambio", "Editás precios, platos y disponibilidad vos mismo, como en una planilla de cálculo."],
      ["Un menú en PDF que se ve mal en el celular", "La carta está pensada para pantallas chicas: se lee bien y carga rápido."],
    ],
    incluye: [
      "Carta digital con la identidad de tu local",
      "Secciones y platos a medida",
      "Planilla de Google para editar todo",
      "QR por mesa y mostrador (archivo listo para imprimir)",
      "Pedido por WhatsApp opcional, en el plan Carta + Pedido",
    ],
    plan: {
      key: "carta",
      nombre: "Carta Digital",
      precio: "AR$ 175.000",
      nota: "Pago único de desarrollo. Pedido por WhatsApp: AR$ 225.000. Hosting opcional: AR$ 35.000 por mes.",
    },
    faq: [
      ["¿Puedo usar mi propio dominio?", "Sí. Si ya tenés hosting y dominio, te entregamos la carta lista para publicar. Si preferís, la alojamos en un subdominio nuestro."],
      ["¿Qué pasa si no sé cargar la planilla?", "La primera carga la hacemos nosotros con tu carta actual. Después, cambiar un precio es editar una celda."],
      ...FAQ_COMUN,
    ],
  },
  {
    slug: "carta-digital-para-food-trucks",
    ejemplo: "pesto",
    badge: "// Food trucks",
    title: "Carta digital para food trucks | DISHub",
    description:
      "Carta digital con QR y pedido por WhatsApp para food trucks: una carta liviana que cambiás desde el celular, para que tus clientes pidan sin hacer fila. Pago único.",
    h1: ["CARTA DIGITAL", "PARA TU FOOD TRUCK."],
    intro:
      "Un QR pegado en tu camión lleva a tu carta, siempre actualizada y con pedido por WhatsApp. Cambiás el menú del día en segundos, esté donde estés.",
    pains: [
      ["El menú cambia según el día y el evento", "Editás la planilla desde el celular y la carta refleja lo que hay hoy, sin imprimir cartelería nueva."],
      ["Mucha cola y poco tiempo por pedido", "El cliente mira la carta y arma el pedido mientras espera, y te llega ordenado por WhatsApp."],
      ["No tenés un local donde colgar un menú", "El QR vive en el camión, el cartel o tus redes, y siempre abre la misma carta actualizada."],
    ],
    incluye: [
      "Carta digital liviana, pensada para el celular",
      "Planilla de Google para cambiar platos, precios y disponibilidad",
      "Pedido armado y enviado a tu WhatsApp",
      "Cobro con Mercado Pago: tu link o QR de cobro para pagar al retirar",
      "Especiales del día con vigencia automática",
      "QR listo para imprimir (archivo)",
      "Instagram, horarios y ubicación en la misma carta",
    ],
    plan: {
      key: "carta_pedido",
      nombre: "Carta + Pedido por WhatsApp",
      precio: "AR$ 225.000",
      nota: "Pago único de desarrollo. Carta sola: AR$ 175.000. Hosting opcional: AR$ 35.000 por mes.",
    },
    faq: [
      ["¿Sirve si cambio de lugar todos los días?", "Sí. La carta no depende de un local fijo: el QR abre siempre la misma dirección y vos actualizás el contenido cuando quieras."],
      ["¿Puedo cambiar el menú desde el celular?", "Sí. La planilla de Google se edita desde el celular, así que podés marcar un plato como agotado en el momento."],
      ["¿Cómo cobro?", "Con tu propio Mercado Pago: el cliente paga con tu link o QR de cobro y el dinero va directo a tu cuenta. DISHub no cobra comisión por venta (aplican las tarifas normales de Mercado Pago)."],
      ...FAQ_COMUN,
    ],
  },
];

export const RUBRO_BY_SLUG = Object.fromEntries(RUBROS.map((r) => [r.slug, r])) as Record<string, Rubro>;
