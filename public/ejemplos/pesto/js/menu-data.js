/* ===== CONFIG (editar acá) ===== */
const WHATSAPP = "";       // número del local
const PRECIOS_DEMO = true;
const DIRECCION = "Suipacha 111, Chivilcoy";   // se puede pisar desde Config (direccion / mapa)
const SHEET_ID = "";                    // ID de la planilla de Google (lo que va entre /d/ y /edit). Vacío = usa el respaldo de abajo.

/* Respaldo: se usa si no hay planilla, si Google no responde y no hay nada guardado en el celu.
   El contenido real se edita en la planilla (pestañas Carta / Categorias / Config). */
/* Especiales de respaldo (mismas columnas que la pestaña Especiales). Vacío: los especiales se cargan desde la planilla. */
const ESPECIALES = [];

const CATEGORIES = [
  { id:"pizzas", name:"Pizzas", tag:"Estilo napolitano",
    note1:"Masa artesanal de <strong>fermentación lenta de 24&nbsp;horas</strong>: más liviana, aireada y fácil de disfrutar.",
    note2:"Producción chica y fresca: algunas opciones cambian según la temporada." },
  { id:"empanadas", name:"Empanadas", tag:"Artesanales · Al horno",
    note1:"Ingredientes reales y seleccionados, rellenos generosos.",
    note2:"Para una comida completa, calculá <strong>3 o 4 por persona</strong>." },
];

const MENU = {
  pizzas: [
    { id:"pz-marga", name:"Marga", price:15500,
      desc:"Salsa de tomate de la casa, mozzarella, albahaca fresca y aceite de oliva." },
    { id:"pz-peras", name:"Peras, Queso Azul, Nueces", price:18500,
      desc:"Peras, queso azul, nueces tostadas y un toque de miel al salir del horno." },
    { id:"pz-fugazza", name:"Fugazza con Queso", price:16000,
      desc:"Mozzarella, provoleta y cebolla en dos cocciones." },
    { id:"pz-morta", name:"Mortadela, Nueces y Pesto", price:18000,
      desc:"Salsa de tomate de la casa, mozzarella, mortadela, pesto y nueces tostadas." },
    { id:"pz-anchoas", name:"Anchoas", price:17500,
      desc:"Salsa de tomate, ajo confitado y anchoas. Con o sin mozzarella." },
    { id:"pz-cerdo", name:"Cerdo y Sweet Chilli", price:18000,
      desc:"Salsa de tomate, mozzarella, cerdo desmenuzado y salsa agridulce levemente picante." },
  ],
  empanadas: [
    { id:"em-espinaca", name:"Espinaca & Bechamel", price:2200,
      desc:"Espinaca, cebolla, morrón, ajo, salsa bechamel y mozzarella." },
    { id:"em-zapallo", name:"Zapallo", price:2200,
      desc:"Zapallo asado, salvia y mozzarella." },
    { id:"em-fugazzeta", name:"Fugazzeta", price:2200,
      desc:"Cebolla, manteca, pimienta negra y mozzarella. Salen gratinadas." },
    { id:"em-provoleta", name:"Provoleta & Tomate", price:2300,
      desc:"Provoleta, mozzarella y pesto de tomate seco. Salen gratinadas." },
    { id:"em-jyq", name:"Jamón & Quesos", price:2300,
      desc:"Jamón cocido, bechamel al verdeo, reggiano y mozzarella." },
    { id:"em-carne", name:"Carne a Cuchillo", price:2400,
      desc:"Paleta de ternera, cebolla, morrón, huevo, pimentón y orégano." },
    { id:"em-costillitas", name:"Costillitas Barbacoa", price:2400,
      desc:"Costillitas de cerdo horneadas con nuestra salsa barbacoa." },
    { id:"em-anchoas", name:"Anchoas", price:2400,
      desc:"Anchoas, salsa de tomates y mozzarella." },
  ],
};
