import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useRef, useState } from "react";
import { Calendar, Clock, MessageCircle, Globe2, ArrowLeft, ArrowRight } from "lucide-react";
import { SimpleNav, Preloader, useReveal, whatsappHref } from "@/components/site";
import { track } from "@/lib/analytics";
import {
  BOOKING_CONFIG,
  dayHasAvailability,
  findFirstAvailableDay,
  getAvailableSlots,
  formatWeekdayLong,
  formatDateLong,
  formatTimeRange,
  normalizeWhatsAppAR,
  persistBooking,
  readBookedSlots,
  saveDemoBookingLead,
  type TableCount,
  type DemoBooking,
} from "@/lib/booking";

/** Crossfade suave: al cambiar `contentKey`, primero desvanece el contenido
 * anterior y recién ahí monta el nuevo, en vez de reemplazarlo de golpe. */
function Crossfade({ contentKey, children }: { contentKey: string; children: React.ReactNode }) {
  const [displayKey, setDisplayKey] = useState(contentKey);
  const [phase, setPhase] = useState<"in" | "out">("in");
  const frozenRef = useRef(children);

  useEffect(() => {
    if (contentKey === displayKey) return;
    setPhase("out");
    const t = setTimeout(() => {
      setDisplayKey(contentKey);
      setPhase("in");
    }, 180);
    return () => clearTimeout(t);
  }, [contentKey, displayKey]);

  // Mientras estamos "en" la key actual, mantenemos siempre el children más
  // fresco (por si cambian props sin cambiar de key). Al salir, frozenRef ya
  // quedó con el último contenido de la key anterior para mostrarlo durante el fade-out.
  if (displayKey === contentKey) {
    frozenRef.current = children;
  }

  const shown = phase === "out" ? frozenRef.current : children;

  return (
    <div
      style={{
        transition: "opacity 180ms ease, transform 180ms ease",
        opacity: phase === "out" ? 0 : 1,
        transform: phase === "out" ? "translateY(6px)" : "translateY(0)",
      }}
    >
      {shown}
    </div>
  );
}

export const Route = createFileRoute("/agendar")({
  head: () => ({
    meta: [
      { title: "Agendá una demo | DISHub" },
      { name: "description", content: "Agendá una demo en vivo de DISHub, 30 minutos, sin compromiso. Te confirmamos al instante por WhatsApp." },
      { property: "og:title", content: "Agendá una demo | DISHub" },
      { property: "og:url", content: "https://getdishub.app/agendar" },
    ],
    links: [{ rel: "canonical", href: "https://getdishub.app/agendar" }],
  }),
  component: AgendarPage,
});

const WEEKDAY_LABELS = ["LU", "MA", "MI", "JU", "VI", "SA", "DO"];
const MONTH_LABELS = [
  "Enero", "Febrero", "Marzo", "Abril", "Mayo", "Junio",
  "Julio", "Agosto", "Septiembre", "Octubre", "Noviembre", "Diciembre",
];

function daysInMonth(year: number, month1to12: number) {
  return new Date(year, month1to12, 0).getDate();
}

/** 0 = lunes ... 6 = domingo, para alinear la grilla con el header LU..DO */
function mondayIndexOfFirstDay(year: number, month1to12: number) {
  const jsDay = new Date(year, month1to12 - 1, 1).getDay(); // 0=domingo
  return (jsDay + 6) % 7;
}

function Toast({ message }: { message: string }) {
  return (
    <div
      className="fixed left-1/2 bottom-8 -translate-x-1/2 z-[200] font-sans text-sm px-5 py-3"
      style={{ background: "#0d0d0d", color: "#f5f0e8", border: "2px solid var(--color-accent)", boxShadow: "4px 4px 0 var(--color-accent-shadow)" }}
    >
      {message}
    </div>
  );
}

