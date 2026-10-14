/**
 * Lógica de agendamiento de demos — MOCK de frontend, sin backend real.
 *
 * En producción esto vive server-side (Drizzle + Postgres, con verificación
 * transaccional de colisión). Acá simulamos lo mismo en el cliente usando
 * localStorage como "base de datos" de reservas confirmadas, para que la UI
 * completa (calendario, slots, anti doble-booking best-effort) sea funcional
 * sin backend. Reemplazar `readBookedSlots`/`persistBooking` por llamadas
 * reales a la API el día que exista un backend.
 */

export type TableCount = "1-10" | "11-20" | "21-30" | "30+";

export type DemoBooking = {
  scheduledAt: string; // ISO instant (UTC)
  name: string;
  restaurantName: string;
  whatsapp: string;
  email?: string;
  tableCount?: TableCount;
  notes?: string;
};

export type BookingConfig = {
  weeklyAvailability: Partial<Record<Weekday, Array<[string, string]>>>;
  slotDurationMin: number;
  bufferMin: number;
  minNoticeHours: number;
  maxAdvanceDays: number;
  blockedDates: string[]; // "YYYY-MM-DD"
};

type Weekday = "sun" | "mon" | "tue" | "wed" | "thu" | "fri" | "sat";

const WEEKDAYS: Weekday[] = ["sun", "mon", "tue", "wed", "thu", "fri", "sat"];

export const AR_TZ = "America/Argentina/Buenos_Aires";
// Argentina no tiene horario de verano desde 2009: offset fijo UTC-3.
const AR_UTC_OFFSET_HOURS = 3;

export const BOOKING_CONFIG: BookingConfig = {
  weeklyAvailability: {
    mon: [["10:00", "13:00"], ["15:00", "19:00"]],
    tue: [["10:00", "13:00"], ["15:00", "19:00"]],
    wed: [["10:00", "13:00"], ["15:00", "19:00"]],
    thu: [["10:00", "13:00"], ["15:00", "19:00"]],
    fri: [["10:00", "13:00"], ["15:00", "19:00"]],
  },
  slotDurationMin: 30,
  bufferMin: 15,
  minNoticeHours: 3,
  maxAdvanceDays: 21,
  blockedDates: [],
};

/** Combina una fecha/hora "de pared" en horario argentino a un instante UTC real. */
export function arWallTimeToUTC(year: number, month1to12: number, day: number, hour: number, minute: number): Date {
  return new Date(Date.UTC(year, month1to12 - 1, day, hour + AR_UTC_OFFSET_HOURS, minute));
}

