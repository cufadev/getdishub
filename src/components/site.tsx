import { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import gsap from "gsap";
import { ArrowRight } from "lucide-react";
import { track } from "@/lib/analytics";
import { waLink } from "@/lib/whatsapp";

export { WHATSAPP_NUMBER, whatsappHref } from "@/lib/whatsapp";

/* ---------- helpers ---------- */
export function useReveal() {
  useEffect(() => {
    const els = document.querySelectorAll(".reveal");
    const io = new IntersectionObserver(
      (entries) => {
        entries.forEach((e) => {
          if (e.isIntersecting) {
            e.target.classList.add("in-view");
            io.unobserve(e.target);
          }
        });
      },
      { threshold: 0.12 },
    );
    els.forEach((el) => io.observe(el));
    return () => io.disconnect();
  }, []);
}

/* ---------- particles canvas ---------- */
function ParticlesCanvas({ count = 38, maxDist = 120 }: { count?: number; maxDist?: number }) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d")!;
    const COUNT = count;
    const MAX_DIST = maxDist;
    const ACCENT = "232,116,59";

    let w = 0, h = 0;
    const resize = () => {
      w = canvas.offsetWidth;
      h = canvas.offsetHeight;
      canvas.width = w;
      canvas.height = h;
    };
    resize();
    window.addEventListener("resize", resize);

    const pts = Array.from({ length: COUNT }, () => ({
      x: Math.random() * w,
      y: Math.random() * h,
      vx: (Math.random() - 0.5) * 0.4,
      vy: (Math.random() - 0.5) * 0.4,
    }));

    let raf: number;
    const draw = () => {
      ctx.clearRect(0, 0, w, h);
      for (const p of pts) {
        p.x += p.vx;
        p.y += p.vy;
        if (p.x < 0 || p.x > w) p.vx *= -1;
        if (p.y < 0 || p.y > h) p.vy *= -1;
      }
      for (let i = 0; i < pts.length; i++) {
        for (let j = i + 1; j < pts.length; j++) {
          const dx = pts[i].x - pts[j].x;
          const dy = pts[i].y - pts[j].y;
          const dist = Math.sqrt(dx * dx + dy * dy);
          if (dist < MAX_DIST) {
            const alpha = (1 - dist / MAX_DIST) * 0.35;
            ctx.beginPath();
            ctx.strokeStyle = `rgba(${ACCENT},${alpha})`;
            ctx.lineWidth = 1;
            ctx.moveTo(pts[i].x, pts[i].y);
            ctx.lineTo(pts[j].x, pts[j].y);
            ctx.stroke();
          }
        }
      }
      for (const p of pts) {
        ctx.beginPath();
        ctx.arc(p.x, p.y, 1.5, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(${ACCENT},0.6)`;
        ctx.fill();
      }
      raf = requestAnimationFrame(draw);
    };
    draw();
    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("resize", resize);
    };
  }, [count, maxDist]);
  return (
    <canvas
      ref={canvasRef}
      style={{ position: "absolute", inset: 0, width: "100%", height: "100%", pointerEvents: "none", zIndex: 0 }}
    />
  );
}

/* ---------- nav ---------- */
export function navExit(href: string) {
  const overlay = document.createElement("div");
  overlay.style.cssText =
    "position:fixed;inset:0;background:#0d0d0d;z-index:9998;opacity:0;pointer-events:all";
  document.body.appendChild(overlay);
  gsap.to(overlay, {
    opacity: 1, duration: 0.35, ease: "power2.in",
    onComplete: () => { window.location.href = href; },
  });
}

/** Ícono de menú mobile: tres líneas que animan a una X al abrir. */
function HamburgerIcon({ open }: { open: boolean }) {
  const base: React.CSSProperties = {
    position: "absolute",
    left: "50%",
    width: 18,
    height: 2,
    background: "currentColor",
    transition: "transform 220ms ease, opacity 180ms ease, top 220ms ease",
  };
  return (
    <span style={{ position: "relative", width: 20, height: 20, display: "inline-block" }}>
      <span style={{ ...base, top: open ? "50%" : "35%", transform: `translate(-50%, -50%) rotate(${open ? 45 : 0}deg)` }} />
      <span style={{ ...base, top: "50%", transform: "translate(-50%, -50%)", opacity: open ? 0 : 1 }} />
      <span style={{ ...base, top: open ? "50%" : "65%", transform: `translate(-50%, -50%) rotate(${open ? -45 : 0}deg)` }} />
    </span>
  );
}

/**
 * `home`: true cuando se monta en la landing ("/") — los links de sección
 * son anclas puras (#productos). En cualquier otra página, esos mismos
 * links apuntan de vuelta a "/#productos" con la transición de navExit.
 */
export function Nav({ home = true }: { home?: boolean }) {
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);
  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 80);
    window.addEventListener("scroll", onScroll);
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    document.body.style.overflow = open ? "hidden" : "";
    return () => { document.body.style.overflow = ""; };
  }, [open]);

  const sectionHref = (hash: string) => (home ? hash : `/${hash}`);
  const goSection = (hash: string) => (e: React.MouseEvent) => {
    if (!home) {
      e.preventDefault();
      navExit(sectionHref(hash));
    }
  };

  return (
    <header
      className="sticky top-0 z-50 w-full overflow-hidden"
      style={{
        background: "rgba(13,13,13,0.95)",
        backdropFilter: "blur(2px)",
        borderBottom: scrolled ? "1px solid var(--color-border)" : "1px solid transparent",
        transition: "border-color 150ms",
      }}
    >
      <div className="hidden md:block absolute inset-0" style={{ pointerEvents: "none" }}>
        <ParticlesCanvas />
      </div>
      <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-4 relative">
        <a href={home ? "#top" : "/"} className="font-display text-2xl font-extrabold tracking-tight text-[var(--color-text)]">
          DIS<span className="text-[var(--color-accent)]">Hub</span>
        </a>
        <nav className="hidden items-center gap-8 md:flex">
          {[
            ["Qué es", "#hub"],
            ["Planes", "#planes"],
            ["Demo", "/demo"],
            ["Contacto", "#cta"],
          ].map(([l, h]) => {
            const isHash = h.startsWith("#");
            const href = isHash ? sectionHref(h) : h;
            return (
              <a
                key={h}
                href={href}
                className="font-mono-tech text-xs uppercase tracking-wider text-[var(--color-text)] hover:text-[var(--color-accent)] transition-colors"
                onClick={isHash ? goSection(h) : (e) => { e.preventDefault(); navExit(h); }}
              >
                {l}
              </a>
            );
          })}
          <span
            aria-disabled="true"
            title="Próximamente"
            className="font-display text-sm font-bold uppercase tracking-wide px-4 py-2 cursor-not-allowed"
            style={{ border: "2px solid var(--color-muted)", color: "var(--color-muted)" }}
          >
            Acceder — Próximamente
          </span>
        </nav>
        <button
          className="md:hidden flex items-center justify-center transition-colors"
          style={{
            width: "40px",
            height: "40px",
            color: open ? "var(--color-bg)" : "var(--color-text)",
            background: open ? "var(--color-accent)" : "transparent",
            border: `2px solid ${open ? "var(--color-accent)" : "var(--color-border)"}`,
          }}
          onClick={() => setOpen(!open)}
          aria-label={open ? "Cerrar menú" : "Abrir menú"}
          aria-expanded={open}
        >
          <HamburgerIcon open={open} />
        </button>
      </div>
      {open && typeof document !== "undefined" && createPortal(
        <div
          className="md:hidden fixed inset-0 z-999 fade-slide-in overflow-y-auto flex flex-col justify-center"
          style={{ background: "rgba(13,13,13,0.92)", backdropFilter: "blur(10px)" }}
          onClick={() => setOpen(false)}
        >
          <div className="px-8 py-16" onClick={(e) => e.stopPropagation()}>
            <nav className="flex flex-col">
              {[
                ["Qué es", "#hub"],
                ["Planes", "#planes"],
                ["Demo", "/demo"],
                ["Contacto", "#cta"],
              ].map(([l, h]) => {
                const isHash = h.startsWith("#");
                const href = isHash ? sectionHref(h) : h;
                return (
                  <a
                    key={h}
                    href={href}
                    onClick={(e) => { setOpen(false); (isHash ? goSection(h) : (ev: React.MouseEvent) => { ev.preventDefault(); navExit(h); })(e); }}
                    className="font-display text-3xl font-extrabold uppercase tracking-tight text-(--color-text) py-4 flex items-center justify-between transition-colors hover:text-(--color-accent)"
                    style={{ borderBottom: "1px solid var(--color-border)" }}
                  >
                    {l} <ArrowRight size={22} />
                  </a>
                );
              })}
            </nav>
            <span
              aria-disabled="true"
              title="Próximamente"
              className="mt-10 block text-center font-display text-sm font-bold uppercase tracking-wide py-4 cursor-not-allowed"
              style={{ border: "2px solid var(--color-muted)", color: "var(--color-muted)" }}
            >
              Acceder — Próximamente
            </span>
          </div>
        </div>,
        document.body,
      )}
    </header>
  );
}

/**
 * Header simplificado para páginas secundarias (demo, mesa-conectada, etc.):
 * logo + badge opcional + link de vuelta a "Inicio". Sin los links de sección.
 */
export function SimpleNav({ badge }: { badge?: string }) {
  return (
    <header
      className="sticky top-0 z-50 w-full overflow-hidden"
      style={{
        background: "rgba(13,13,13,0.95)",
        backdropFilter: "blur(2px)",
        borderBottom: "1px solid var(--color-border)",
      }}
    >
      <div className="hidden md:block absolute inset-0" style={{ pointerEvents: "none" }}>
        <ParticlesCanvas />
      </div>
      <div className="mx-auto flex max-w-7xl items-center gap-5 px-6 py-4 relative">
        <a href="/" className="font-display text-2xl font-extrabold tracking-tight text-[var(--color-text)]">
          DIS<span className="text-[var(--color-accent)]">Hub</span>
        </a>
        {badge && (
          <div
            className="font-mono-tech text-[10px] font-bold uppercase tracking-widest text-(--color-accent) px-2.5 py-1"
            style={{ border: "1px solid var(--color-accent)" }}
          >
            {badge}
          </div>
        )}
        <a
          href="/"
          onClick={(e) => { e.preventDefault(); navExit("/"); }}
          className="ml-auto font-display text-sm font-bold uppercase tracking-wide text-(--color-accent) px-4 py-2 transition-all hover:bg-(--color-accent) hover:text-(--color-bg)"
          style={{ border: "2px solid var(--color-accent)" }}
        >
          ← Inicio
        </a>
      </div>
    </header>
  );
}

/* ---------- whatsapp ---------- */
function WhatsAppIcon({ size = 26 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
      <path
        d="M12.04 2C6.58 2 2.13 6.45 2.13 11.91c0 1.75.46 3.45 1.32 4.95L2 22l5.28-1.38a9.9 9.9 0 0 0 4.76 1.21h.01c5.46 0 9.91-4.45 9.91-9.91C21.96 6.45 17.5 2 12.04 2Zm0 18.15h-.01a8.2 8.2 0 0 1-4.19-1.15l-.3-.18-3.13.82.84-3.05-.2-.31a8.22 8.22 0 0 1-1.26-4.37c0-4.55 3.7-8.25 8.26-8.25 2.2 0 4.27.86 5.83 2.42a8.19 8.19 0 0 1 2.41 5.84c0 4.55-3.7 8.25-8.26 8.25Zm4.52-6.18c-.25-.12-1.47-.72-1.69-.81-.23-.08-.39-.12-.56.13-.16.24-.64.81-.78.98-.15.16-.29.18-.53.06-.25-.12-1.05-.39-2-1.23-.74-.66-1.24-1.47-1.38-1.72-.15-.24-.02-.38.11-.5.11-.11.25-.29.37-.43.12-.15.16-.24.24-.4.08-.16.04-.31-.02-.43-.06-.12-.56-1.34-.76-1.84-.2-.48-.4-.42-.56-.42-.14-.01-.31-.01-.47-.01-.16 0-.43.06-.66.31-.23.24-.86.85-.86 2.07 0 1.22.89 2.4 1.01 2.57.12.16 1.75 2.67 4.24 3.74.59.26 1.05.41 1.41.53.59.19 1.13.16 1.56.1.48-.07 1.47-.6 1.67-1.18.21-.58.21-1.07.15-1.18-.06-.1-.23-.16-.48-.28Z"
        fill="var(--color-bg)"
      />
    </svg>
  );
}

export function WhatsAppFloatButton() {
  return (
    <a
      href={waLink("float_button")}
      target="_blank"
      rel="noopener"
      onClick={() => track("whatsapp_click", { origen: "float_button" })}
      aria-label="Escribinos por WhatsApp"
      className="fixed bottom-5 right-5 flex items-center justify-center transition-transform hover:-translate-y-0.5"
      style={{
        width: "56px",
        height: "56px",
        borderRadius: "9999px",
        background: "var(--color-accent)",
        border: "2px solid var(--color-bg)",
        boxShadow: "3px 3px 0 var(--color-accent-shadow)",
        zIndex: 100,
      }}
    >
      <WhatsAppIcon />
    </a>
  );
}

/* ---------- brutal button ---------- */
export function BrutalBtn({
  children,
  variant = "primary",
  href = "#",
  className = "",
  target,
  rel,
  onClick,
}: {
  children: React.ReactNode;
  variant?: "primary" | "secondary" | "dark";
  href?: string;
  className?: string;
  target?: string;
  rel?: string;
  onClick?: (e: React.MouseEvent<HTMLAnchorElement>) => void;
}) {
  const base =
    "inline-flex items-center justify-center gap-2 font-display font-extrabold uppercase tracking-wide px-6 py-3 text-sm transition-all duration-150";
  const styles: Record<string, React.CSSProperties> = {
    primary: {
      background: "var(--color-accent)",
      color: "var(--color-bg)",
      border: "none",
      boxShadow: "4px 4px 0 var(--color-accent-shadow)",
    },
    secondary: {
      background: "transparent",
      color: "var(--color-text)",
      border: "2px solid var(--color-border)",
    },
    dark: {
      background: "var(--color-bg)",
      color: "var(--color-accent)",
      boxShadow: "4px 4px 0 rgba(0,0,0,0.3)",
    },
  };
  return (
    <a
      href={href}
      target={target}
      rel={rel}
      onClick={onClick}
      className={`${base} ${className} hover:-translate-x-0.5 hover:-translate-y-0.5`}
      style={styles[variant]}
      onMouseEnter={(e) => {
        if (variant === "primary") (e.currentTarget as HTMLElement).style.boxShadow = "6px 6px 0 var(--color-accent-shadow)";
        if (variant === "dark") (e.currentTarget as HTMLElement).style.boxShadow = "6px 6px 0 rgba(0,0,0,0.3)";
      }}
      onMouseLeave={(e) => {
        if (variant === "primary") (e.currentTarget as HTMLElement).style.boxShadow = "4px 4px 0 var(--color-accent-shadow)";
        if (variant === "dark") (e.currentTarget as HTMLElement).style.boxShadow = "4px 4px 0 rgba(0,0,0,0.3)";
      }}
    >
      {children}
    </a>
  );
}

/* ---------- accordion (FAQ) ---------- */
export function AccordionItem({ q, a }: { q: string; a: string }) {
  const [open, setOpen] = useState(false);
  return (
    <div
      className="reveal"
      style={{ background: "var(--color-surface)", border: "1px solid var(--color-border)" }}
    >
      <button
        type="button"
        aria-expanded={open}
        onClick={() => setOpen((o) => !o)}
        className="w-full text-left cursor-pointer p-5 flex items-center justify-between gap-4 font-display font-bold text-(--color-text)"
      >
        {q}
        <span
          className="shrink-0 font-mono-tech text-(--color-accent) text-lg transition-transform duration-300"
          style={{ transform: open ? "rotate(135deg)" : "rotate(0deg)" }}
        >
          +
        </span>
      </button>
      <div
        className="grid transition-[grid-template-rows] duration-300 ease-out"
        style={{ gridTemplateRows: open ? "1fr" : "0fr" }}
      >
        <div className="overflow-hidden">
          <p
            className="font-sans text-sm text-(--color-muted) leading-relaxed px-5 pb-5 transition-opacity duration-300"
            style={{ opacity: open ? 1 : 0 }}
          >
            {a}
          </p>
        </div>
      </div>
    </div>
  );
}

/* ---------- closing CTA (páginas que no son el index) ---------- */
export function ClosingCTA() {
  return (
    <section style={{ background: "var(--color-accent)" }}>
      <div className="mx-auto max-w-7xl px-6 py-24">
        <h2 className="reveal font-display font-extrabold leading-[0.95] text-(--color-bg) text-[40px] sm:text-6xl lg:text-[64px] mb-10">
          ¿QUERÉS ESTO<br />PARA TU RESTAURANTE?
        </h2>
        <div className="reveal flex flex-wrap gap-4">
          <BrutalBtn variant="dark" href="/#planes">Ver planes <ArrowRight size={16} /></BrutalBtn>
          <a
            href="/agendar"
            className="inline-flex items-center justify-center gap-2 font-display font-extrabold uppercase tracking-wide px-6 py-3 text-sm transition-all hover:-translate-x-0.5 hover:-translate-y-0.5"
            style={{ background: "transparent", color: "var(--color-bg)", border: "2px solid var(--color-bg)" }}
          >
            Agendar demo
          </a>
        </div>
      </div>
    </section>
  );
}

/* ---------- preloader ---------- */
export function Preloader({ onDone }: { onDone: () => void }) {
  const ref = useRef<HTMLDivElement>(null);
  const pctRef = useRef<HTMLSpanElement>(null);

  useEffect(() => {
    const el = ref.current;
    const pct = pctRef.current;
    if (!el) return;

    gsap.set("[data-pre]", { y: "110%" });

    const counter = { val: 0 };
    gsap.to(counter, {
      val: 100, duration: 1.1, ease: "power1.inOut",
      onUpdate: () => { if (pct) pct.textContent = Math.round(counter.val) + "%"; },
    });

    const tl = gsap.timeline({ onComplete: onDone });
    tl.to("[data-pre]", { y: "0%", duration: 0.7, ease: "power4.out" })
      .to(el, { opacity: 0, duration: 0.4, delay: 0.5, ease: "power2.inOut" });

    return () => { tl.kill(); };
  }, [onDone]);

  return (
    <div
      ref={ref}
      style={{
        position: "fixed", inset: 0, zIndex: 9999,
        background: "#000",
        display: "flex", alignItems: "center", justifyContent: "center",
        pointerEvents: "none",
      }}
    >
      <div style={{ overflow: "hidden" }}>
        <span
          data-pre
          style={{
            display: "block",
            fontFamily: "var(--font-display)",
            fontSize: "clamp(52px, 10vw, 100px)",
            fontWeight: 800,
            letterSpacing: "-0.03em",
            lineHeight: 1,
            transform: "translateY(110%)",
          }}
        >
          <span style={{ color: "#f5f0e8" }}>DIS</span>
          <span style={{ color: "#E8743B" }}>Hub</span>
        </span>
      </div>
      <span
        ref={pctRef}
        style={{
          position: "absolute", bottom: 32, right: 40,
          fontFamily: "var(--font-mono)",
          fontSize: "11px",
          letterSpacing: "0.08em",
          color: "#333",
        }}
      >
        0%
      </span>
    </div>
  );
}

/* ---------- footer ---------- */
export function Footer({ home = true }: { home?: boolean }) {
  const planesHref = home ? "#planes" : "/#planes";
  return (
    <footer style={{ borderTop: "2px solid var(--color-border)" }}>
      <div className="mx-auto max-w-7xl px-6 py-16 grid sm:grid-cols-2 lg:grid-cols-4 gap-10">
        <div>
          <div className="font-display text-2xl font-extrabold mb-4">
            DIS<span className="text-[var(--color-accent)]">Hub</span>
          </div>
          <p className="font-sans text-sm text-[var(--color-muted)] leading-relaxed mb-4">
            La plataforma tech para gastronomía.
          </p>
          <p className="font-mono-tech text-xs uppercase text-[var(--color-muted)]">
            Buenos Aires, Argentina<br />
            hola@getdishub.app
          </p>
          <p className="font-mono-tech text-xs uppercase mt-3">
            <a
              href="https://www.instagram.com/dishubapp/"
              target="_blank"
              rel="noopener me"
              className="text-[var(--color-muted)] hover:text-[var(--color-accent)] transition-colors"
            >
              Instagram @dishubapp
            </a>
          </p>
        </div>
        <div>
          <div className="font-mono-tech text-xs uppercase tracking-widest text-[var(--color-text)] mb-4">Productos</div>
          <ul className="space-y-2 font-sans text-sm text-[var(--color-muted)]">
            <li><a href={planesHref} className="hover:text-[var(--color-accent)] transition-colors">Carta digital</a></li>
            <li><a href={planesHref} className="hover:text-[var(--color-accent)] transition-colors">Pedido por WhatsApp</a></li>
            <li><a href={planesHref} className="hover:text-[var(--color-accent)] transition-colors">Hosting</a></li>
            <li><a href="/carta-digital-para-cafes" className="hover:text-[var(--color-accent)] transition-colors">Para cafés</a></li>
            <li><a href="/carta-digital-para-pizzerias" className="hover:text-[var(--color-accent)] transition-colors">Para pizzerías</a></li>
            <li><a href="/menu-qr-para-restaurantes" className="hover:text-[var(--color-accent)] transition-colors">Para restaurantes</a></li>
            <li><a href="/carta-digital-para-food-trucks" className="hover:text-[var(--color-accent)] transition-colors">Para food trucks</a></li>
          </ul>
        </div>
        <div>
          <div className="font-mono-tech text-xs uppercase tracking-widest text-[var(--color-text)] mb-4">Legal</div>
          <ul className="space-y-2 font-sans text-sm text-[var(--color-muted)]">
            <li><a href="#" className="hover:text-[var(--color-accent)] transition-colors">Términos</a></li>
            <li><a href="#" className="hover:text-[var(--color-accent)] transition-colors">Privacidad</a></li>
          </ul>
        </div>
        <div>
          <div className="font-mono-tech text-xs uppercase tracking-widest text-[var(--color-text)] mb-4">Contacto</div>
          <ul className="space-y-2 font-sans text-sm text-[var(--color-muted)]">
            <li><a href="mailto:hola@getdishub.app" className="hover:text-[var(--color-accent)] transition-colors">hola@getdishub.app</a></li>
          </ul>
        </div>
      </div>
      <div className="border-t border-[var(--color-border)]">
        <div className="mx-auto max-w-7xl px-6 py-6 flex flex-wrap items-center justify-between gap-4">
          <p className="font-mono-tech text-xs uppercase text-[var(--color-muted)]">
            © {new Date().getFullYear()} Dishub. Hecho x{" "}
              <a
                href="https://cufadev.xyz"
                target="_blank"
                rel="noopener noreferrer"
                className="text-(--color-accent) hover:underline"
              >
                Cufa
              </a>{" "}
              con 🧉 en Argentina.
          </p>
          <p className="font-mono-tech text-xs uppercase text-[var(--color-accent)]">getdishub.app</p>
        </div>
      </div>
    </footer>
  );
}
