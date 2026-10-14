import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { LogOut, ExternalLink, Plus, Trash2, ImagePlus } from "lucide-react";
import { SimpleNav } from "@/components/site";
import { useRole } from "@/lib/auth";
import { supabase } from "@/lib/supabase";

export const Route = createFileRoute("/dashboard")({
  head: () => ({
    meta: [
      { title: "Panel | DISHub" },
      { name: "robots", content: "noindex, nofollow" },
    ],
  }),
  validateSearch: (search: Record<string, unknown>) => ({
    venue: typeof search.venue === "string" ? search.venue : undefined,
  }),
  component: DashboardPage,
});

const PLAN_LABELS: Record<string, string> = {
  menu_digital: "Menú Digital",
  starter: "Starter",
  pro: "PRO",
  table_hub: "Table Hub",
};

type Venue = {
  id: string;
  name: string;
  slug: string;
  plan: string;
  status: string;
};

type Category = {
  id: string;
  venue_id: string;
  name: string;
  sort_order: number;
};

type Product = {
  id: string;
  venue_id: string;
  category_id: string;
  name: string;
  description: string | null;
  price: number;
  photo_url: string | null;
  available: boolean;
  sort_order: number;
};

function DashboardPage() {
  const navigate = useNavigate();
  const { venue: impersonateVenueId } = Route.useSearch();
  const { loading, isSuperadmin, session } = useRole();
  const [venue, setVenue] = useState<Venue | null | undefined>(undefined);
  const [fetchError, setFetchError] = useState("");

  const impersonating = isSuperadmin && !!impersonateVenueId;

  useEffect(() => {
    if (loading) return;
    if (!session) {
      navigate({ to: "/login" });
      return;
    }
    if (isSuperadmin && !impersonateVenueId) {
      navigate({ to: "/admin" });
    }
  }, [loading, session, isSuperadmin, impersonateVenueId, navigate]);

  useEffect(() => {
    if (!session) return;

    if (impersonating) {
      supabase
        .from("venues")
        .select("id, name, slug, plan, status")
        .eq("id", impersonateVenueId)
        .maybeSingle()
        .then(({ data, error }) => {
          if (error) {
            setFetchError(error.message);
            return;
          }
          setVenue((data as Venue) ?? null);
        });
      return;
    }

    if (isSuperadmin) return;

    supabase
      .from("memberships")
      .select("venues(id, name, slug, plan, status)")
      .eq("user_id", session.user.id)
      .limit(1)
      .maybeSingle()
      .then(({ data, error }) => {
        if (error) {
          setFetchError(error.message);
          return;
        }
        setVenue((data?.venues as unknown as Venue) ?? null);
      });
  }, [session, isSuperadmin, impersonating, impersonateVenueId]);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    navigate({ to: "/login" });
  };

  if (loading || (isSuperadmin && !impersonateVenueId) || venue === undefined) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ background: "var(--color-bg)" }}>
        <p className="font-mono-tech text-xs uppercase tracking-widest text-(--color-muted)">Cargando…</p>
      </div>
    );
  }

  if (fetchError || !venue) {
    return (
      <div className="min-h-screen" style={{ background: "var(--color-bg)" }}>
        <SimpleNav badge="Panel" />
        <main className="mx-auto max-w-lg px-6 py-20 text-center">
          <p className="font-sans text-sm text-(--color-muted)">
            {fetchError || "Tu usuario todavía no está asociado a ningún venue. Contactanos si esto es un error."}
          </p>
        </main>
      </div>
    );
  }

  if (venue.status !== "active" && !impersonating) {
    return (
      <div className="min-h-screen flex items-center justify-center px-6" style={{ background: "var(--color-bg)" }}>
        <div className="max-w-md text-center p-8" style={{ border: "1px solid var(--color-border)", background: "var(--color-surface)" }}>
          <h1 className="font-display text-xl font-bold text-(--color-text) mb-3">Cuenta suspendida</h1>
          <p className="font-sans text-sm text-(--color-muted) leading-relaxed mb-6">
            El acceso a "{venue.name}" está temporalmente suspendido. Escribinos para regularizar tu cuenta.
          </p>
          <button
            onClick={handleLogout}
            className="font-display text-sm font-bold uppercase tracking-wide px-4 py-2.5"
            style={{ border: "1px solid var(--color-border)", color: "var(--color-text)" }}
          >
            Salir
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen" style={{ background: "var(--color-bg)" }}>
      {impersonating && (
        <div
          className="sticky top-0 z-60 flex items-center justify-center gap-3 px-4 py-2.5 flex-wrap"
          style={{ background: "var(--color-accent)" }}
        >
          <p className="font-mono-tech text-xs font-bold uppercase tracking-widest text-(--color-bg)">
            Viendo como {venue.name}
          </p>
          <button
            onClick={() => navigate({ to: "/admin" })}
            className="font-mono-tech text-xs font-bold uppercase tracking-widest text-(--color-bg) underline"
          >
            Volver al panel admin
          </button>
        </div>
      )}

      <SimpleNav badge="Panel" />

      <main className="mx-auto max-w-3xl px-6 py-16">
        <div className="flex items-start justify-between mb-10">
          <div>
            <h1 className="font-display text-2xl font-extrabold text-(--color-text)">{venue.name}</h1>
            <a
              href={`/carta/${venue.slug}`}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 font-mono-tech text-xs text-(--color-muted) hover:text-(--color-accent) transition-colors mt-1"
            >
              {venue.slug}.getdishub.app <ExternalLink size={12} />
            </a>
          </div>
          {!impersonating && (
            <button
              onClick={handleLogout}
              className="inline-flex items-center gap-2 font-mono-tech text-xs uppercase tracking-widest text-(--color-muted) hover:text-(--color-text) transition-colors px-3 py-2"
              style={{ border: "1px solid var(--color-border)" }}
            >
              <LogOut size={14} /> Salir
            </button>
          )}
        </div>

        <div
          className="inline-block font-mono-tech text-[10px] uppercase tracking-widest text-(--color-accent) px-2.5 py-1 mb-6"
          style={{ border: "1px solid var(--color-accent)" }}
        >
          Plan {PLAN_LABELS[venue.plan] ?? venue.plan}
        </div>

        <MenuEditor venue={venue} />
      </main>
    </div>
  );
}

