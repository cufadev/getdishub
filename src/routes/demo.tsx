import { createFileRoute } from "@tanstack/react-router";
import { useCallback, useEffect, useRef, useState } from "react";
import gsap from "gsap";

export const Route = createFileRoute("/demo")({
  head: () => ({
    meta: [
      { title: "Demo interactivo | DISHub" },
      { name: "description", content: "Probá en vivo la carta digital de DISHub: la vista del cliente y la planilla de Google que edita el dueño. Sin registro." },
      { property: "og:title", content: "Demo interactivo | DISHub" },
      { property: "og:description", content: "Probá la carta digital y la planilla que la actualiza en tiempo real." },
      { property: "og:url", content: "https://getdishub.app/demo" },
    ],
    links: [
      { rel: "canonical", href: "https://getdishub.app/demo" },
    ],
  }),
  component: DemoPage,
});

function DemoPreloader({ onDone }: { onDone: () => void }) {
  const ref = useRef<HTMLDivElement>(null);
  const pctRef = useRef<HTMLSpanElement>(null);

  useEffect(() => {
    const el = ref.current;
    const pct = pctRef.current;
    if (!el) return;

    gsap.set("[data-demo-pre]", { y: "110%" });

    const counter = { val: 0 };
    gsap.to(counter, {
      val: 100, duration: 1.1, ease: "power1.inOut",
      onUpdate: () => { if (pct) pct.textContent = Math.round(counter.val) + "%"; },
    });

    const tl = gsap.timeline({ onComplete: onDone });
    tl.to("[data-demo-pre]", { y: "0%", duration: 0.7, ease: "power4.out" })
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
          data-demo-pre
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

function DemoPage() {
  const [ready, setReady] = useState(false);
  const iframeRef = useRef<HTMLIFrameElement>(null);

  const onDone = useCallback(() => setReady(true), []);

  useEffect(() => {
    if (!ready || !iframeRef.current) return;
    gsap.fromTo(
      iframeRef.current,
      { opacity: 0, y: 18 },
      { opacity: 1, y: 0, duration: 0.65, ease: "power3.out" },
    );
  }, [ready]);

  return (
    <>
      {!ready && <DemoPreloader onDone={onDone} />}
      <iframe
        ref={iframeRef}
        src="/demo/index.html"
        title="DISHub — Demo interactivo"
        style={{ display: "block", width: "100%", height: "100vh", border: "none", opacity: 0 }}
      />
    </>
  );
}