function MonthCalendar({
  year, month, bookings, selected, onSelectDay,
}: {
  year: number; month: number; bookings: DemoBooking[];
  selected: { y: number; m: number; d: number } | null;
  onSelectDay: (d: { y: number; m: number; d: number }) => void;
}) {
  const total = daysInMonth(year, month);
  const offset = mondayIndexOfFirstDay(year, month);
  const cells: Array<{ d: number; available: boolean } | null> = [];
  for (let i = 0; i < offset; i++) cells.push(null);
  for (let d = 1; d <= total; d++) {
    cells.push({ d, available: dayHasAvailability(year, month, d, bookings) });
  }

  return (
    <div>
      <div className="grid grid-cols-7 gap-1 mb-1.5">
        {WEEKDAY_LABELS.map((w) => (
          <div key={w} className="font-mono-tech text-[9px] uppercase tracking-widest text-(--color-muted) text-center py-1">
            {w}
          </div>
        ))}
      </div>
      <div className="grid grid-cols-7 gap-1">
        {cells.map((cell, i) => {
          if (!cell) return <div key={`empty-${i}`} />;
          const isSelected = selected && selected.y === year && selected.m === month && selected.d === cell.d;
          return (
            <button
              key={cell.d}
              type="button"
              disabled={!cell.available}
              onClick={() => onSelectDay({ y: year, m: month, d: cell.d })}
              className="h-9 sm:h-10 font-display text-xs sm:text-sm font-bold transition-colors"
              style={{
                background: isSelected ? "var(--color-accent)" : "transparent",
                color: !cell.available ? "#3a3a3a" : isSelected ? "var(--color-bg)" : "var(--color-text)",
                border: `1px solid ${isSelected ? "var(--color-accent)" : "var(--color-border)"}`,
                cursor: cell.available ? "pointer" : "not-allowed",
              }}
            >
              {cell.d}
            </button>
          );
        })}
      </div>
    </div>
  );
}

function ScreenA({
  bookings, month, onMonthChange, selectedDay, onSelectDay, selectedSlot, onSelectSlot, onContinue,
}: {
  bookings: DemoBooking[];
  month: { y: number; m: number };
  onMonthChange: (m: { y: number; m: number }) => void;
  selectedDay: { y: number; m: number; d: number } | null;
  onSelectDay: (d: { y: number; m: number; d: number }) => void;
  selectedSlot: string | null;
  onSelectSlot: (iso: string) => void;
  onContinue: () => void;
}) {
  const today = new Date();
  const isCurrentMonth = month.y === today.getFullYear() && month.m === today.getMonth() + 1;
  const maxDate = new Date(today.getTime() + BOOKING_CONFIG.maxAdvanceDays * 24 * 60 * 60_000);
  const isMaxMonth = month.y === maxDate.getFullYear() && month.m === maxDate.getMonth() + 1;

  const slots = selectedDay
    ? getAvailableSlots(selectedDay.y, selectedDay.m, selectedDay.d, bookings)
    : [];

  return (
    <div>
      <div className="flex items-center justify-between mb-3">
        <button
          type="button"
          disabled={isCurrentMonth}
          onClick={() => onMonthChange(month.m === 1 ? { y: month.y - 1, m: 12 } : { y: month.y, m: month.m - 1 })}
          className="font-display text-lg px-2 disabled:opacity-30"
          style={{ color: "var(--color-accent)" }}
          aria-label="Mes anterior"
        >
          ‹
        </button>
        <div className="font-display font-bold uppercase tracking-wide text-(--color-text)">
          {MONTH_LABELS[month.m - 1]} {month.y}
        </div>
        <button
          type="button"
          disabled={isMaxMonth}
          onClick={() => onMonthChange(month.m === 12 ? { y: month.y + 1, m: 1 } : { y: month.y, m: month.m + 1 })}
          className="font-display text-lg px-2 disabled:opacity-30"
          style={{ color: "var(--color-accent)" }}
          aria-label="Mes siguiente"
        >
          ›
        </button>
      </div>

      <Crossfade contentKey={`calendar-${month.y}-${month.m}`}>
        <MonthCalendar year={month.y} month={month.m} bookings={bookings} selected={selectedDay} onSelectDay={onSelectDay} />
      </Crossfade>

      {selectedDay && (
        <Crossfade contentKey={`day-${selectedDay.y}-${selectedDay.m}-${selectedDay.d}`}>
          <div className="mt-4">
            <div className="font-mono-tech text-[10px] uppercase tracking-widest text-(--color-muted) mb-3">
              Horarios disponibles
            </div>
            {slots.length === 0 ? (
              <p className="font-sans text-sm text-(--color-muted)">No hay horarios libres ese día.</p>
            ) : (
              <div className="grid grid-cols-3 sm:grid-cols-4 gap-2">
                {slots.map((iso) => {
                  const isSelected = selectedSlot === iso;
                  return (
                    <button
                      key={iso}
                      type="button"
                      onClick={() => onSelectSlot(iso)}
                      className="font-mono-tech text-xs py-2 transition-colors"
                      style={{
                        background: isSelected ? "var(--color-accent)" : "transparent",
                        color: isSelected ? "var(--color-bg)" : "var(--color-text)",
                        border: `1px solid ${isSelected ? "var(--color-accent)" : "var(--color-border)"}`,
                      }}
                    >
                      {formatTimeRange(iso, BOOKING_CONFIG.slotDurationMin).split("–")[0]}
                    </button>
                  );
                })}
              </div>
            )}
          </div>
        </Crossfade>
      )}

      {selectedSlot && (
        <button
          type="button"
          onClick={onContinue}
          className="fade-slide-in mt-4 w-full inline-flex items-center justify-center gap-2 font-display font-extrabold uppercase tracking-wide text-sm py-3 transition-all hover:-translate-y-0.5"
          style={{ background: "var(--color-accent)", color: "var(--color-bg)", boxShadow: "4px 4px 0 var(--color-accent-shadow)" }}
        >
          Continuar <ArrowRight size={16} />
        </button>
      )}
    </div>
  );
}

