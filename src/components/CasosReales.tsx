const CASOS = [
  {
    nombre: "Olazabal",
    foto: "/images/casos/olazabal.jpg",
    desc: "Carta digital con fotografía profesional propia",
    tag: "CARTA DIGITAL + RESEÑAS",
  },
  {
    nombre: "Lugo",
    foto: "/images/casos/lugo.jpg",
    desc: "Reservas online sin depender del teléfono",
    tag: "STARTER",
  },
  {
    nombre: "Chebra",
    foto: "/images/casos/chebra.jpg",
    desc: "Hub completo con pedidos directos por WhatsApp",
    tag: "PRO",
  },
] as const;

function CasoCard({ caso }: { caso: (typeof CASOS)[number] }) {
  return (
    <div
      className="reveal"
      style={{
        background: "var(--color-surface)",
        border: "2px solid rgba(245,240,232,0.1)",
        boxShadow: "4px 4px 0 #b85a2b",
      }}
    >
      <img
        src={caso.foto}
        alt={`Local ${caso.nombre} usando DishHub`}
        loading="lazy"
        className="w-full aspect-[4/3] object-cover block"
        style={{ borderRadius: 0 }}
        onError={(e) => {
          const img = e.currentTarget;
          img.style.display = "none";
          const parent = img.parentElement;
          if (parent) parent.style.background = "var(--color-obsidiana, #0d0d0d)";
        }}
      />
      <div className="p-6">
        <h3 className="font-display text-lg font-extrabold uppercase text-[var(--color-text)] mb-2">
          {caso.nombre}
        </h3>
        <p className="font-sans text-sm text-[#a0a0a0] leading-relaxed mb-4">{caso.desc}</p>
        <div className="font-mono-tech text-[11px] uppercase tracking-widest text-[var(--color-accent)]">
          {caso.tag}
        </div>
      </div>
    </div>
  );
}

export function CasosReales() {
  return (
    <section className="border-b border-[var(--color-border)]">
      <div className="mx-auto max-w-7xl px-6 py-24">
        <div className="reveal text-center mb-16">
          <div className="font-mono-tech text-xs uppercase tracking-widest text-[var(--color-muted)] mb-4">
            // casos reales · ya funciona en
          </div>
          <h2 className="font-display text-3xl sm:text-5xl font-extrabold text-[var(--color-text)] leading-[1.05]">
            LOCALES QUE YA DEJARON EL PDF ATRÁS.
          </h2>
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {CASOS.map((caso) => (
            <CasoCard key={caso.nombre} caso={caso} />
          ))}
        </div>
      </div>
    </section>
  );
}