export function dateKey(year: number, month1to12: number, day: number): string {
  return `${year}-${String(month1to12).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
}

function parseHM(hm: string): [number, number] {
  const [h, m] = hm.split(":").map(Number);
  return [h, m];
}

/**
 * Genera los horarios de inicio de slot para un día dado, en base a la
 * disponibilidad semanal configurada. No aplica todavía notice/advance/
 * bloqueos/colisiones — eso lo hace `getAvailableSlots`.
 */
function generateDaySlots(year: number, month1to12: number, day: number, config: BookingConfig): Date[] {
  const weekday = WEEKDAYS[new Date(Date.UTC(year, month1to12 - 1, day)).getUTCDay()];
  const ranges = config.weeklyAvailability[weekday];
  if (!ranges || ranges.length === 0) return [];

  const slots: Date[] = [];
  for (const [start, end] of ranges) {
    const [startH, startM] = parseHM(start);
    const [endH, endM] = parseHM(end);
    let cursor = arWallTimeToUTC(year, month1to12, day, startH, startM);
    const rangeEnd = arWallTimeToUTC(year, month1to12, day, endH, endM);
    while (cursor.getTime() + config.slotDurationMin * 60_000 <= rangeEnd.getTime()) {
      slots.push(new Date(cursor));
      cursor = new Date(cursor.getTime() + config.slotDurationMin * 60_000);
    }
  }
  return slots;
}

function slotsCollide(aStart: Date, aEnd: Date, bStart: Date, bEnd: Date): boolean {
  return aStart.getTime() < bEnd.getTime() && bStart.getTime() < aEnd.getTime();
}

/**
 * Devuelve los slots realmente disponibles para el día dado (array de ISO
 * strings, inicio del slot en UTC), aplicando:
 * 1. Disponibilidad semanal
 * 2. Fechas bloqueadas
 * 3. Anticipación mínima (min_notice_hours) y ventana máxima (max_advance_days)
 * 4. Colisión con reservas confirmadas existentes (+ buffer)
 */
export function getAvailableSlots(
  year: number,
  month1to12: number,
  day: number,
  existingBookings: DemoBooking[],
  config: BookingConfig = BOOKING_CONFIG,
  now: Date = new Date(),
): string[] {
  const key = dateKey(year, month1to12, day);
  if (config.blockedDates.includes(key)) return [];

  const earliestAllowed = new Date(now.getTime() + config.minNoticeHours * 60 * 60_000);
  const latestAllowed = new Date(now.getTime() + config.maxAdvanceDays * 24 * 60 * 60_000);

  const bufferMs = config.bufferMin * 60_000;
  const durationMs = config.slotDurationMin * 60_000;

  const candidates = generateDaySlots(year, month1to12, day, config);

  return candidates
    .filter((slotStart) => slotStart.getTime() >= earliestAllowed.getTime())
    .filter((slotStart) => slotStart.getTime() <= latestAllowed.getTime())
    .filter((slotStart) => {
      const slotEnd = new Date(slotStart.getTime() + durationMs);
      const slotStartBuffered = new Date(slotStart.getTime() - bufferMs);
      const slotEndBuffered = new Date(slotEnd.getTime() + bufferMs);
      return !existingBookings.some((b) => {
        if (b.scheduledAt === undefined) return false;
        const bStart = new Date(b.scheduledAt);
        const bEnd = new Date(bStart.getTime() + config.slotDurationMin * 60_000);
        return slotsCollide(slotStartBuffered, slotEndBuffered, bStart, bEnd);
      });
    })
    .map((d) => d.toISOString());
}

/** Un día "tiene disponibilidad" si generaría al menos un slot libre. Se usa para pintar el calendario. */
export function dayHasAvailability(
  year: number,
  month1to12: number,
  day: number,
  existingBookings: DemoBooking[],
  config: BookingConfig = BOOKING_CONFIG,
  now: Date = new Date(),
): boolean {
  return getAvailableSlots(year, month1to12, day, existingBookings, config, now).length > 0;
}

/** Busca el primer día (desde hoy, en calendario AR) con al menos un slot libre, dentro de max_advance_days. */
export function findFirstAvailableDay(
  existingBookings: DemoBooking[],
  config: BookingConfig = BOOKING_CONFIG,
  now: Date = new Date(),
): { y: number; m: number; d: number } | null {
  const arAnchor = new Date(now.getTime() - AR_UTC_OFFSET_HOURS * 3600_000);
  for (let offset = 0; offset <= config.maxAdvanceDays + 1; offset++) {
    const candidate = new Date(arAnchor.getTime() + offset * 24 * 60 * 60_000);
    const y = candidate.getUTCFullYear();
    const m = candidate.getUTCMonth() + 1;
    const d = candidate.getUTCDate();
    if (dayHasAvailability(y, m, d, existingBookings, config, now)) return { y, m, d };
  }
  return null;
}

/* ---------- formatting (siempre en TZ Argentina) ---------- */

export function formatWeekdayLong(iso: string): string {
  return new Intl.DateTimeFormat("es-AR", { weekday: "long", timeZone: AR_TZ }).format(new Date(iso));
}

export function formatDateLong(iso: string): string {
  return new Intl.DateTimeFormat("es-AR", { day: "numeric", month: "long", year: "numeric", timeZone: AR_TZ }).format(new Date(iso));
}

export function formatTime(iso: string): string {
  return new Intl.DateTimeFormat("es-AR", { hour: "2-digit", minute: "2-digit", hour12: false, timeZone: AR_TZ }).format(new Date(iso));
}

export function formatTimeRange(iso: string, durationMin: number): string {
  const end = new Date(new Date(iso).getTime() + durationMin * 60_000).toISOString();
  return `${formatTime(iso)}–${formatTime(end)}hs`;
}

/* ---------- WhatsApp ---------- */

/**
 * Normaliza números argentinos comunes (11 2345 6789, 15 2345 6789,
 * +54 9 11 2345 6789, etc.) a E.164 (+549...). Best-effort: si ya viene
 * en +549 lo deja igual; si no reconoce el formato, devuelve solo dígitos
 * con "+" adelante para no perder el dato.
 */
export function normalizeWhatsAppAR(raw: string): string {
  let digits = raw.replace(/[^\d]/g, "");
  if (digits.startsWith("00")) digits = digits.slice(2);
  if (digits.startsWith("549")) return `+${digits}`;
  if (digits.startsWith("54")) return `+549${digits.slice(2)}`;
  if (digits.startsWith("15")) return `+549${"11"}${digits.slice(2)}`; // 15xxxxxxxx sin código de área -> asume 11 (Bs As)
  if (digits.startsWith("9")) return `+54${digits}`;
  return `+549${digits}`;
}

/* ---------- localStorage: reservas confirmadas (mock de "DB") ---------- */

const STORAGE_KEY = "dishub_demo_bookings";

export function readBookedSlots(): DemoBooking[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    return raw ? (JSON.parse(raw) as DemoBooking[]) : [];
  } catch {
    return [];
  }
}

/**
 * Guarda el lead en Supabase (tabla `demo_bookings`), server-side y
 * verdadero — a diferencia de `persistBooking`, que solo simula la
 * anti-colisión local. Best-effort: si falla, no bloquea el flujo de
 * WhatsApp (el usuario no debe notar un error de red acá), pero si
 * funciona el lead queda registrado aunque nunca llegue a mandar el
 * mensaje de WhatsApp.
 */
export async function saveDemoBookingLead(booking: DemoBooking): Promise<void> {
  const { supabase } = await import("@/lib/supabase");
  const { error } = await supabase.from("demo_bookings").insert({
    scheduled_at: booking.scheduledAt,
    name: booking.name,
    restaurant_name: booking.restaurantName,
    whatsapp: booking.whatsapp,
    email: booking.email ?? null,
    table_count: booking.tableCount ?? null,
    notes: booking.notes ?? null,
  });
  if (error) {
    // eslint-disable-next-line no-console
    console.error("No se pudo guardar el lead en Supabase:", error.message);
  }
}

/**
 * Simula la verificación transaccional server-side: vuelve a leer el
 * estado justo antes de escribir y rechaza si alguien tomó el slot.
 * Devuelve `false` si hubo colisión (slot ya no disponible).
 */
export function persistBooking(booking: DemoBooking): boolean {
  const existing = readBookedSlots();
  const durationMs = BOOKING_CONFIG.slotDurationMin * 60_000;
  const bufferMs = BOOKING_CONFIG.bufferMin * 60_000;
  const newStart = new Date(booking.scheduledAt);
  const newEnd = new Date(newStart.getTime() + durationMs);
  const collides = existing.some((b) => {
    const bStart = new Date(b.scheduledAt);
    const bEnd = new Date(bStart.getTime() + durationMs);
    return slotsCollide(
      new Date(newStart.getTime() - bufferMs),
      new Date(newEnd.getTime() + bufferMs),
      bStart,
      bEnd,
    );
  });
  if (collides) return false;
  existing.push(booking);
  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(existing));
  return true;
}
