import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";

export const Route = createFileRoute("/carta/$slug")({
  head: ({ params }) => ({
    meta: [{ title: `Carta | ${params.slug}` }, { name: "robots", content: "noindex, follow" }],
  }),
  component: CartaPage,
});

type Venue = {
  id: string;
  name: string;
  slug: string;
  status: string;
};

type Category = {
  id: string;
  name: string;
  sort_order: number;
};

type Product = {
  id: string;
  category_id: string;
  name: string;
  description: string | null;
  price: number;
  photo_url: string | null;
  sort_order: number;
};

function CartaPage() {
  const { slug } = Route.useParams();
  const [venue, setVenue] = useState<Venue | null | undefined>(undefined);
  const [categories, setCategories] = useState<Category[]>([]);
  const [products, setProducts] = useState<Product[]>([]);

  useEffect(() => {
    supabase
      .from("venues")
      .select("id, name, slug, status")
      .eq("slug", slug)
      .eq("status", "active")
      .maybeSingle()
      .then(async ({ data }) => {
        const v = data as Venue | null;
        setVenue(v ?? null);
        if (!v) return;

        const [{ data: cats }, { data: prods }] = await Promise.all([
          supabase.from("menu_categories").select("id, name, sort_order").eq("venue_id", v.id).order("sort_order"),
          supabase
            .from("menu_products")
            .select("id, category_id, name, description, price, photo_url, sort_order")
            .eq("venue_id", v.id)
            .eq("available", true)
            .order("sort_order"),
        ]);
        setCategories((cats as Category[]) ?? []);
        setProducts((prods as Product[]) ?? []);
      });
  }, [slug]);

  if (venue === undefined) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ background: "var(--color-bg)" }}>
        <p className="font-mono-tech text-xs uppercase tracking-widest text-(--color-muted)">Cargando…</p>
      </div>
    );
  }

  if (!venue) {
    return (
      <div className="min-h-screen flex items-center justify-center px-6" style={{ background: "var(--color-bg)" }}>
        <p className="font-sans text-sm text-(--color-muted)">Esta carta no está disponible.</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen" style={{ background: "var(--color-bg)" }}>
      <header className="px-6 py-10 text-center" style={{ borderBottom: "1px solid var(--color-border)" }}>
        <h1 className="font-display text-3xl font-extrabold text-(--color-text)">{venue.name}</h1>
      </header>

      <main className="mx-auto max-w-2xl px-6 py-10 space-y-10">
        {categories.length === 0 && (
          <p className="font-sans text-sm text-(--color-muted) text-center">
            Esta carta todavía no tiene productos cargados.
          </p>
        )}

        {categories.map((category) => {
          const items = products.filter((p) => p.category_id === category.id);
          if (items.length === 0) return null;
          return (
            <section key={category.id}>
              <h2
                className="font-display text-lg font-bold text-(--color-accent) uppercase tracking-wide mb-4 pb-2"
                style={{ borderBottom: "2px solid var(--color-accent)" }}
              >
                {category.name}
              </h2>
              <div className="space-y-5">
                {items.map((product) => (
                  <div key={product.id} className="flex items-start gap-4">
                    {product.photo_url && (
                      <img
                        src={product.photo_url}
                        alt={product.name}
                        className="w-16 h-16 object-cover shrink-0"
                        style={{ border: "1px solid var(--color-border)" }}
                      />
                    )}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-baseline justify-between gap-3">
                        <p className="font-sans text-sm font-semibold text-(--color-text)">{product.name}</p>
                        <p className="font-mono-tech text-sm text-(--color-text) shrink-0">${product.price}</p>
                      </div>
                      {product.description && (
                        <p className="font-sans text-xs text-(--color-muted) mt-1">{product.description}</p>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </section>
          );
        })}
      </main>

      <footer className="px-6 py-8 text-center">
        <p className="font-mono-tech text-[10px] uppercase tracking-widest text-(--color-muted)">
          Carta digital por DISHub
        </p>
      </footer>
    </div>
  );
}
