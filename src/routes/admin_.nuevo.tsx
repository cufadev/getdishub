import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { createServerFn } from "@tanstack/react-start";
import { createClient } from "@supabase/supabase-js";
import { useEffect, useState } from "react";
import { ArrowLeft, ArrowRight, Copy, Check } from "lucide-react";
import { SimpleNav } from "@/components/site";
import { useRole } from "@/lib/auth";
import { supabase } from "@/lib/supabase";
import { onboardingItemsForPlan } from "@/lib/onboarding";

const PLANS = ["menu_digital", "starter", "pro", "table_hub"] as const;
type Plan = (typeof PLANS)[number];

const SLUG_RE = /^[a-z0-9-]+$/;
const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

function getSupabaseAdmin() {
  const url = import.meta.env.VITE_SUPABASE_URL;
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !serviceRoleKey) {
    throw new Error("Faltan VITE_SUPABASE_URL o SUPABASE_SERVICE_ROLE_KEY en el entorno del servidor.");
  }
  return createClient(url, serviceRoleKey, { auth: { autoRefreshToken: false, persistSession: false } });
}

function getSupabaseAnon() {
  const url = import.meta.env.VITE_SUPABASE_URL;
  const anonKey = import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY;
  return createClient(url, anonKey, { auth: { autoRefreshToken: false, persistSession: false } });
}

async function assertSuperadmin(accessToken: string) {
  const anon = getSupabaseAnon();
  const { data, error } = await anon.auth.getUser(accessToken);
  if (error || !data.user) {
    throw new Error("403: Sesión inválida.");
  }
  const role = data.user.app_metadata?.role;
  if (role !== "superadmin") {
    throw new Error("403: No tenés permiso para hacer esto.");
  }
}

const createVenueAndOwner = createServerFn({ method: "POST" })
  .inputValidator(
    (data: { accessToken: string; name: string; slug: string; email: string; plan: Plan; siteUrl: string }) => data,
  )
  .handler(async ({ data }) => {
    await assertSuperadmin(data.accessToken);

    const name = data.name.trim();
    const slug = data.slug.trim().toLowerCase();
    const email = data.email.trim().toLowerCase();
    const plan = data.plan;

    if (!name) throw new Error("422: El nombre es obligatorio.");
    if (!SLUG_RE.test(slug)) throw new Error("422: El slug solo puede tener minúsculas, números y guiones.");
    if (!EMAIL_RE.test(email)) throw new Error("422: El email no es válido.");
    if (!PLANS.includes(plan)) throw new Error("422: Plan inválido.");

    const admin = getSupabaseAdmin();

    const { data: existingVenue } = await admin.from("venues").select("id").eq("slug", slug).maybeSingle();
    if (existingVenue) {
      throw new Error("409: Ese slug ya está en uso.");
    }

    const { data: linkData, error: linkError } = await admin.auth.admin.generateLink({
      type: "invite",
      email,
      options: { redirectTo: `${data.siteUrl}/bienvenida` },
    });
    if (linkError || !linkData.user) {
      throw new Error(`500: No se pudo generar la invitación (${linkError?.message ?? "error desconocido"}).`);
    }

    const { data: venueData, error: venueError } = await admin
      .from("venues")
      .insert({ name, slug, plan })
      .select("id, name, slug, plan, status, created_at")
      .single();

    if (venueError || !venueData) {
      await admin.auth.admin.deleteUser(linkData.user.id);
      throw new Error(`500: No se pudo crear el venue (${venueError?.message ?? "error desconocido"}).`);
    }

    const { error: membershipError } = await admin
      .from("memberships")
      .insert({ user_id: linkData.user.id, venue_id: venueData.id, role: "owner" });

    if (membershipError) {
      await admin.from("venues").delete().eq("id", venueData.id);
      await admin.auth.admin.deleteUser(linkData.user.id);
      throw new Error(`500: No se pudo asociar el usuario al venue (${membershipError.message}).`);
    }

    const onboardingItems = onboardingItemsForPlan(plan).map((item) => ({ ...item, venue_id: venueData.id }));
    const { error: onboardingError } = await admin.from("onboarding_items").insert(onboardingItems);

    if (onboardingError) {
      // cascade: borrar el venue se lleva puestos memberships e items parciales
      await admin.from("venues").delete().eq("id", venueData.id);
      await admin.auth.admin.deleteUser(linkData.user.id);
      throw new Error(`500: No se pudo crear la checklist de onboarding (${onboardingError.message}).`);
    }

    return { venue: venueData, ownerEmail: email, inviteLink: linkData.properties.action_link };
  });

