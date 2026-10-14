import { ArrowRight } from "lucide-react";
import { EJEMPLOS, type EjemploKey } from "@/lib/rubros";

function Celular({ k }: { k: EjemploKey }) {
  const e = EJEMPLOS[k];
  return (
    <div className="flex flex-col items-center">
      <div
        className="w-[300px] overflow-hidden"
        style={{
          border: "2px solid var(--color-text)",
          borderRadius: "32px",
          boxShadow: "6px 6px 0 var(--color-accent)",
          background: "#000",
        }}
      >
        <iframe
          src={e.url}
          title={`Carta de ${e.nombre} hecha con DISHub`}
          loading="lazy"
          style={{ display: "block", width: "100%", height: "560px", border: "none", background: "#fff" }}
        />
      </div>
      <h3 className="font-display font-bold uppercase tracking-wide mt-6">{e.nombre}</h3>
      <p className="font-sans text-sm text-(--color-text) text-center mt-1 max-w-[280px]">{e.tipo}</p>
      <p className="font-sans text-sm text-(--color-muted) text-center max-w-[280px]">{e.nota}</p>
      <a
        href={e.url}
        target="_blank"
        rel="noopener"
        className="mt-3 inline-flex items-center gap-2 font-mono-tech text-xs uppercase tracking-widest text-(--color-accent) hover:underline"
      >
        Abrir en pantalla completa <ArrowRight size={14} />
      </a>
    </div>
  );
}

/** Sección de la home: trabajos reales, sin números inventados. */
export function CartasHechas() {
  return (
    <section id="cartas" className="border-b border-(--color-border)">
      <div className="mx-auto max-w-7xl px-6 py-24">
        <h2 className="reveal font-display text-3xl sm:text-5xl font-extrabold text-center mb-4">
          CARTAS HECHAS CON DISHub
        </h2>
        <p className="reveal font-sans text-lg text-(--color-muted) text-center max-w-2xl mx-auto mb-14 leading-relaxed">
          Estas son cartas reales, con la marca de cada local. Tocalas: son las mismas que ve un cliente al escanear el QR.
        </p>
        <div className="reveal flex flex-wrap justify-center gap-16">
          <Celular k="olazabal" />
          <Celular k="pesto" />
        </div>
      </div>
    </section>
  );
}

/** Bloque para cada página de rubro: un ejemplo en vivo. */
export function EjemploRubro({ k }: { k: EjemploKey }) {
  return (
    <section className="border-b border-(--color-border)">
      <div className="mx-auto max-w-5xl px-6 py-24 grid md:grid-cols-2 gap-12 items-center">
        <div className="reveal">
          <h2 className="font-display text-3xl sm:text-4xl font-extrabold mb-5">MIRÁ UNA CARTA REAL</h2>
          <p className="font-sans text-(--color-muted) leading-relaxed">
            Esta es la carta de {EJEMPLOS[k].nombre}, hecha con DISHub. Podés navegarla y probar cómo se siente
            antes de decidir.
          </p>
        </div>
        <div className="reveal flex justify-center">
          <Celular k={k} />
        </div>
      </div>
    </section>
  );
}
