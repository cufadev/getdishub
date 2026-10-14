import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { Lock, Mail, ArrowRight, Eye, EyeOff } from "lucide-react";
import { SimpleNav, Footer, Preloader } from "@/components/site";
import { track } from "@/lib/analytics";
import { supabase } from "@/lib/supabase";

export const Route = createFileRoute("/login")({
  head: () => ({
    meta: [
      { title: "Iniciar sesión | DISHub" },
      { name: "description", content: "Accedé al panel de DISHub para gestionar tu carta digital, reservas y pedidos." },
      { name: "robots", content: "noindex, nofollow" },
    ],
  }),
  component: LoginPage,
});

function LoginPage() {
  const navigate = useNavigate();
  const [ready, setReady] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  const canSubmit = email.trim() && password.trim();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!canSubmit) return;
    setSubmitting(true);
    setError("");
    track("login_submit", { origen: "login" });

    const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
      email: email.trim(),
      password,
    });

    setSubmitting(false);

    if (authError) {
      setError(
        authError.message === "Invalid login credentials"
          ? "Email o contraseña incorrectos."
          : "No pudimos iniciar sesión. Probá de nuevo en un momento.",
      );
      return;
    }

    track("login_success", { origen: "login" });
    const isSuperadmin = authData.user?.app_metadata?.role === "superadmin";
    navigate({ to: isSuperadmin ? "/admin" : "/dashboard" });
  };

  return (
    <div className="min-h-screen flex flex-col" style={{ background: "var(--color-bg)" }}>
      {!ready && <Preloader onDone={() => setReady(true)} />}
      <SimpleNav badge="Acceso clientes" />

      <main className="flex-1 flex items-center justify-center px-6 py-16">
        <div className="w-full max-w-md">
          <div className="mb-8 text-center">
            <div className="font-display text-2xl font-extrabold tracking-tight text-(--color-text) mb-2">
              DIS<span className="text-(--color-accent)">Hub</span>
            </div>
            <h1 className="font-display text-xl font-bold text-(--color-text)">Iniciar sesión</h1>
            <p className="font-sans text-sm text-(--color-muted) mt-2">
              Accedé al panel para gestionar tu carta, reservas y pedidos.
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
                  Email
                </label>
                <div className="relative">
                  <Mail size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-(--color-muted)" />
                  <input
                    type="email"
                    required
                    autoComplete="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="vos@turestaurante.com"
                    className="w-full font-sans text-sm pl-9 pr-3 py-2.5 bg-transparent text-(--color-text) placeholder:text-(--color-muted)"
                    style={{ border: "1px solid var(--color-border)" }}
                  />
                </div>
              </div>

              <div>
                <label className="font-mono-tech text-[10px] uppercase tracking-widest text-(--color-muted) block mb-1.5">
                  Contraseña
                </label>
                <div className="relative">
                  <Lock size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-(--color-muted)" />
                  <input
                    type={showPassword ? "text" : "password"}
                    required
                    autoComplete="current-password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                    className="w-full font-sans text-sm pl-9 pr-9 py-2.5 bg-transparent text-(--color-text) placeholder:text-(--color-muted)"
                    style={{ border: "1px solid var(--color-border)" }}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword((v) => !v)}
                    aria-label={showPassword ? "Ocultar contraseña" : "Mostrar contraseña"}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-(--color-muted) hover:text-(--color-text) transition-colors"
                  >
                    {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                </div>
              </div>
            </div>

            {error && (
              <p className="font-sans text-sm text-(--color-accent) mt-4 leading-relaxed">
                {error}
              </p>
            )}

            <button
              type="submit"
              disabled={!canSubmit || submitting}
              className="w-full mt-6 inline-flex items-center justify-center gap-2 font-display font-extrabold uppercase tracking-wide text-sm py-3 transition-all disabled:opacity-50"
              style={{ background: "var(--color-accent)", color: "var(--color-bg)", boxShadow: "4px 4px 0 var(--color-accent-shadow)" }}
            >
              {submitting ? "Ingresando…" : "Ingresar"} <ArrowRight size={16} />
            </button>

            <p className="font-mono-tech text-[10px] text-(--color-muted) mt-4 text-center">
              ¿Todavía no sos cliente?{" "}
              <a href="/agendar" className="text-(--color-accent) hover:underline">
                Agendá una demo
              </a>
            </p>
          </form>
        </div>
      </main>

      <Footer home={false} />
    </div>
  );
}
