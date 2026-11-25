import "server-only";
import postgres from "postgres";
import { DEFAULT_SETTINGS, SEED_LOOKS, SEED_PRODUCTS } from "./seed";

const url = process.env.DATABASE_URL || process.env.POSTGRES_URL || "";
export const hasDb = url.length > 0;

type Sql = ReturnType<typeof postgres>;
const g = globalThis as unknown as { __vardeSql?: Sql; __vardeReady?: Promise<void> };

function client(): Sql {
  if (!g.__vardeSql) {
    const local = /localhost|127\.0\.0\.1/.test(url);
    g.__vardeSql = postgres(url, { ssl: local ? false : "require", max: 5, prepare: false, idle_timeout: 20 });
  }
  return g.__vardeSql;
}

/** Returns a ready SQL client: schema created and catalogue seeded on first use. */
export async function db(): Promise<Sql> {
  if (!hasDb) throw new Error("Database not connected");
  const sql = client();
  g.__vardeReady ??= setup(sql).catch((e) => { g.__vardeReady = undefined; throw e; });
  await g.__vardeReady;
  return sql;
}

async function setup(sql: Sql) {
  await sql.unsafe(`
    create table if not exists looks (
      id int primary key, name text not null, model text not null
    );
    create table if not exists products (
      id serial primary key,
      slug text unique not null,
      name text not null,
      price int not null,
      category text not null,
      color text not null default '#cccccc',
      color_name text not null default '',
      img text not null,
      look_id int references looks(id) on delete set null,
      stock int not null default 0,
      description text not null default '',
      material text not null default '',
      care text not null default '',
      published boolean not null default true,
      created_at timestamptz not null default now()
    );
    create table if not exists customers (
      id serial primary key,
      email text unique not null,
      name text not null default '',
      password_hash text,
      sample boolean not null default false,
      created_at timestamptz not null default now()
    );
    create table if not exists orders (
      id serial primary key,
      number text unique not null,
      email text not null,
      name text not null,
      phone text not null default '',
      address jsonb not null,
      delivery text not null default 'standard',
      items jsonb not null,
      subtotal int not null,
      shipping int not null,
      total int not null,
      status text not null default 'paid',
      sample boolean not null default false,
      created_at timestamptz not null default now()
    );
    create table if not exists messages (
      id serial primary key, name text not null, email text not null, subject text not null default '',
      body text not null, read boolean not null default false, created_at timestamptz not null default now()
    );
    create table if not exists newsletter (email text primary key, created_at timestamptz not null default now());
    create table if not exists settings (key text primary key, value jsonb not null);
    create table if not exists discounts (
      code text primary key, kind text not null default 'percent', value int not null,
      min_subtotal int not null default 0, max_uses int, uses int not null default 0,
      expires_at timestamptz, active boolean not null default true, created_at timestamptz not null default now()
    );
    create table if not exists reviews (
      id serial primary key, product_id int not null references products(id) on delete cascade,
      name text not null, email text not null, rating int not null check (rating between 1 and 5),
      title text not null default '', body text not null, approved boolean not null default false,
      created_at timestamptz not null default now()
    );
    create index if not exists reviews_product on reviews(product_id) where approved;
    create table if not exists waitlist (
      id serial primary key, product_id int not null references products(id) on delete cascade,
      email text not null, created_at timestamptz not null default now(), unique (product_id, email)
    );
    alter table orders add column if not exists discount int not null default 0;
    alter table orders add column if not exists discount_code text;
  `);
  // one-time starter code, only on the first run that has the discounts table
  const first = await sql`insert into settings (key, value) values ('discounts_seeded', 'true') on conflict do nothing returning key`;
  if (first.length) await sql`insert into discounts (code, kind, value, min_subtotal) values ('WELCOME10', 'percent', 10, 0) on conflict do nothing`;

  const [{ n }] = await sql`select count(*)::int as n from looks`;
  if (n > 0) return;

  await sql.begin(async (tx) => {
    for (const l of SEED_LOOKS) await tx`insert into looks ${tx(l, "id", "name", "model")} on conflict do nothing`;
    for (const p of SEED_PRODUCTS) {
      await tx`insert into products (id, slug, name, price, category, color, color_name, img, look_id, stock, description, material, care, published)
        values (${p.id}, ${p.slug}, ${p.name}, ${p.price}, ${p.category}, ${p.color}, ${p.colorName}, ${p.img}, ${p.lookId}, ${p.stock}, ${p.description}, ${p.material}, ${p.care}, true)
        on conflict do nothing`;
    }
    await tx`select setval('products_id_seq', (select max(id) from products))`;
    await tx`insert into settings (key, value) values ('store', ${tx.json(DEFAULT_SETTINGS)}) on conflict do nothing`;
    await seedSampleOrders(tx as unknown as Sql);
  });
}

/** A month of clearly-marked sample orders so the dashboard has something to show. Removable in Admin → Settings. */
async function seedSampleOrders(sql: Sql) {
  const people = [
    ["Amira Khan", "amira"], ["Lucas Meyer", "lucas"], ["Sofia Rossi", "sofia"], ["Noah Clarke", "noah"],
    ["Hana Sato", "hana"], ["Omar Haddad", "omar"], ["Elena Petrova", "elena"], ["Theo Martin", "theo"],
    ["Zara Ahmed", "zara"], ["Mila Novak", "mila"], ["Isaac Brown", "isaac"], ["Leah Cohen", "leah"],
  ];
  for (const [name, h] of people)
    await sql`insert into customers (email, name, sample) values (${h + "@example.com"}, ${name}, true) on conflict do nothing`;

  const statuses = ["delivered", "delivered", "delivered", "shipped", "shipped", "paid", "paid", "pending", "cancelled"];
  let seed = 7;
  const rnd = () => ((seed = (seed * 9301 + 49297) % 233280) / 233280);
  for (let i = 0; i < 34; i++) {
    const [name, h] = people[Math.floor(rnd() * people.length)];
    const k = 1 + Math.floor(rnd() * 3);
    const items = Array.from({ length: k }, () => {
      const p = SEED_PRODUCTS[Math.floor(rnd() * SEED_PRODUCTS.length)];
      return { id: p.id, name: p.name, price: p.price, size: ["S", "M", "L"][Math.floor(rnd() * 3)], qty: 1, img: p.img, colorName: p.colorName };
    });
    const subtotal = items.reduce((s, x) => s + x.price * x.qty, 0);
    const shipping = subtotal >= 300 ? 0 : 15;
    const daysAgo = Math.floor(rnd() * 30);
    const status = daysAgo > 6 ? statuses[Math.floor(rnd() * 3)] : statuses[Math.floor(rnd() * statuses.length)];
    const created = new Date(Date.now() - daysAgo * 864e5 - Math.floor(rnd() * 864e5));
    await sql`insert into orders (number, email, name, phone, address, delivery, items, subtotal, shipping, total, status, sample, created_at)
      values (${"VD" + (10400 + i)}, ${h + "@example.com"}, ${name}, '', ${sql.json({ line1: "Sample address", city: "Sample city", postcode: "00000", country: "Sample" })},
              'standard', ${sql.json(items)}, ${subtotal}, ${shipping}, ${subtotal + shipping}, ${status}, true, ${created})`;
  }
}