export const Route = createFileRoute("/admin_/nuevo")({
  head: () => ({
    meta: [
      { title: "Nuevo cliente | DISHub" },
      { name: "robots", content: "noindex, nofollow" },
    ],
  }),
  component: AdminNuevoPage,
});

const PLAN_LABELS: Record<string, string> = {
  menu_digital: "Menú Digital",
  starter: "Starter",
  pro: "PRO",
  table_hub: "Table Hub",
};

function slugify(value: string) {
  return value
    .toLowerCase()
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .replace(/[^a-z0-9\s-]/g, "")
    .trim()
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-");
}

function AdminNuevoPage() {
  const navigate = useNavigate();
  const { loading, isSuperadmin, session } = useRole();

  useEffect(() => {
    if (loading) return;
    if (!session) navigate({ to: "/login" });
    else if (!isSuperadmin) navigate({ to: "/dashboard", search: { venue: undefined } });
  }, [loading, session, isSuperadmin, navigate]);

  const [name, setName] = useState("");
  const [slug, setSlug] = useState("");
  const [slugTouched, setSlugTouched] = useState(false);
  const [email, setEmail] = useState("");
  const [plan, setPlan] = useState("starter");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [result, setResult] = useState<{ slug: string; inviteLink: string; email: string } | null>(null);
  const [copied, setCopied] = useState(false);

  const effectiveSlug = slugTouched ? slug : slugify(name);
  const slugValid = /^[a-z0-9-]+$/.test(effectiveSlug);
  const canSubmit = name.trim() && slugValid && email.trim() && !submitting;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!canSubmit) return;
    setSubmitting(true);
    setError("");

    const { data: sessionData } = await supabase.auth.getSession();
    const accessToken = sessionData.session?.access_token;
    if (!accessToken) {
      setError("Tu sesión expiró, volvé a iniciar sesión.");
      setSubmitting(false);
      return;
    }

    try {
      const res = await createVenueAndOwner({
        data: {
          accessToken,
          name: name.trim(),
          slug: effectiveSlug,
          email: email.trim(),
          plan: plan as any,
          siteUrl: window.location.origin,
        },
      });
      setResult({ slug: res.venue.slug, inviteLink: res.inviteLink, email: res.ownerEmail });
    } catch (err) {
      const msg = err instanceof Error ? err.message : String(err);
      setError(msg.replace(/^\d+:\s*/, ""));
    } finally {
      setSubmitting(false);
    }
  };

  const copyLink = () => {
    if (!result) return;
    navigator.clipboard.writeText(result.inviteLink);
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  };

  if (loading || !isSuperadmin) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ background: "var(--color-bg)" }}>
        <p className="font-mono-tech text-xs uppercase tracking-widest text-(--color-muted)">Cargando…</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen" style={{ background: "var(--color-bg)" }}>
      <SimpleNav badge="Panel admin" />

      <main className="mx-auto max-w-xl px-6 py-12">
        <a
          href="/admin"
          onClick={(e) => { e.preventDefault(); navigate({ to: "/admin" }); }}
          className="inline-flex items-center gap-2 font-mono-tech text-xs uppercase tracking-widest text-(--color-muted) hover:text-(--color-text) transition-colors mb-8"
        >
          <ArrowLeft size={14} /> Volver a venues
        </a>

        <h1 className="font-display text-2xl font-extrabold text-(--color-text) mb-8">Nuevo cliente</h1>

        {result ? (
          <div className="p-6" style={{ background: "var(--color-surface)", border: "1px solid var(--color-border)" }}>
            <p className="font-display font-bold text-(--color-text) mb-1">✓ Cliente creado</p>
            <p className="font-sans text-sm text-(--color-muted) mb-6">
              {result.slug}.getdishub.app
            </p>

            <div className="space-y-3 mb-6">
              <div>
                <div className="font-mono-tech text-[10px] uppercase tracking-widest text-(--color-muted) mb-1">Email</div>
                <div className="font-sans text-sm text-(--color-text)">{result.email}</div>
              </div>
              <div>
                <div className="font-mono-tech text-[10px] uppercase tracking-widest text-(--color-muted) mb-1">Link de invitación</div>
                <div className="flex items-center gap-2">
                  <code className="font-mono-tech text-xs text-(--color-accent) px-2 py-1.5 truncate" style={{ border: "1px solid var(--color-border)" }}>
                    {result.inviteLink}
                  </code>
                  <button
                    type="button"
                    onClick={copyLink}
                    aria-label="Copiar link"
                    className="shrink-0 p-2 text-(--color-muted) hover:text-(--color-text) transition-colors"
                    style={{ border: "1px solid var(--color-border)" }}
                  >
                    {copied ? <Check size={14} /> : <Copy size={14} />}
                  </button>
                </div>
              </div>
            </div>

            <p className="font-sans text-xs text-(--color-muted) leading-relaxed mb-6">
              Mandale este link al cliente (por WhatsApp, por ejemplo). Al abrirlo va a poder crear su
              contraseña y entrar directo a su panel.
            </p>

            <div className="flex gap-3">
              <button
                type="button"
                onClick={() => { setResult(null); setName(""); setSlug(""); setSlugTouched(false); setEmail(""); setPlan("starter"); }}
                className="font-display text-sm font-bold uppercase tracking-wide px-4 py-2.5"
                style={{ border: "1px solid var(--color-border)", color: "var(--color-text)" }}
              >
                Cargar otro
              </button>
              <button
                type="button"
                onClick={() => navigate({ to: "/admin" })}
                className="flex-1 inline-flex items-center justify-center gap-2 font-display text-sm font-bold uppercase tracking-wide px-4 py-2.5"
                style={{ background: "var(--color-accent)", color: "var(--color-bg)", boxShadow: "4px 4px 0 var(--color-accent-shadow)" }}
              >
                Ir a venues <ArrowRight size={16} />
              </button>
            </div>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="p-6 space-y-4" style={{ background: "var(--color-surface)", border: "1px solid var(--color-border)" }}>
            <div>
              <label className="font-mono-tech text-[10px] uppercase tracking-widest text-(--color-muted) block mb-1.5">
                Nombre del negocio*
              </label>
              <input
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Ej: Bistró San Telmo"
                className="w-full font-sans text-sm px-3 py-2.5 bg-transparent text-(--color-text) placeholder:text-(--color-muted)"
                style={{ border: "1px solid var(--color-border)" }}
              />
            </div>

            <div>
              <label className="font-mono-tech text-[10px] uppercase tracking-widest text-(--color-muted) block mb-1.5">
                Slug*
              </label>
              <input
                required
                value={effectiveSlug}
                onChange={(e) => { setSlug(slugify(e.target.value)); setSlugTouched(true); }}
                className="w-full font-sans text-sm px-3 py-2.5 bg-transparent text-(--color-text)"
                style={{ border: `1px solid ${slugValid || !effectiveSlug ? "var(--color-border)" : "var(--color-accent)"}` }}
              />
              <p className="font-mono-tech text-[10px] text-(--color-muted) mt-1.5">
                {effectiveSlug || "…"}.getdishub.app
              </p>
            </div>

            <div>
              <label className="font-mono-tech text-[10px] uppercase tracking-widest text-(--color-muted) block mb-1.5">
                Email del dueño*
              </label>
              <input
                required
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="dueño@turestaurante.com"
                className="w-full font-sans text-sm px-3 py-2.5 bg-transparent text-(--color-text) placeholder:text-(--color-muted)"
                style={{ border: "1px solid var(--color-border)" }}
              />
            </div>

            <div>
              <label className="font-mono-tech text-[10px] uppercase tracking-widest text-(--color-muted) block mb-1.5">
                Plan inicial
              </label>
              <select
                value={plan}
                onChange={(e) => setPlan(e.target.value)}
                className="w-full font-sans text-sm px-3 py-2.5 bg-transparent text-(--color-text)"
                style={{ border: "1px solid var(--color-border)" }}
              >
                {Object.entries(PLAN_LABELS).map(([value, label]) => (
                  <option key={value} value={value} style={{ color: "#000" }}>{label}</option>
                ))}
              </select>
            </div>

            {error && <p className="font-sans text-sm text-(--color-accent)">{error}</p>}

            <button
              type="submit"
              disabled={!canSubmit}
              className="w-full inline-flex items-center justify-center gap-2 font-display font-extrabold uppercase tracking-wide text-sm py-3 transition-all disabled:opacity-50"
              style={{ background: "var(--color-accent)", color: "var(--color-bg)", boxShadow: "4px 4px 0 var(--color-accent-shadow)" }}
            >
              {submitting ? "Creando…" : "Crear cliente"} <ArrowRight size={16} />
            </button>
          </form>
        )}
      </main>
    </div>
  );
}