function SummaryRow({ icon, children }: { icon: React.ReactNode; children: React.ReactNode }) {
  return (
    <div className="flex items-start gap-3 text-sm font-sans text-(--color-text)">
      <span className="shrink-0 mt-0.5 text-(--color-accent)">{icon}</span>
      <span>{children}</span>
    </div>
  );
}

function ScreenB({
  slot, onBack, onConfirm, submitting,
}: {
  slot: string;
  onBack: () => void;
  onConfirm: (data: { name: string; restaurantName: string; whatsapp: string; email: string; tableCount: TableCount | ""; notes: string }) => void;
  submitting: boolean;
}) {
  const [name, setName] = useState("");
  const [restaurantName, setRestaurantName] = useState("");
  const [whatsapp, setWhatsapp] = useState("");
  const [email, setEmail] = useState("");
  const [tableCount, setTableCount] = useState<TableCount | "">("");
  const [notes, setNotes] = useState("");

  const canSubmit = name.trim() && restaurantName.trim() && whatsapp.trim();

  return (
    <div className="grid md:grid-cols-2 gap-10">
      <div>
        <div className="font-display text-xl font-extrabold uppercase tracking-tight text-(--color-text) mb-3">
          DIS<span className="text-(--color-accent)">Hub</span>
        </div>
        <div
          className="inline-block font-mono-tech text-[10px] uppercase tracking-widest text-(--color-accent) px-2.5 py-1 mb-4"
          style={{ border: "1px solid var(--color-accent)" }}
        >
          // Demo en vivo
        </div>
        <h3 className="font-display text-lg font-bold text-(--color-text) mb-2">Demo de DISHub</h3>
        <p className="font-sans text-sm text-(--color-muted) mb-6 leading-relaxed">
          Te mostramos la plataforma funcionando con la carta de tu local.
        </p>
        <div className="space-y-3">
          <SummaryRow icon={<Calendar size={16} />}>
            {formatWeekdayLong(slot)}, {formatDateLong(slot)} · {formatTimeRange(slot, BOOKING_CONFIG.slotDurationMin)}
          </SummaryRow>
          <SummaryRow icon={<Clock size={16} />}>{BOOKING_CONFIG.slotDurationMin} min</SummaryRow>
          <SummaryRow icon={<MessageCircle size={16} />}>Por videollamada o WhatsApp — coordinamos por WhatsApp</SummaryRow>
          <SummaryRow icon={<Globe2 size={16} />}>Hora de Argentina</SummaryRow>
        </div>
      </div>

      <form
        onSubmit={(e) => {
          e.preventDefault();
          if (!canSubmit) return;
          onConfirm({ name, restaurantName, whatsapp, email, tableCount, notes });
        }}
      >
        <div className="space-y-4">
          <div>
            <label className="font-mono-tech text-[10px] uppercase tracking-widest text-(--color-muted) block mb-1.5">Nombre*</label>
            <input
              required value={name} onChange={(e) => setName(e.target.value)}
              className="w-full font-sans text-sm px-3 py-2.5 bg-transparent text-(--color-text)"
              style={{ border: "1px solid var(--color-border)" }}
            />
          </div>
          <div>
            <label className="font-mono-tech text-[10px] uppercase tracking-widest text-(--color-muted) block mb-1.5">Nombre del local*</label>
            <input
              required value={restaurantName} onChange={(e) => setRestaurantName(e.target.value)}
              className="w-full font-sans text-sm px-3 py-2.5 bg-transparent text-(--color-text)"
              style={{ border: "1px solid var(--color-border)" }}
            />
          </div>
          <div>
            <label className="font-mono-tech text-[10px] uppercase tracking-widest text-(--color-muted) block mb-1.5">WhatsApp*</label>
            <input
              required value={whatsapp} onChange={(e) => setWhatsapp(e.target.value)}
              placeholder="Ej: 11 2345 6789"
              className="w-full font-sans text-sm px-3 py-2.5 bg-transparent text-(--color-text) placeholder:text-(--color-muted)"
              style={{ border: "1px solid var(--color-border)" }}
            />
          </div>
          <div>
            <label className="font-mono-tech text-[10px] uppercase tracking-widest text-(--color-muted) block mb-1.5">Email (opcional)</label>
            <input
              type="email" value={email} onChange={(e) => setEmail(e.target.value)}
              className="w-full font-sans text-sm px-3 py-2.5 bg-transparent text-(--color-text)"
              style={{ border: "1px solid var(--color-border)" }}
            />
          </div>
          <div>
            <label className="font-mono-tech text-[10px] uppercase tracking-widest text-(--color-muted) block mb-1.5">¿Cuántas mesas tiene tu local?</label>
            <select
              value={tableCount} onChange={(e) => setTableCount(e.target.value as TableCount | "")}
              className="w-full font-sans text-sm px-3 py-2.5 bg-transparent text-(--color-text)"
              style={{ border: "1px solid var(--color-border)" }}
            >
              <option value="" style={{ color: "#000" }}>Elegir…</option>
              <option value="1-10" style={{ color: "#000" }}>1-10</option>
              <option value="11-20" style={{ color: "#000" }}>11-20</option>
              <option value="21-30" style={{ color: "#000" }}>21-30</option>
              <option value="30+" style={{ color: "#000" }}>+30</option>
            </select>
          </div>
          <div>
            <label className="font-mono-tech text-[10px] uppercase tracking-widest text-(--color-muted) block mb-1.5">¿Algo que quieras que veamos en la demo?</label>
            <textarea
              value={notes} onChange={(e) => setNotes(e.target.value)}
              placeholder="Ej: reservas, pedidos desde la mesa, la carta..."
              rows={3}
              className="w-full font-sans text-sm px-3 py-2.5 bg-transparent text-(--color-text) placeholder:text-(--color-muted) resize-none"
              style={{ border: "1px solid var(--color-border)" }}
            />
          </div>
        </div>

        <div className="flex gap-3 mt-6">
          <button
            type="button" onClick={onBack}
            className="inline-flex items-center justify-center gap-2 font-display font-extrabold uppercase tracking-wide text-sm py-3 px-5 transition-all"
            style={{ background: "transparent", color: "var(--color-text)", border: "1px solid var(--color-border)" }}
          >
            <ArrowLeft size={16} /> Atrás
          </button>
          <button
            type="submit" disabled={!canSubmit || submitting}
            className="flex-1 inline-flex items-center justify-center gap-2 font-display font-extrabold uppercase tracking-wide text-sm py-3 transition-all disabled:opacity-50"
            style={{ background: "var(--color-accent)", color: "var(--color-bg)", boxShadow: "4px 4px 0 var(--color-accent-shadow)" }}
          >
            {submitting ? "Confirmando…" : "Confirmar demo"}
          </button>
        </div>
        <p className="font-mono-tech text-[10px] text-(--color-muted) mt-4">
          Usamos tus datos solo para coordinar la demo.
        </p>
      </form>
    </div>
  );
}

