import { AccordionItem } from "@/components/site";

export const FAQ_HOME_ITEMS: Array<[string, string]> = [
  ["¿Cómo es el proceso hasta estar online?", "Nos pasás tu carta y tu logo, la armamos con tu marca, la aprobás y sale al aire con su QR."],
  ["¿Cómo cambio precios o platos?", "Desde una planilla de Google, como editar un Excel. Sin paneles ni contraseñas."],
  ["¿Necesito saber de tecnología?", "No. Te entregamos todo funcionando y la planilla lista para que cargues tu carta."],
  ["¿Hay comisiones por venta?", "Cero. Lo que vendés es todo tuyo."],
  ["¿Qué incluye el hosting de AR$ 35.000 por mes?", "Hosting, subdominio, mantenimiento, soporte por WhatsApp, corrección de errores y los cambios de contenido que no puedas hacer vos desde la planilla."],
  ["¿Puedo alojar la carta por mi cuenta?", "Sí. Te la entregamos lista para publicar y no pagás mensual con nosotros."],
  ["¿Las fotos están incluidas?", "No, la sesión de fotografía gastronómica profesional se contrata por separado."],
];

export function FaqHome() {
  return (
    <section className="border-b border-(--color-border)">
      <div className="mx-auto max-w-3xl px-6 py-24">
        <h2 className="reveal font-display text-3xl sm:text-5xl font-extrabold text-center text-(--color-text) mb-16">
          PREGUNTAS FRECUENTES
        </h2>
        <div className="space-y-3">
          {FAQ_HOME_ITEMS.map(([q, a]) => (
            <AccordionItem key={q} q={q} a={a} />
          ))}
        </div>
      </div>
    </section>
  );
}
