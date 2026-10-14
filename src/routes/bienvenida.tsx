import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { Lock, ArrowRight } from "lucide-react";
import { SimpleNav, Footer, Preloader } from "@/components/site";
import { supabase } from "@/lib/supabase";
import { useSession } from "@/lib/auth";

export const Route = createFileRoute("/bienvenida")({
  head: () => ({
    meta: [
      { title: "Bienvenido | DISHub" },
      { name: "robots", content: "noindex, nofollow" },
    ],
  }),
  component: BienvenidaPage,
});

function BienvenidaPage() {
  const navigate = useNavigate();
  const session = useSession();
  const [ready, setReady] = useState(false);
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (session === null) navigate({ to: "/login" });
  }, [session, navigate]);

  const canSubmit = password.length >= 8 && password === confirmPassword;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!canSubmit) return;
    setSubmitting(true);
    setError("");

    const { error: updateError } = await supabase.auth.updateUser({ password });
    setSubmitting(false);

    if (updateError) {
      setError("No pudimos guardar la contraseña. Probá de nuevo.");
      return;
    }

    const isSuperadmin = session?.user.app_metadata?.role === "superadmin";
    navigate({ to: isSuperadmin ? "/admin" : "/dashboard" });
  };

  return (
    <div className="min-h-screen flex flex-col" style={{ background: "var(--color-bg)" }}>
      {!ready && <Preloader onDone={() => setReady(true)} />}
      <SimpleNav badge="Bienvenido" />

      <main className="flex-1 flex items-center justify-center px-6 py-16">
        <div className="w-full max-w-md">
          <div className="mb-8 text-center">
            <div className="font-display text-2xl font-extrabold tracking-tight text-(--color-text) mb-2">
              DIS<span className="text-(--color-accent)">Hub</span>
            </div>
            <h1 className="font-display text-xl font-bold text-(--color-text)">Creá tu contraseña</h1>
            <p className="font-sans text-sm text-(--color-muted) mt-2">
              Último paso para activar tu cuenta.
            </p>
          </div>

          <form
            onSubmit={handleSubmit}
            className="p-6"
            style={{ background: "var(--color-surface)", border: "1px solid var(--color-border)" }}
          >
            <div className="space-y-4">
              <div>
                <label className="font-mono-tech text-[10px] uppercase tracking-widest text-(--color-muted) block mb-1.5">
                  Contraseña
                </label>
                <div className="relative">
                  <Lock size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-(--color-muted)" />
                  <input
                    type="password"
                    required
                    minLength={8}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Mínimo 8 caracteres"
                    className="w-full font-sans text-sm pl-9 pr-3 py-2.5 bg-transparent text-(--color-text) placeholder:text-(--color-muted)"
                    style={{ border: "1px solid var(--color-border)" }}
                  />
                </div>
              </div>

              <div>
                <label className="font-mono-tech text-[10px] uppercase tracking-widest text-(--color-muted) block mb-1.5">
                  Repetir contraseña
                </label>
                <div className="relative">
                  <Lock size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-(--color-muted)" />
                  <input
                    type="password"
                    required
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    className="w-full font-sans text-sm pl-9 pr-3 py-2.5 bg-transparent text-(--color-text)"
                    style={{ border: "1px solid var(--color-border)" }}
                  />
                </div>
              </div>
            </div>

            {error && <p className="font-sans text-sm text-(--color-accent) mt-4">{error}</p>}
            {!error && password && confirmPassword && password !== confirmPassword && (
              <p className="font-sans text-sm text-(--color-accent) mt-4">Las contraseñas no coinciden.</p>
            )}

            <button
              type="submit"
              disabled={!canSubmit || submitting}
              className="w-full mt-6 inline-flex items-center justify-center gap-2 font-display font-extrabold uppercase tracking-wide text-sm py-3 transition-all disabled:opacity-50"
              style={{ background: "var(--color-accent)", color: "var(--color-bg)", boxShadow: "4px 4px 0 var(--color-accent-shadow)" }}
            >
              {submitting ? "Guardando…" : "Activar cuenta"} <ArrowRight size={16} />
            </button>
          </form>
        </div>
      </main>

      <Footer home={false} />
    </div>
  );
}