function ScreenSuccess({ name, slot, whatsappUrl }: { name: string; slot: string; whatsappUrl: string }) {
  return (
    <div className="py-10 text-center">
      <h3 className="font-display text-2xl font-extrabold text-(--color-text) mb-4">
        ✓ LISTO, {name.toUpperCase()}.
      </h3>
      <p className="font-sans text-(--color-muted) leading-relaxed mb-6">
        Demo agendada para el {formatDateLong(slot)} a las {formatTimeRange(slot, BOOKING_CONFIG.slotDurationMin).split("–")[0]}.<br />
        Te abrimos WhatsApp para que confirmemos ahí mismo 👀
      </p>
      <a
        href={whatsappUrl}
        target="_blank"
        rel="noopener"
        onClick={() => track("whatsapp_click", { origen: "agendar" })}
        className="inline-flex items-center justify-center gap-2 font-display font-extrabold uppercase tracking-wide text-sm py-3 px-6 transition-all hover:-translate-y-0.5"
        style={{ background: "var(--color-accent)", color: "var(--color-bg)", boxShadow: "4px 4px 0 var(--color-accent-shadow)" }}
      >
        Abrir WhatsApp <ArrowRight size={16} />
      </a>
      <p className="font-mono-tech text-[10px] text-(--color-muted) mt-4">
        ¿No se abrió solo? Tocá el botón.
      </p>
    </div>
  );
}

