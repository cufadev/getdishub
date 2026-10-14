import { Fragment, useEffect, useState } from "react";
import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { createServerFn } from "@tanstack/react-start";
import { createClient } from "@supabase/supabase-js";
import { LogOut, Send, Eye, Check, ChevronDown, Pencil, Trash2 } from "lucide-react";
import { SimpleNav } from "@/components/site";
import { useRole } from "@/lib/auth";
import { supabase } from "@/lib/supabase";
import { onboardingItemsForPlan } from "@/lib/onboarding";

const SLUG_RE = /^[a-z0-9-]+$/;

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
  if (error || !data.user) throw new Error("403: Sesión inválida.");
  if (data.user.app_metadata?.role !== "superadmin") throw new Error("403: No tenés permiso para hacer esto.");
}

async function findUserByEmail(admin: ReturnType<typeof getSupabaseAdmin>, targetEmail: string) {
  let page = 1;
  const perPage = 200;
  while (true) {
    const { data, error } = await admin.auth.admin.listUsers({ page, perPage });
    if (error) throw error;
    const found = data.users.find((u) => u.email?.toLowerCase() === targetEmail.toLowerCase());
    if (found) return found;
    if (data.users.length < perPage) return null;
    page += 1;
  }
}

const resendInvite = createServerFn({ method: "POST" })
  .inputValidator((data: { accessToken: string; email: string; siteUrl: string }) => data)
  .handler(async ({ data }) => {
    await assertSuperadmin(data.accessToken);
    const admin = getSupabaseAdmin();

    const user = await findUserByEmail(admin, data.email);
    if (!user) throw new Error("404: No encontramos ese usuario.");
    if (user.email_confirmed_at) {
      throw new Error("409: El cliente ya activó su cuenta. Todavía no hay flujo de reset de contraseña.");
    }

    const { data: linkData, error: linkError } = await admin.auth.admin.generateLink({
      type: "invite",
      email: data.email,
      options: { redirectTo: `${data.siteUrl}/bienvenida` },
    });
    if (linkError || !linkData) {
      throw new Error(`500: No se pudo generar la invitación (${linkError?.message ?? "error desconocido"}).`);
    }

    return { inviteLink: linkData.properties.action_link };
  });

const deleteVenue = createServerFn({ method: "POST" })
  .inputValidator((data: { accessToken: string; venueId: string }) => data)
  .handler(async ({ data }) => {
    await assertSuperadmin(data.accessToken);
    const admin = getSupabaseAdmin();

    const { data: memberships } = await admin
      .from("memberships")
      .select("user_id")
      .eq("venue_id", data.venueId)
      .eq("role", "owner");

    const { error: venueError } = await admin.from("venues").delete().eq("id", data.venueId);
    if (venueError) {
      throw new Error(`500: No se pudo borrar el venue (${venueError.message}).`);
    }

    for (const m of memberships ?? []) {
      await admin.auth.admin.deleteUser(m.user_id);
    }

    return { ok: true };
  });

export const Route = createFileRoute("/admin")({
  head: () => ({
    meta: [
      { title: "Panel admin | DISHub" },
      { name: "robots", content: "noindex, nofollow" },
    ],
  }),
  component: AdminPage,
});

type Venue = {
  id: string;
  name: string;
  slug: string;
  plan: string;
  status: string;
  created_at: string;
  owner_email: string | null;
};

const PLAN_LABELS: Record<string, string> = {
  menu_digital: "Menú Digital",
  starter: "Starter",
  pro: "PRO",
  table_hub: "Table Hub",
};

const PLANS = Object.keys(PLAN_LABELS);

const STATUS_COLORS: Record<string, string> = {
  active: "var(--color-accent)",
  suspended: "var(--color-secondary)",
  churned: "var(--color-muted)",
};

type OnboardingItem = {
  id: string;
  venue_id: string;
  item_key: string;
  label: string;
  done: boolean;
  done_at: string | null;
  notes: string | null;
  sort_order: number;
};

