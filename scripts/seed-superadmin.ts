/**
 * Da de alta (o promueve) al usuario superadmin de DISHub.
 * Corre server-side, nunca en el navegador.
 *
 * Uso:
 *   SUPABASE_URL=... \
 *   SUPABASE_SERVICE_ROLE_KEY=... \
 *   SUPERADMIN_EMAIL=... \
 *   SUPERADMIN_PASSWORD=... \
 *   npx tsx scripts/seed-superadmin.ts
 */
import { createClient } from "@supabase/supabase-js";

const url = process.env.VITE_SUPABASE_URL ?? process.env.SUPABASE_URL;
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
const email = process.env.SUPERADMIN_EMAIL;
const password = process.env.SUPERADMIN_PASSWORD;

if (!url || !serviceRoleKey || !email || !password) {
  console.error(
    "Faltan variables. Necesitás: SUPABASE_URL (o VITE_SUPABASE_URL), SUPABASE_SERVICE_ROLE_KEY, SUPERADMIN_EMAIL, SUPERADMIN_PASSWORD.",
  );
  process.exit(1);
}

const supabase = createClient(url, serviceRoleKey, {
  auth: { autoRefreshToken: false, persistSession: false },
});

async function findUserByEmail(targetEmail: string) {
  let page = 1;
  const perPage = 200;
  while (true) {
    const { data, error } = await supabase.auth.admin.listUsers({ page, perPage });
    if (error) throw error;
    const found = data.users.find((u) => u.email?.toLowerCase() === targetEmail.toLowerCase());
    if (found) return found;
    if (data.users.length < perPage) return null;
    page += 1;
  }
}

async function main() {
  const existing = await findUserByEmail(email!);

  if (existing) {
    const { error } = await supabase.auth.admin.updateUserById(existing.id, {
      app_metadata: { ...existing.app_metadata, role: "superadmin" },
    });
    if (error) throw error;
    console.log(`✓ Usuario existente (${email}) promovido a superadmin. id=${existing.id}`);
    return;
  }

  const { data, error } = await supabase.auth.admin.createUser({
    email: email!,
    password: password!,
    email_confirm: true,
    app_metadata: { role: "superadmin" },
  });
  if (error) throw error;
  console.log(`✓ Superadmin creado (${email}). id=${data.user?.id}`);
}

main().catch((err) => {
  console.error("✗ Falló el seed:", err.message ?? err);
  process.exit(1);
});
