import type { PlanKey } from "@/lib/whatsapp";

export type EjemploKey = "olazabal" | "pesto" | "lugo" | "ronnin";

export const EJEMPLOS: Record<EjemploKey, { nombre: string; tipo: string; nota: string; url: string }> = {
  olazabal: { nombre: "Olazábal", tipo: "Café", nota: "Carta con la marca del local", url: "/ejemplos/olazabal/index.html" },
  lugo: { nombre: "LUGO", tipo: "Panadería y repostería congelada", nota: "Listos para hornear en casa", url: "/ejemplos/lugo/index.html" },
  ronnin: { nombre: "Ronnin Pizza", tipo: "Pizzería", nota: "Carta de ejemplo con pedido por WhatsApp", url: "/ejemplos/ronnin/index.html" },
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
  /** Cómo trabajamos: pasos numerados (titulo, detalle). */
  pasos?: Array<[string, string]>;
  /** Comparativa: filas [aspecto, la alternativa, DISHub]. */
  vs?: { titulo: string; alternativa: string; filas: Array<[string, string, string]> };
};

const FAQ_COMUN: Array<[string, string]> = [
  [
    "¿Cuánto sale y qué incluye el precio?",
    "El desarrollo es un pago único (Carta Digital AR$ 175.000, Carta + Pedido por WhatsApp AR$ 225.000) y no incluye hosting. Si no tenés dónde alojarla, la alojamos nosotros en un subdominio por AR$ 25.000 por mes, con mantenimiento incluido.",
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
      nota: "Pago único de desarrollo. Hosting opcional: AR$ 25.000 por mes.",
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
      nota: "Pago único de desarrollo. Hosting opcional: AR$ 25.000 por mes.",
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
      nota: "Pago único de desarrollo. Pedido por WhatsApp: AR$ 225.000. Hosting opcional: AR$ 25.000 por mes.",
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
      nota: "Pago único de desarrollo. Carta sola: AR$ 175.000. Hosting opcional: AR$ 25.000 por mes.",
    },
    faq: [
      ["¿Sirve si cambio de lugar todos los días?", "Sí. La carta no depende de un local fijo: el QR abre siempre la misma dirección y vos actualizás el contenido cuando quieras."],
      ["¿Puedo cambiar el menú desde el celular?", "Sí. La planilla de Google se edita desde el celular, así que podés marcar un plato como agotado en el momento."],
      ["¿Cómo cobro?", "Con tu propio Mercado Pago: el cliente paga con tu link o QR de cobro y el dinero va directo a tu cuenta. DISHub no cobra comisión por venta (aplican las tarifas normales de Mercado Pago)."],
      ...FAQ_COMUN,
    ],
  },
  {
    slug: "carta-digital-con-qr",
    ejemplo: "pesto",
    badge: "// Carta digital con QR",
    title: "Carta digital con QR para restaurantes, sin app | DISHub",
    description:
      "Carta digital con QR para tu restaurante: se abre en el navegador sin descargar nada, la editás desde una planilla de Google y no pagás comisión por venta.",
    h1: ["CARTA DIGITAL", "CON QR."],
    intro:
      "Tus clientes escanean un QR, ven tu carta en el celular y listo: sin app, sin registro y sin menús de papel que se gastan. Vos cambiás precios y platos desde una planilla; el resto lo resolvemos nosotros.",
    pains: [
      ["Imprimir la carta cada vez que cambia algo", "El QR se imprime una sola vez. Cambiás el precio en la planilla y la carta se actualiza en todas las mesas."],
      ["Un PDF que nadie lee bien en el celular", "El PDF obliga a hacer zoom, carga lento y no se puede actualizar sin volver a subirlo. Nuestra carta está armada para pantallas chicas."],
      ["Pagar una plataforma que se queda con un porcentaje", "Con tu propia carta no hay comisión por venta. Pagás el desarrollo una vez y, si querés, un mantenimiento mensual fijo."],
    ],
    vs: {
      titulo: "POR QUÉ NO ALCANZA CON UN PDF",
      alternativa: "Carta en PDF",
      filas: [
        ["En el celular", "Hay que hacer zoom y deslizar", "Se adapta a la pantalla y se lee de una"],
        ["Velocidad", "Archivos pesados que tardan en abrir", "Carga rápido, con fotos optimizadas"],
        ["Cambiar un precio", "Editar el archivo, exportar y volver a subirlo", "Cambiás una celda de la planilla"],
        ["Plato agotado", "Sigue apareciendo hasta que lo reemplazás", "Lo marcás como no disponible y desaparece"],
        ["Tu marca", "La del diseño original, sin identidad propia", "Paleta, tipografía y estilo de tu local"],
        ["Pedidos", "No hay forma de pedir desde la carta", "Pedido por WhatsApp ya armado, opcional"],
      ],
    },
    pasos: [
      ["Nos pasás tu carta", "Con lo que tengas: una foto, un PDF, un Excel o un mensaje. No hace falta que esté ordenada."],
      ["La armamos con tu marca", "Diseñamos la carta con la identidad de tu local y cargamos platos, precios y categorías."],
      ["Te entregamos todo funcionando", "Recibís la carta publicada, el QR listo para imprimir y la planilla para editar."],
      ["La mantenemos", "Si no querés ocuparte de nada técnico, nos encargamos del hosting y los ajustes por un monto fijo mensual."],
    ],
    incluye: [
      "Carta digital con la identidad de tu local",
      "QR listo para imprimir, por mesa o mostrador",
      "Planilla de Google para precios, platos y disponibilidad",
      "Se abre en el navegador: el cliente no descarga nada",
      "Pedido por WhatsApp opcional",
    ],
    plan: {
      key: "carta",
      nombre: "Carta Digital",
      precio: "AR$ 175.000",
      nota: "Pago único de desarrollo. Pedido por WhatsApp: AR$ 225.000. Mantenimiento opcional: AR$ 25.000 por mes.",
    },
    faq: [
      ["¿El cliente tiene que instalar algo para ver la carta?", "No. El QR abre la carta directo en el navegador del celular, en cualquier teléfono con cámara."],
      ["¿Qué pasa si cambio de precios o me quedo sin un plato?", "Editás la planilla de Google y la carta se actualiza sola. Marcar un plato como no disponible lleva un par de segundos."],
      ["¿Tengo que reimprimir el QR cuando cambio la carta?", "No. El QR apunta siempre a la misma dirección, así que se imprime una sola vez."],
      ["¿Funciona para bares, cafés y restaurantes?", "Sí. Armamos la carta con las secciones y la identidad de cada local."],
      ...FAQ_COMUN,
    ],
  },
  {
    slug: "como-hacer-una-carta-digital",
    ejemplo: "olazabal",
    badge: "// Cómo hacer tu carta digital",
    title: "Cómo hacer una carta digital con QR para tu restaurante | DISHub",
    description:
      "Qué hace falta para tener una carta digital con QR en tu restaurante y cómo te la resolvemos de punta a punta, sin que tengas que ocuparte de nada técnico.",
    h1: ["CÓMO HACER UNA", "CARTA DIGITAL."],
    intro:
      "Una carta digital con QR parece simple, pero detrás hay diseño, carga de contenido, hosting, un QR que no se rompa y alguien que la mantenga. Nosotros nos ocupamos de todo eso: vos seguís atendiendo tu local.",
    pains: [
      ["Qué lleva armar una carta digital", "Ordenar el contenido, diseñarla para el celular, publicarla en un hosting, generar el QR y dejar un modo simple de actualizarla. Son varias tareas que no tienen que ser tuyas."],
      ["Qué suele salir mal cuando se hace por cuenta propia", "PDFs que no se leen en el celular, QR que dejan de funcionar cuando cambia la dirección y cartas que quedan desactualizadas porque nadie tiene tiempo de tocarlas."],
      ["Una cosa menos de la que ocuparte", "Lo digital de tu local lo resolvemos nosotros: lo armamos, lo publicamos y lo mantenemos. Vos solo cambiás un precio cuando hace falta."],
    ],
    pasos: [
      ["Nos escribís por WhatsApp", "Nos contás qué tipo de local tenés y nos pasás tu carta actual, en el formato que la tengas."],
      ["Nosotros hacemos todo lo digital", "Diseñamos la carta con tu marca, cargamos los platos y precios, la publicamos y generamos el QR."],
      ["Probás y ajustamos", "Revisás la carta funcionando y hacemos los cambios que necesites antes de imprimir el QR."],
      ["La usás sin preocuparte", "Cambiás precios desde una planilla de Google. Si preferís no tocar nada, nos encargamos del mantenimiento."],
    ],
    incluye: [
      "Diseño de la carta con la identidad de tu local",
      "Carga inicial de platos, precios y categorías por nuestra parte",
      "Publicación y QR listo para imprimir",
      "Planilla de Google para editar precios y disponibilidad",
      "Mantenimiento y soporte por WhatsApp (opcional)",
      "Pedido por WhatsApp (opcional)",
    ],
    plan: {
      key: "carta",
      nombre: "Carta Digital",
      precio: "AR$ 175.000",
      nota: "Pago único de desarrollo. Pedido por WhatsApp: AR$ 225.000. Mantenimiento opcional: AR$ 25.000 por mes.",
    },
    faq: [
      ["¿Tengo que saber de tecnología?", "No. Nos pasás tu carta y nosotros hacemos la parte digital. Cambiar un precio después es editar una celda."],
      ["¿Se puede hacer una carta digital por mi cuenta?", "Sí, con una planilla, una página y un generador de QR. La diferencia es el tiempo que te lleva, el diseño y que alguien se ocupe cuando algo falla. Si preferís no ocuparte, lo resolvemos nosotros."],
      ["¿Sirve un PDF como carta digital?", "Sirve para salir del paso, pero en el celular obliga a hacer zoom y es incómodo de actualizar. Una carta web se adapta a la pantalla."],
      ["¿Qué necesito para empezar?", "Tu carta actual, tu logo si tenés y los datos de tu local. Con eso armamos la primera versión."],
      ...FAQ_COMUN,
    ],
  },
  {
    slug: "carta-digital-para-bares",
    ejemplo: "ronnin",
    badge: "// Bares y cervecerías",
    title: "Carta digital para bares y cervecerías con QR | DISHub",
    description:
      "Carta digital con QR para bares y cervecerías: canillas, tragos y promos que cambiás desde una planilla, pedido por WhatsApp opcional y sin comisiones.",
    h1: ["CARTA DIGITAL", "PARA TU BAR."],
    intro:
      "En un bar la carta cambia todo el tiempo: canillas rotativas, tragos de temporada, promos. Con una carta digital con QR actualizás en segundos y tus clientes siempre ven lo que hay hoy. Nosotros la armamos y vos te dedicás al bar.",
    pains: [
      ["Las canillas y los tragos rotan", "Cambiás qué cerveza sale y a qué precio en la planilla, sin imprimir ni borrar el pizarrón."],
      ["Promos con fecha", "Cargás cada promo con su inicio y fin, y la carta la muestra solo mientras está vigente."],
      ["El mozo explicando la carta en cada mesa", "El cliente la lee en el celular y llega a la barra sabiendo qué quiere, así tu equipo pasa más tiempo sirviendo."],
      ["Platos y bebidas agotadas", "Marcás el producto como no disponible y deja de aparecer, sin cruzar nada a mano."],
    ],
    vs: {
      titulo: "PIZARRÓN Y PAPEL VS CARTA DIGITAL",
      alternativa: "Pizarrón o carta de papel",
      filas: [
        ["Cambiar una cerveza o un precio", "Borrar, reescribir o reimprimir", "Cambiás una celda de la planilla"],
        ["Producto agotado", "Se pide y recién ahí se avisa", "Deja de aparecer en la carta"],
        ["Promos", "Cartelería aparte que hay que sacar a mano", "Con fecha de inicio y fin, se muestran solas"],
        ["Pedidos", "Todo pasa por el mozo o la barra", "Pedido por WhatsApp ya armado, opcional"],
        ["Costo de cambiar", "Impresión cada vez", "Cero: el QR se imprime una sola vez"],
      ],
    },
    pasos: [
      ["Nos pasás tu carta actual", "Una foto del pizarrón, un PDF o un mensaje. No hace falta prolijidad."],
      ["La armamos con la identidad de tu bar", "Secciones para cervezas, tragos, picadas y platos, con tu estilo."],
      ["Te dejamos el QR y la planilla", "Imprimís el QR para mesas y barra, y editás desde una planilla de Google."],
      ["Nosotros mantenemos lo técnico", "Con el mantenimiento mensual nos encargamos del hosting y los ajustes."],
    ],
    incluye: [
      "Carta digital con la identidad de tu bar",
      "Secciones para cervezas, tragos, picadas y platos",
      "Planilla de Google para precios, promos y disponibilidad",
      "QR listo para imprimir, por mesa y barra",
      "Pedido por WhatsApp opcional",
    ],
    plan: {
      key: "carta",
      nombre: "Carta Digital",
      precio: "AR$ 175.000",
      nota: "Pago único de desarrollo. Pedido por WhatsApp: AR$ 225.000. Mantenimiento opcional: AR$ 25.000 por mes.",
    },
    faq: [
      ["¿Puedo mostrar la cerveza que sale de la canilla hoy?", "Sí. Es una fila más de la planilla: la cambiás y la carta se actualiza al instante."],
      ["¿Sirve para bares con mucho movimiento?", "Sí. La carta carga rápido en el celular y no requiere app, así que el cliente la abre en segundos."],
      ["¿Pueden tomar pedidos desde la carta?", "Sí, con el plan Carta + Pedido por WhatsApp: el cliente arma el pedido y te llega ordenado a tu número. El cobro lo resolvés como ya lo hacés."],
      ["¿Qué necesito para empezar?", "Tu carta actual, el logo si tenés y los datos del bar. Con eso armamos la primera versión."],
      ...FAQ_COMUN,
    ],
  },
];

export const RUBRO_BY_SLUG = Object.fromEntries(RUBROS.map((r) => [r.slug, r])) as Record<string, Rubro>;