function AdminPage() {
  const navigate = useNavigate();
  const { loading, isSuperadmin, session } = useRole();
  const [venues, setVenues] = useState<Venue[] | null>(null);
  const [fetchError, setFetchError] = useState("");
  const [rowError, setRowError] = useState<{ id: string; message: string } | null>(null);
  const [updatingId, setUpdatingId] = useState<string | null>(null);
  const [itemsByVenue, setItemsByVenue] = useState<Record<string, OnboardingItem[]>>({});
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editName, setEditName] = useState("");
  const [editSlug, setEditSlug] = useState("");

  useEffect(() => {
    if (loading) return;
    if (!session) {
      navigate({ to: "/login" });
      return;
    }
    if (!isSuperadmin) {
      navigate({ to: "/dashboard", search: { venue: undefined } });
    }
  }, [loading, session, isSuperadmin, navigate]);

  useEffect(() => {
    if (!isSuperadmin) return;
    supabase.rpc("admin_list_venues").then(({ data, error }) => {
      if (error) {
        setFetchError(error.message);
        return;
      }
      setVenues((data as Venue[]) ?? []);
    });
    supabase
      .from("onboarding_items")
      .select("id, venue_id, item_key, label, done, done_at, notes, sort_order")
      .order("sort_order", { ascending: true })
      .then(({ data, error }) => {
        if (error) return;
        const grouped: Record<string, OnboardingItem[]> = {};
        for (const item of (data as OnboardingItem[]) ?? []) {
          (grouped[item.venue_id] ??= []).push(item);
        }
        setItemsByVenue(grouped);
      });
  }, [isSuperadmin]);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    navigate({ to: "/login" });
  };

  const changePlan = async (venue: Venue, newPlan: string) => {
    if (newPlan === venue.plan) return;
    const confirmed = window.confirm(
      `¿Cambiar el plan de "${venue.name}" a ${PLAN_LABELS[newPlan]}?`,
    );
    if (!confirmed) return;

    setUpdatingId(venue.id);
    setRowError(null);
    const { error } = await supabase.from("venues").update({ plan: newPlan }).eq("id", venue.id);
    setUpdatingId(null);

    if (error) {
      setRowError({ id: venue.id, message: error.message });
      return;
    }
    setVenues((prev) => prev?.map((v) => (v.id === venue.id ? { ...v, plan: newPlan } : v)) ?? prev);
  };

  const toggleStatus = async (venue: Venue) => {
    const suspending = venue.status === "active";
    const newStatus = suspending ? "suspended" : "active";
    const confirmMessage = suspending
      ? `El hub público de "${venue.name}" va a dejar de estar accesible. ¿Confirmás?`
      : `Reactivar "${venue.name}". ¿Confirmás?`;
    const confirmed = window.confirm(confirmMessage);
    if (!confirmed) return;

    setUpdatingId(venue.id);
    setRowError(null);
    const { error } = await supabase.from("venues").update({ status: newStatus }).eq("id", venue.id);
    setUpdatingId(null);

    if (error) {
      setRowError({ id: venue.id, message: error.message });
      return;
    }
    setVenues((prev) => prev?.map((v) => (v.id === venue.id ? { ...v, status: newStatus } : v)) ?? prev);
  };

  const startEdit = (venue: Venue) => {
    setEditingId(venue.id);
    setEditName(venue.name);
    setEditSlug(venue.slug);
    setRowError(null);
  };

  const cancelEdit = () => {
    setEditingId(null);
  };

  const saveEdit = async (venue: Venue) => {
    const name = editName.trim();
    const slug = editSlug.trim().toLowerCase();

    if (!name) {
      setRowError({ id: venue.id, message: "El nombre no puede estar vacío." });
      return;
    }
    if (!SLUG_RE.test(slug)) {
      setRowError({ id: venue.id, message: "El slug solo puede tener minúsculas, números y guiones." });
      return;
    }
    if (venues?.some((v) => v.id !== venue.id && v.slug === slug)) {
      setRowError({ id: venue.id, message: "Ese slug ya está en uso por otro venue." });
      return;
    }

    setUpdatingId(venue.id);
    setRowError(null);
    const { error } = await supabase.from("venues").update({ name, slug }).eq("id", venue.id);
    setUpdatingId(null);

    if (error) {
      setRowError({ id: venue.id, message: error.message });
      return;
    }
    setVenues((prev) => prev?.map((v) => (v.id === venue.id ? { ...v, name, slug } : v)) ?? prev);
    setEditingId(null);
  };

  const handleDeleteVenue = async (venue: Venue) => {
    const typed = window.prompt(
      `Esto borra "${venue.name}" y la cuenta de su dueño de forma permanente. Escribí el slug "${venue.slug}" para confirmar.`,
    );
    if (typed !== venue.slug) return;

    setUpdatingId(venue.id);
    setRowError(null);

    const { data: sessionData } = await supabase.auth.getSession();
    const accessToken = sessionData.session?.access_token;
    if (!accessToken) {
      setRowError({ id: venue.id, message: "Tu sesión expiró, volvé a iniciar sesión." });
      setUpdatingId(null);
      return;
    }

    try {
      await deleteVenue({ data: { accessToken, venueId: venue.id } });
      setVenues((prev) => prev?.filter((v) => v.id !== venue.id) ?? prev);
    } catch (err) {
      const msg = err instanceof Error ? err.message : String(err);
      setRowError({ id: venue.id, message: msg.replace(/^\d+:\s*/, "") });
    } finally {
      setUpdatingId(null);
    }
  };

  const handleResendInvite = async (venue: Venue) => {
    if (!venue.owner_email) return;
    setUpdatingId(venue.id);
    setRowError(null);

    const { data: sessionData } = await supabase.auth.getSession();
    const accessToken = sessionData.session?.access_token;
    if (!accessToken) {
      setRowError({ id: venue.id, message: "Tu sesión expiró, volvé a iniciar sesión." });
      setUpdatingId(null);
      return;
    }

    try {
      const res = await resendInvite({
        data: { accessToken, email: venue.owner_email, siteUrl: window.location.origin },
      });
      await navigator.clipboard.writeText(res.inviteLink);
      setRowError({ id: venue.id, message: "Link copiado al portapapeles — mandáselo al cliente." });
    } catch (err) {
      const msg = err instanceof Error ? err.message : String(err);
      setRowError({ id: venue.id, message: msg.replace(/^\d+:\s*/, "") });
    } finally {
      setUpdatingId(null);
    }
  };

  const toggleItemDone = async (item: OnboardingItem) => {
    const nextDone = !item.done;
    const nextDoneAt = nextDone ? new Date().toISOString() : null;

    setItemsByVenue((prev) => ({
      ...prev,
      [item.venue_id]: prev[item.venue_id].map((i) =>
        i.id === item.id ? { ...i, done: nextDone, done_at: nextDoneAt } : i,
      ),
    }));

    const { error } = await supabase
      .from("onboarding_items")
      .update({ done: nextDone, done_at: nextDoneAt })
      .eq("id", item.id);

    if (error) {
      setItemsByVenue((prev) => ({
        ...prev,
        [item.venue_id]: prev[item.venue_id].map((i) => (i.id === item.id ? item : i)),
      }));
      setRowError({ id: item.venue_id, message: error.message });
    }
  };

  const saveItemNotes = async (item: OnboardingItem, notes: string) => {
    if (notes === (item.notes ?? "")) return;
    setItemsByVenue((prev) => ({
      ...prev,
      [item.venue_id]: prev[item.venue_id].map((i) => (i.id === item.id ? { ...i, notes } : i)),
    }));
    await supabase.from("onboarding_items").update({ notes }).eq("id", item.id);
  };

  const initializeChecklist = async (venue: Venue) => {
    const seed = onboardingItemsForPlan(venue.plan).map((item) => ({ ...item, venue_id: venue.id }));
    const { data, error } = await supabase.from("onboarding_items").insert(seed).select();
    if (error) {
      setRowError({ id: venue.id, message: error.message });
      return;
    }
    setItemsByVenue((prev) => ({ ...prev, [venue.id]: (data as OnboardingItem[]) ?? [] }));
  };

  const addMissingItems = async (venue: Venue) => {
    const current = itemsByVenue[venue.id] ?? [];
    const expected = onboardingItemsForPlan(venue.plan);
    const missing = expected
      .filter((seed) => !current.some((i) => i.item_key === seed.item_key))
      .map((seed) => ({ ...seed, venue_id: venue.id }));
    if (missing.length === 0) return;

    const { data, error } = await supabase.from("onboarding_items").insert(missing).select();
    if (error) {
      setRowError({ id: venue.id, message: error.message });
      return;
    }
    setItemsByVenue((prev) => ({
      ...prev,
      [venue.id]: [...current, ...((data as OnboardingItem[]) ?? [])].sort((a, b) => a.sort_order - b.sort_order),
    }));
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

      <main className="mx-auto max-w-5xl px-6 py-12">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="font-display text-2xl font-extrabold text-(--color-text)">Venues</h1>
            <p className="font-sans text-sm text-(--color-muted) mt-1">
              {venues ? `${venues.length} cliente${venues.length === 1 ? "" : "s"} registrado${venues.length === 1 ? "" : "s"}` : "Cargando venues…"}
            </p>
          </div>
          <div className="flex items-center gap-3">
            <a
              href="/admin/nuevo"
              onClick={(e) => { e.preventDefault(); navigate({ to: "/admin/nuevo" }); }}
              className="font-display text-sm font-bold uppercase tracking-wide px-4 py-2.5"
              style={{ background: "var(--color-accent)", color: "var(--color-bg)", boxShadow: "4px 4px 0 var(--color-accent-shadow)" }}
            >
              + Nuevo cliente
            </a>
            <button
              onClick={handleLogout}
              className="inline-flex items-center gap-2 font-mono-tech text-xs uppercase tracking-widest text-(--color-muted) hover:text-(--color-text) transition-colors px-3 py-2"
              style={{ border: "1px solid var(--color-border)" }}
            >
              <LogOut size={14} /> Salir
            </button>
          </div>
        </div>

        {fetchError && (
          <p className="font-sans text-sm text-(--color-accent) mb-6">{fetchError}</p>
        )}

        {venues && venues.length === 0 && !fetchError && (
          <div className="p-8 text-center" style={{ border: "1px solid var(--color-border)", background: "var(--color-surface)" }}>
            <p className="font-sans text-sm text-(--color-muted)">Todavía no hay ningún venue cargado.</p>
          </div>
        )}

        {venues && venues.length > 0 && (
          <div className="overflow-x-auto" style={{ border: "1px solid var(--color-border)" }}>
            <table className="w-full text-left">
              <thead>
                <tr style={{ background: "var(--color-surface)", borderBottom: "1px solid var(--color-border)" }}>
                  {["Nombre", "Slug", "Owner", "Plan", "Status", "Onboarding", "Creado", "Acciones"].map((h) => (
                    <th key={h} className="font-mono-tech text-[10px] uppercase tracking-widest text-(--color-muted) px-4 py-3">
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {venues.map((v) => (
                  <Fragment key={v.id}>
                  <tr style={{ borderBottom: "1px solid var(--color-border)" }}>
                    <td className="font-sans text-sm text-(--color-text) px-4 py-3">
                      {editingId === v.id ? (
                        <input
                          value={editName}
                          onChange={(e) => setEditName(e.target.value)}
                          className="w-full font-sans text-sm px-2 py-1 bg-transparent text-(--color-text)"
                          style={{ border: "1px solid var(--color-border)" }}
                        />
                      ) : (
                        v.name
                      )}
                      {rowError?.id === v.id && (
                        <p className="font-sans text-xs text-(--color-accent) mt-1">{rowError.message}</p>
                      )}
                    </td>
                    <td className="font-mono-tech text-xs text-(--color-muted) px-4 py-3">
                      {editingId === v.id ? (
                        <input
                          value={editSlug}
                          onChange={(e) => setEditSlug(e.target.value.toLowerCase())}
                          className="w-full font-mono-tech text-xs px-2 py-1 bg-transparent text-(--color-text)"
                          style={{ border: "1px solid var(--color-border)" }}
                        />
                      ) : (
                        <a
                          href={`/carta/${v.slug}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="hover:text-(--color-accent) transition-colors"
                        >
                          {v.slug}
                        </a>
                      )}
                    </td>
                    <td className="font-sans text-xs text-(--color-muted) px-4 py-3">
                      {v.owner_email ?? "—"}
                    </td>
                    <td className="px-4 py-3">
                      <select
                        value={v.plan}
                        disabled={updatingId === v.id}
                        onChange={(e) => changePlan(v, e.target.value)}
                        className="font-sans text-sm bg-transparent text-(--color-text) px-2 py-1.5 disabled:opacity-50"
                        style={{ border: "1px solid var(--color-border)" }}
                      >
                        {PLANS.map((p) => (
                          <option key={p} value={p} style={{ color: "#000" }}>{PLAN_LABELS[p]}</option>
                        ))}
                      </select>
                    </td>
                    <td className="font-sans text-sm px-4 py-3">
                      <span
                        className="font-mono-tech text-[10px] uppercase tracking-widest px-2 py-1"
                        style={{ border: "1px solid var(--color-border)", color: STATUS_COLORS[v.status] ?? "var(--color-muted)" }}
                      >
                        {v.status}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <OnboardingProgressCell
                        items={itemsByVenue[v.id]}
                        expanded={expandedId === v.id}
                        onToggle={() => setExpandedId((prev) => (prev === v.id ? null : v.id))}
                      />
                    </td>
                    <td className="font-mono-tech text-xs text-(--color-muted) px-4 py-3">
                      {new Date(v.created_at).toLocaleDateString("es-AR")}
                    </td>
                    <td className="px-4 py-3">
                      {editingId === v.id ? (
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => saveEdit(v)}
                            disabled={updatingId === v.id}
                            className="font-mono-tech text-[10px] uppercase tracking-widest px-2 py-1.5 disabled:opacity-50"
                            style={{ border: "1px solid var(--color-accent)", color: "var(--color-accent)" }}
                          >
                            Guardar
                          </button>
                          <button
                            onClick={cancelEdit}
                            disabled={updatingId === v.id}
                            className="font-mono-tech text-[10px] uppercase tracking-widest text-(--color-muted) hover:text-(--color-text) transition-colors px-2 py-1.5 disabled:opacity-50"
                            style={{ border: "1px solid var(--color-border)" }}
                          >
                            Cancelar
                          </button>
                        </div>
                      ) : (
                        <div className="flex items-center gap-2">
                          <a
                            href={`/dashboard?venue=${v.id}`}
                            onClick={(e) => { e.preventDefault(); navigate({ to: "/dashboard", search: { venue: v.id } }); }}
                            aria-label="Ver como cliente"
                            title="Ver como cliente"
                            className="p-1.5 text-(--color-muted) hover:text-(--color-text) transition-colors"
                            style={{ border: "1px solid var(--color-border)" }}
                          >
                            <Eye size={14} />
                          </a>
                          <button
                            onClick={() => startEdit(v)}
                            disabled={updatingId === v.id}
                            aria-label="Editar venue"
                            title="Editar venue"
                            className="p-1.5 text-(--color-muted) hover:text-(--color-text) transition-colors disabled:opacity-50"
                            style={{ border: "1px solid var(--color-border)" }}
                          >
                            <Pencil size={14} />
                          </button>
                          {v.owner_email && (
                            <button
                              onClick={() => handleResendInvite(v)}
                              disabled={updatingId === v.id}
                              aria-label="Reenviar invitación"
                              title="Reenviar invitación"
                              className="p-1.5 text-(--color-muted) hover:text-(--color-text) transition-colors disabled:opacity-50"
                              style={{ border: "1px solid var(--color-border)" }}
                            >
                              <Send size={14} />
                            </button>
                          )}
                          {v.status !== "churned" && (
                            <button
                              onClick={() => toggleStatus(v)}
                              disabled={updatingId === v.id}
                              className="font-mono-tech text-[10px] uppercase tracking-widest text-(--color-muted) hover:text-(--color-text) transition-colors px-2 py-1.5 disabled:opacity-50"
                              style={{ border: "1px solid var(--color-border)" }}
                            >
                              {v.status === "active" ? "Suspender" : "Reactivar"}
                            </button>
                          )}
                          <button
                            onClick={() => handleDeleteVenue(v)}
                            disabled={updatingId === v.id}
                            aria-label="Borrar venue"
                            title="Borrar venue"
                            className="p-1.5 text-(--color-muted) hover:text-(--color-accent) transition-colors disabled:opacity-50"
                            style={{ border: "1px solid var(--color-border)" }}
                          >
                            <Trash2 size={14} />
                          </button>
                        </div>
                      )}
                    </td>
                  </tr>
                  {expandedId === v.id && (
                    <tr style={{ borderBottom: "1px solid var(--color-border)" }}>
                      <td colSpan={8} className="px-4 py-5" style={{ background: "var(--color-surface)" }}>
                        <OnboardingAccordion
                          venue={v}
                          items={itemsByVenue[v.id]}
                          onToggleItem={toggleItemDone}
                          onSaveNotes={saveItemNotes}
                          onInitialize={() => initializeChecklist(v)}
                          onAddMissing={() => addMissingItems(v)}
                        />
                      </td>
                    </tr>
                  )}
                </Fragment>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </main>
    </div>
  );
}

function OnboardingProgressCell({
  items,
  expanded,
  onToggle,
}: {
  items: OnboardingItem[] | undefined;
  expanded: boolean;
  onToggle: () => void;
}) {
  const total = items?.length ?? 0;
  const done = items?.filter((i) => i.done).length ?? 0;
  const complete = total > 0 && done === total;

  return (
    <button
      onClick={onToggle}
      className="inline-flex items-center gap-2 font-mono-tech text-xs text-(--color-text) hover:text-(--color-accent) transition-colors"
    >
      <ChevronDown size={12} style={{ transform: expanded ? "rotate(180deg)" : "none", transition: "transform 150ms" }} />
      {total === 0 ? (
        <span className="text-(--color-muted)">Sin checklist</span>
      ) : complete ? (
        <Check size={14} className="text-(--color-accent)" />
      ) : (
        <>
          <span>{done}/{total}</span>
          <span className="w-16 h-2.5 inline-block" style={{ border: "2px solid var(--color-text)" }}>
            <span
              className="block h-full"
              style={{ width: `${(done / total) * 100}%`, background: "var(--color-accent)" }}
            />
          </span>
        </>
      )}
    </button>
  );
}

function OnboardingAccordion({
  venue,
  items,
  onToggleItem,
  onSaveNotes,
  onInitialize,
  onAddMissing,
}: {
  venue: Venue;
  items: OnboardingItem[] | undefined;
  onToggleItem: (item: OnboardingItem) => void;
  onSaveNotes: (item: OnboardingItem, notes: string) => void;
  onInitialize: () => void;
  onAddMissing: () => void;
}) {
  if (!items || items.length === 0) {
    return (
      <div className="flex items-center justify-between gap-4">
        <p className="font-sans text-sm text-(--color-muted)">Este venue todavía no tiene checklist de onboarding.</p>
        <button
          onClick={onInitialize}
          className="font-display text-xs font-bold uppercase tracking-wide px-3 py-2 shrink-0"
          style={{ background: "var(--color-accent)", color: "var(--color-bg)" }}
        >
          Inicializar checklist
        </button>
      </div>
    );
  }

  const expectedKeys = onboardingItemsForPlan(venue.plan).map((i) => i.item_key);
  const missingCount = expectedKeys.filter((key) => !items.some((i) => i.item_key === key)).length;

  return (
    <div className="space-y-4">
      {missingCount > 0 && (
        <div
          className="flex items-center justify-between gap-4 px-3 py-2.5"
          style={{ border: "1px solid var(--color-secondary)" }}
        >
          <p className="font-sans text-xs text-(--color-text)">
            El plan {PLAN_LABELS[venue.plan] ?? venue.plan} suma pasos de onboarding.
          </p>
          <button
            onClick={onAddMissing}
            className="font-mono-tech text-[10px] uppercase tracking-widest text-(--color-text) px-3 py-1.5 shrink-0"
            style={{ border: "1px solid var(--color-text)" }}
          >
            Agregar faltantes
          </button>
        </div>
      )}

      <div className="space-y-2">
        {items.map((item) => (
          <OnboardingItemRow key={item.id} item={item} onToggle={onToggleItem} onSaveNotes={onSaveNotes} />
        ))}
      </div>
    </div>
  );
}

function OnboardingItemRow({
  item,
  onToggle,
  onSaveNotes,
}: {
  item: OnboardingItem;
  onToggle: (item: OnboardingItem) => void;
  onSaveNotes: (item: OnboardingItem, notes: string) => void;
}) {
  const [notes, setNotes] = useState(item.notes ?? "");

  return (
    <div className="flex items-start gap-3 py-2" style={{ borderBottom: "1px solid var(--color-border)" }}>
      <button
        onClick={() => onToggle(item)}
        aria-label={item.done ? "Marcar como pendiente" : "Marcar como hecho"}
        className="mt-0.5 shrink-0 flex items-center justify-center w-5 h-5"
        style={{ border: "2px solid var(--color-text)" }}
      >
        {item.done && <Check size={12} className="text-(--color-accent)" strokeWidth={3} />}
      </button>

      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 flex-wrap">
          <span className="font-sans text-sm text-(--color-text)">{item.label}</span>
          {item.done && item.done_at && (
            <span className="font-mono-tech text-[10px] text-(--color-muted)">
              {new Date(item.done_at).toLocaleDateString("es-AR", { day: "2-digit", month: "2-digit" })}
            </span>
          )}
        </div>
        <input
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          onBlur={() => onSaveNotes(item, notes)}
          placeholder="Notas…"
          className="w-full font-sans text-xs mt-1 px-2 py-1 bg-transparent text-(--color-muted) placeholder:text-(--color-muted)"
          style={{ border: "1px solid var(--color-border)" }}
        />
      </div>
    </div>
  );
}