function AgendarPage() {
  useReveal();
  const [ready, setReady] = useState(false);

  const today = new Date();
  const [month, setMonth] = useState({ y: today.getFullYear(), m: today.getMonth() + 1 });
  const [selectedDay, setSelectedDay] = useState<{ y: number; m: number; d: number } | null>(null);
  const [selectedSlot, setSelectedSlot] = useState<string | null>(null);
  const [screen, setScreen] = useState<"A" | "B" | "success">("A");
  const [submitting, setSubmitting] = useState(false);
  const [toast, setToast] = useState<string | null>(null);
  const [confirmedName, setConfirmedName] = useState("");
  const [confirmedWhatsappUrl, setConfirmedWhatsappUrl] = useState("");
  const [bookings, setBookings] = useState<DemoBooking[]>([]);

  useEffect(() => {
    const booked = readBookedSlots();
    setBookings(booked);
    const firstAvailable = findFirstAvailableDay(booked);
    if (firstAvailable) {
      setSelectedDay(firstAvailable);
      setMonth({ y: firstAvailable.y, m: firstAvailable.m });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (!toast) return;
    const t = setTimeout(() => setToast(null), 4000);
    return () => clearTimeout(t);
  }, [toast]);

  const handleConfirm = (data: { name: string; restaurantName: string; whatsapp: string; email: string; tableCount: TableCount | ""; notes: string }) => {
    if (!selectedSlot) return;
    setSubmitting(true);
    const booking: DemoBooking = {
      scheduledAt: selectedSlot,
      name: data.name,
      restaurantName: data.restaurantName,
      whatsapp: normalizeWhatsAppAR(data.whatsapp),
      email: data.email || undefined,
      tableCount: data.tableCount || undefined,
      notes: data.notes || undefined,
    };
    const ok = persistBooking(booking);
    setSubmitting(false);
    if (!ok) {
      setBookings(readBookedSlots());
      setSelectedSlot(null);
      setScreen("A");
      setToast("Ese horario se acaba de ocupar, elegí otro.");
      return;
    }
    void saveDemoBookingLead(booking);

    const message = [
      "Hola! Quiero confirmar mi demo de DISHub 👋",
      "",
      `📅 ${formatWeekdayLong(selectedSlot)}, ${formatDateLong(selectedSlot)} · ${formatTimeRange(selectedSlot, BOOKING_CONFIG.slotDurationMin)}`,
      `Local: ${data.restaurantName}`,
      `Nombre: ${data.name}`,
      data.tableCount ? `Mesas: ${data.tableCount}` : null,
      data.notes ? `Quiero ver: ${data.notes}` : null,
    ].filter(Boolean).join("\n");
    const url = whatsappHref(message);

    setConfirmedName(data.name);
    setConfirmedWhatsappUrl(url);
    setScreen("success");
    track("whatsapp_click", { origen: "agendar" });
    window.open(url, "_blank", "noopener");
  };

  return (
    <div className="min-h-screen bg-(--color-bg) text-(--color-text)">
      {!ready && <Preloader onDone={() => setReady(true)} />}
      <SimpleNav badge="// Agendar demo" />

      <section className="mx-auto max-w-7xl px-6 py-10 lg:py-16 grid lg:grid-cols-5 gap-14">
        <div className="reveal lg:col-span-2">
          <div
            className="inline-block font-mono-tech text-[11px] uppercase tracking-widest text-(--color-accent) px-3 py-1 mb-8"
            style={{ border: "2px solid var(--color-accent)" }}
          >
            // Demo en vivo · 30 min
          </div>
          <h1 className="font-display font-extrabold text-(--color-text) leading-[0.95] text-[38px] sm:text-5xl mb-6">
            AGENDÁ TU DEMO.
          </h1>
          <p className="font-sans text-lg text-(--color-muted) mb-8 leading-relaxed">
            Te mostramos DISHub funcionando con la carta de tu local. Sin compromiso.
          </p>
          <ul className="space-y-2">
            {["30 minutos", "Por videollamada o WhatsApp", "Te confirmamos al instante por WhatsApp"].map((b) => (
              <li key={b} className="flex items-start gap-2 font-mono-tech text-xs text-(--color-text)">
                <span className="text-(--color-accent)">→</span> {b}
              </li>
            ))}
          </ul>
          <a
            href="mailto:hola@getdishub.app?subject=Quiero%20agendar%20una%20demo"
            onClick={() => track("email_click", { origen: "agendar" })}
            className="inline-block font-mono-tech text-xs uppercase tracking-widest text-(--color-muted) hover:text-(--color-accent) transition-colors mt-6"
          >
            ¿Preferís escribirnos? hola@getdishub.app →
          </a>
        </div>

        <div className="reveal lg:col-span-3">
          <div className="p-5 sm:p-7" style={{ background: "var(--color-surface)", border: "2px solid var(--color-border)" }}>
          <Crossfade contentKey={screen}>
            {screen === "A" && (
              <ScreenA
                bookings={bookings}
                month={month}
                onMonthChange={setMonth}
                selectedDay={selectedDay}
                onSelectDay={(d) => { setSelectedDay(d); setSelectedSlot(null); }}
                selectedSlot={selectedSlot}
                onSelectSlot={setSelectedSlot}
                onContinue={() => setScreen("B")}
              />
            )}
            {screen === "B" && selectedSlot && (
              <ScreenB
                slot={selectedSlot}
                onBack={() => setScreen("A")}
                onConfirm={handleConfirm}
                submitting={submitting}
              />
            )}
            {screen === "success" && selectedSlot && (
              <ScreenSuccess name={confirmedName} slot={selectedSlot} whatsappUrl={confirmedWhatsappUrl} />
            )}
          </Crossfade>
          </div>
        </div>
      </section>

      {toast && <Toast message={toast} />}
    </div>
  );
}