function MenuEditor({ venue }: { venue: Venue }) {
  const [categories, setCategories] = useState<Category[] | null>(null);
  const [products, setProducts] = useState<Product[]>([]);
  const [error, setError] = useState("");
  const [newCategoryName, setNewCategoryName] = useState("");

  const loadMenu = async () => {
    const [{ data: cats, error: catError }, { data: prods, error: prodError }] = await Promise.all([
      supabase.from("menu_categories").select("*").eq("venue_id", venue.id).order("sort_order"),
      supabase.from("menu_products").select("*").eq("venue_id", venue.id).order("sort_order"),
    ]);
    if (catError || prodError) {
      setError((catError ?? prodError)!.message);
      return;
    }
    setCategories((cats as Category[]) ?? []);
    setProducts((prods as Product[]) ?? []);
  };

  useEffect(() => {
    loadMenu();
  }, [venue.id]);

  const addCategory = async () => {
    const name = newCategoryName.trim();
    if (!name) return;
    const sort_order = (categories?.length ?? 0) * 10;
    const { data, error: insertError } = await supabase
      .from("menu_categories")
      .insert({ venue_id: venue.id, name, sort_order })
      .select()
      .single();
    if (insertError) {
      setError(insertError.message);
      return;
    }
    setCategories((prev) => [...(prev ?? []), data as Category]);
    setNewCategoryName("");
  };

  const deleteCategory = async (category: Category) => {
    const confirmed = window.confirm(`Borrar "${category.name}" y todos sus productos?`);
    if (!confirmed) return;
    const { error: deleteError } = await supabase.from("menu_categories").delete().eq("id", category.id);
    if (deleteError) {
      setError(deleteError.message);
      return;
    }
    setCategories((prev) => prev?.filter((c) => c.id !== category.id) ?? prev);
    setProducts((prev) => prev.filter((p) => p.category_id !== category.id));
  };

  if (categories === null) {
    return <p className="font-sans text-sm text-(--color-muted)">Cargando carta…</p>;
  }

  return (
    <div className="space-y-6">
      {error && <p className="font-sans text-sm text-(--color-accent)">{error}</p>}

      {categories.length === 0 && (
        <div className="p-8 text-center" style={{ border: "1px solid var(--color-border)", background: "var(--color-surface)" }}>
          <p className="font-sans text-sm text-(--color-muted)">Todavía no cargaste ninguna categoría.</p>
        </div>
      )}

      {categories.map((category) => (
        <CategoryCard
          key={category.id}
          venue={venue}
          category={category}
          products={products.filter((p) => p.category_id === category.id)}
          onDeleteCategory={() => deleteCategory(category)}
          onProductsChange={(updater) => setProducts(updater)}
          onError={setError}
        />
      ))}

      <div className="flex items-center gap-2 p-4" style={{ border: "1px dashed var(--color-border)" }}>
        <input
          value={newCategoryName}
          onChange={(e) => setNewCategoryName(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && addCategory()}
          placeholder="Nombre de la categoría (ej: Entradas)"
          className="flex-1 font-sans text-sm px-3 py-2 bg-transparent text-(--color-text) placeholder:text-(--color-muted)"
          style={{ border: "1px solid var(--color-border)" }}
        />
        <button
          onClick={addCategory}
          className="inline-flex items-center gap-1.5 font-display text-xs font-bold uppercase tracking-wide px-3 py-2 shrink-0"
          style={{ background: "var(--color-accent)", color: "var(--color-bg)" }}
        >
          <Plus size={14} /> Agregar
        </button>
      </div>
    </div>
  );
}

function CategoryCard({
  venue,
  category,
  products,
  onDeleteCategory,
  onProductsChange,
  onError,
}: {
  venue: Venue;
  category: Category;
  products: Product[];
  onDeleteCategory: () => void;
  onProductsChange: (updater: (prev: Product[]) => Product[]) => void;
  onError: (message: string) => void;
}) {
  const [showForm, setShowForm] = useState(false);

  const addProduct = async (input: { name: string; description: string; price: string; photoFile: File | null }) => {
    const price = parseFloat(input.price.replace(",", "."));
    if (!input.name.trim() || Number.isNaN(price)) {
      onError("Nombre y precio son obligatorios.");
      return;
    }

    let photo_url: string | null = null;
    if (input.photoFile) {
      const path = `${venue.id}/${crypto.randomUUID()}-${input.photoFile.name}`;
      const { error: uploadError } = await supabase.storage.from("menu-photos").upload(path, input.photoFile);
      if (uploadError) {
        onError(uploadError.message);
        return;
      }
      photo_url = supabase.storage.from("menu-photos").getPublicUrl(path).data.publicUrl;
    }

    const sort_order = products.length * 10;
    const { data, error: insertError } = await supabase
      .from("menu_products")
      .insert({
        venue_id: venue.id,
        category_id: category.id,
        name: input.name.trim(),
        description: input.description.trim() || null,
        price,
        photo_url,
        sort_order,
      })
      .select()
      .single();

    if (insertError) {
      onError(insertError.message);
      return;
    }
    onProductsChange((prev) => [...prev, data as Product]);
    setShowForm(false);
  };

  const toggleAvailable = async (product: Product) => {
    const available = !product.available;
    onProductsChange((prev) => prev.map((p) => (p.id === product.id ? { ...p, available } : p)));
    await supabase.from("menu_products").update({ available }).eq("id", product.id);
  };

  const deleteProduct = async (product: Product) => {
    const confirmed = window.confirm(`Borrar "${product.name}"?`);
    if (!confirmed) return;
    const { error: deleteError } = await supabase.from("menu_products").delete().eq("id", product.id);
    if (deleteError) {
      onError(deleteError.message);
      return;
    }
    onProductsChange((prev) => prev.filter((p) => p.id !== product.id));
  };

  return (
    <div style={{ border: "1px solid var(--color-border)", background: "var(--color-surface)" }}>
      <div className="flex items-center justify-between px-5 py-3.5" style={{ borderBottom: "1px solid var(--color-border)" }}>
        <h3 className="font-display text-sm font-bold text-(--color-text)">{category.name}</h3>
        <button
          onClick={onDeleteCategory}
          aria-label="Borrar categoría"
          className="p-1.5 text-(--color-muted) hover:text-(--color-accent) transition-colors"
        >
          <Trash2 size={14} />
        </button>
      </div>

      <div className="p-5 space-y-3">
        {products.map((product) => (
          <div key={product.id} className="flex items-center gap-3">
            {product.photo_url ? (
              <img src={product.photo_url} alt={product.name} className="w-12 h-12 object-cover shrink-0" style={{ border: "1px solid var(--color-border)" }} />
            ) : (
              <div className="w-12 h-12 shrink-0 flex items-center justify-center" style={{ border: "1px solid var(--color-border)" }}>
                <ImagePlus size={16} className="text-(--color-muted)" />
              </div>
            )}
            <div className="flex-1 min-w-0">
              <p className="font-sans text-sm text-(--color-text) truncate">{product.name}</p>
              {product.description && (
                <p className="font-sans text-xs text-(--color-muted) truncate">{product.description}</p>
              )}
            </div>
            <p className="font-mono-tech text-sm text-(--color-text) shrink-0">${product.price}</p>
            <button
              onClick={() => toggleAvailable(product)}
              className="font-mono-tech text-[10px] uppercase tracking-widest px-2 py-1 shrink-0"
              style={{
                border: "1px solid var(--color-border)",
                color: product.available ? "var(--color-accent)" : "var(--color-muted)",
              }}
            >
              {product.available ? "Disponible" : "Pausado"}
            </button>
            <button
              onClick={() => deleteProduct(product)}
              aria-label="Borrar producto"
              className="p-1.5 text-(--color-muted) hover:text-(--color-accent) transition-colors shrink-0"
            >
              <Trash2 size={14} />
            </button>
          </div>
        ))}

        {showForm ? (
          <ProductForm onSubmit={addProduct} onCancel={() => setShowForm(false)} />
        ) : (
          <button
            onClick={() => setShowForm(true)}
            className="inline-flex items-center gap-1.5 font-mono-tech text-xs uppercase tracking-widest text-(--color-muted) hover:text-(--color-text) transition-colors px-3 py-2"
            style={{ border: "1px dashed var(--color-border)" }}
          >
            <Plus size={12} /> Agregar producto
          </button>
        )}
      </div>
    </div>
  );
}

function ProductForm({
  onSubmit,
  onCancel,
}: {
  onSubmit: (input: { name: string; description: string; price: string; photoFile: File | null }) => void;
  onCancel: () => void;
}) {
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [price, setPrice] = useState("");
  const [photoFile, setPhotoFile] = useState<File | null>(null);

  return (
    <div className="p-4 space-y-2" style={{ border: "1px solid var(--color-border)" }}>
      <input
        value={name}
        onChange={(e) => setName(e.target.value)}
        placeholder="Nombre del plato*"
        className="w-full font-sans text-sm px-3 py-2 bg-transparent text-(--color-text) placeholder:text-(--color-muted)"
        style={{ border: "1px solid var(--color-border)" }}
      />
      <input
        value={description}
        onChange={(e) => setDescription(e.target.value)}
        placeholder="Reseña / descripción"
        className="w-full font-sans text-sm px-3 py-2 bg-transparent text-(--color-text) placeholder:text-(--color-muted)"
        style={{ border: "1px solid var(--color-border)" }}
      />
      <input
        value={price}
        onChange={(e) => setPrice(e.target.value)}
        placeholder="Precio*"
        inputMode="decimal"
        className="w-full font-sans text-sm px-3 py-2 bg-transparent text-(--color-text) placeholder:text-(--color-muted)"
        style={{ border: "1px solid var(--color-border)" }}
      />
      <input
        type="file"
        accept="image/*"
        onChange={(e) => setPhotoFile(e.target.files?.[0] ?? null)}
        className="w-full font-sans text-xs text-(--color-muted)"
      />
      <div className="flex items-center gap-2 pt-1">
        <button
          onClick={() => onSubmit({ name, description, price, photoFile })}
          className="font-display text-xs font-bold uppercase tracking-wide px-3 py-2"
          style={{ background: "var(--color-accent)", color: "var(--color-bg)" }}
        >
          Guardar
        </button>
        <button
          onClick={onCancel}
          className="font-mono-tech text-[10px] uppercase tracking-widest text-(--color-muted) hover:text-(--color-text) transition-colors px-3 py-2"
          style={{ border: "1px solid var(--color-border)" }}
        >
          Cancelar
        </button>
      </div>
    </div>
  );
}
