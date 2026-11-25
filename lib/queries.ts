import "server-only";
import { db, hasDb } from "./db";
import { DEFAULT_SETTINGS, SEED_LOOKS, SEED_PRODUCTS, slugify } from "./seed";
import { discountAmount, type Customer, type Discount, type Look, type Message, type Order, type OrderItem, type OrderStatus, type Product, type Review, type Settings } from "./types";

/* ---------------- mapping ---------------- */
type Row = Record<string, unknown>;
const toProduct = (r: Row): Product => ({
  id: r.id as number,
  slug: r.slug as string,
  name: r.name as string,
  price: r.price as number,
  category: r.category as Product["category"],
  color: r.color as string,
  colorName: r.color_name as string,
  img: r.img as string,
  lookId: (r.look_id as number) ?? 0,
  stock: r.stock as number,
  description: r.description as string,
  material: r.material as string,
  care: r.care as string,
  published: r.published as boolean,
  rating: r.rating != null ? Number(r.rating) : undefined,
  reviews: r.reviews != null ? Number(r.reviews) : undefined,
});
const toOrder = (r: Row): Order => ({
  id: r.id as number,
  number: r.number as string,
  email: r.email as string,
  name: r.name as string,
  phone: r.phone as string,
  address: r.address as Order["address"],
  delivery: r.delivery as string,
  items: r.items as OrderItem[],
  subtotal: r.subtotal as number,
  discount: (r.discount as number) ?? 0,
  discountCode: (r.discount_code as string) ?? null,
  shipping: r.shipping as number,
  total: r.total as number,
  status: r.status as OrderStatus,
  createdAt: new Date(r.created_at as string).toISOString(),
  sample: r.sample as boolean,
});

/* ---------------- catalogue ---------------- */
export async function getProducts(opts: { all?: boolean } = {}): Promise<Product[]> {
  if (!hasDb) return SEED_PRODUCTS;
  const sql = await db();
  const rows = await sql`
    select p.*, r.rating, r.reviews from products p
    left join (select product_id, round(avg(rating)::numeric, 1) as rating, count(*)::int as reviews
               from reviews where approved group by product_id) r on r.product_id = p.id
    where ${opts.all ? sql`true` : sql`p.published`}
    order by p.look_id nulls last, p.id`;
  return rows.map(toProduct);
}

export async function getProductBySlug(slug: string): Promise<Product | null> {
  if (!hasDb) return SEED_PRODUCTS.find((p) => p.slug === slug) ?? null;
  const sql = await db();
  const [r] = await sql`
    select p.*, r.rating, r.reviews from products p
    left join (select product_id, round(avg(rating)::numeric, 1) as rating, count(*)::int as reviews
               from reviews where approved group by product_id) r on r.product_id = p.id
    where p.slug = ${slug} and p.published`;
  return r ? toProduct(r) : null;
}

export async function getProductById(id: number): Promise<Product | null> {
  if (!hasDb) return SEED_PRODUCTS.find((p) => p.id === id) ?? null;
  const sql = await db();
  const [r] = await sql`select * from products where id = ${id}`;
  return r ? toProduct(r) : null;
}

export async function getLooks(): Promise<Look[]> {
  const products = await getProducts();
  let looks = SEED_LOOKS;
  if (hasDb) {
    const sql = await db();
    looks = (await sql`select * from looks order by id`) as unknown as typeof SEED_LOOKS;
  }
  return looks.map((l) => ({ ...l, products: products.filter((p) => p.lookId === l.id) }));
}

export async function getSettings(): Promise<Settings> {
  if (!hasDb) return DEFAULT_SETTINGS;
  const sql = await db();
  const [r] = await sql`select value from settings where key = 'store'`;
  return { ...DEFAULT_SETTINGS, ...((r?.value as Settings) ?? {}) };
}

/* ---------------- orders ---------------- */
export type NewOrder = {
  email: string; name: string; phone: string;
  address: Order["address"]; delivery: "standard" | "express";
  lines: { id: number; size: string; qty: number }[];
  code?: string;
};

export async function createOrder(input: NewOrder): Promise<Order> {
  const sql = await db();
  const settings = await getSettings();
  return sql.begin(async (tx) => {
    const items: OrderItem[] = [];
    for (const l of input.lines) {
      const qty = Math.max(1, Math.min(10, Math.floor(l.qty)));
      const [p] = await tx`select * from products where id = ${l.id} and published for update`;
      if (!p) throw new Error("A product in your bag is no longer available.");
      if ((p.stock as number) < qty) throw new Error(`Only ${p.stock} left of ${p.name}.`);
      await tx`update products set stock = stock - ${qty} where id = ${l.id}`;
      items.push({ id: p.id as number, name: p.name as string, price: p.price as number, size: String(l.size).slice(0, 4), qty, img: p.img as string, colorName: p.color_name as string });
    }
    if (!items.length) throw new Error("Your bag is empty.");
    const subtotal = items.reduce((s, i) => s + i.price * i.qty, 0);
    const shipping = input.delivery === "express" ? 25 : subtotal >= settings.freeShipping ? 0 : 15;
    let discount = 0, code: string | null = null;
    if (input.code) {
      const [d] = await tx`select * from discounts where upper(code) = upper(${input.code}) for update`;
      const why = d ? discountProblem(toDiscount(d), subtotal) : "That code doesn't exist.";
      if (why) throw new Error(why);
      discount = discountAmount(toDiscount(d), subtotal);
      code = d.code as string;
      await tx`update discounts set uses = uses + 1 where code = ${code}`;
    }
    const [{ n }] = await tx`select coalesce(max(id), 0) + 10500 as n from orders`;
    const [r] = await tx`insert into orders (number, email, name, phone, address, delivery, items, subtotal, discount, discount_code, shipping, total, status)
      values (${"VD" + n}, ${input.email}, ${input.name}, ${input.phone}, ${tx.json(input.address)}, ${input.delivery},
              ${tx.json(items)}, ${subtotal}, ${discount}, ${code}, ${shipping}, ${subtotal - discount + shipping}, 'paid') returning *`;
    return toOrder(r);
  });
}

export async function getOrderByNumber(number: string): Promise<Order | null> {
  if (!hasDb) return null;
  const sql = await db();
  const [r] = await sql`select * from orders where number = ${number}`;
  return r ? toOrder(r) : null;
}

export async function getOrdersByEmail(email: string): Promise<Order[]> {
  if (!hasDb) return [];
  const sql = await db();
  return (await sql`select * from orders where lower(email) = lower(${email}) order by created_at desc`).map(toOrder);
}

export async function listOrders(status?: string, q?: string): Promise<Order[]> {
  if (!hasDb) return [];
  const sql = await db();
  const like = q ? `%${q}%` : null;
  return (
    await sql`select * from orders
      where (${status ?? null}::text is null or status = ${status ?? null})
        and (${like}::text is null or number ilike ${like} or email ilike ${like} or name ilike ${like})
      order by created_at desc limit 300`
  ).map(toOrder);
}

export async function setOrderStatus(id: number, status: OrderStatus) {
  const sql = await db();
  await sql`update orders set status = ${status} where id = ${id}`;
}

/* ---------------- customers ---------------- */
export async function findCustomer(email: string) {
  const sql = await db();
  const [r] = await sql`select * from customers where lower(email) = lower(${email})`;
  return r as { id: number; email: string; name: string; password_hash: string | null } | undefined;
}

export async function customerById(id: number) {
  if (!hasDb) return undefined;
  const sql = await db();
  const [r] = await sql`select id, email, name from customers where id = ${id}`;
  return r as { id: number; email: string; name: string } | undefined;
}

export async function createCustomer(email: string, name: string, passwordHash: string) {
  const sql = await db();
  const [r] = await sql`insert into customers (email, name, password_hash) values (${email}, ${name}, ${passwordHash})
    on conflict (email) do update set name = excluded.name, password_hash = excluded.password_hash
    where customers.password_hash is null returning id`;
  return r?.id as number | undefined;
}

export async function listCustomers(): Promise<Customer[]> {
  if (!hasDb) return [];
  const sql = await db();
  const rows = await sql`
    select c.id, c.email, c.name, c.created_at,
      (select count(*)::int from orders o where lower(o.email) = lower(c.email) and o.status <> 'cancelled') as orders,
      (select coalesce(sum(total), 0)::int from orders o where lower(o.email) = lower(c.email) and o.status <> 'cancelled') as spent
    from customers c order by spent desc, c.created_at desc`;
  return rows.map((r) => ({ id: r.id, email: r.email, name: r.name, createdAt: new Date(r.created_at).toISOString(), orders: r.orders, spent: r.spent }));
}

/* ---------------- messages & newsletter ---------------- */
export async function createMessage(m: { name: string; email: string; subject: string; body: string }) {
  const sql = await db();
  await sql`insert into messages (name, email, subject, body) values (${m.name}, ${m.email}, ${m.subject}, ${m.body})`;
}
export async function listMessages(): Promise<Message[]> {
  if (!hasDb) return [];
  const sql = await db();
  return (await sql`select * from messages order by created_at desc`).map((r) => ({
    id: r.id, name: r.name, email: r.email, subject: r.subject, body: r.body, read: r.read, createdAt: new Date(r.created_at).toISOString(),
  }));
}
export async function markMessage(id: number, read: boolean) {
  const sql = await db();
  await sql`update messages set read = ${read} where id = ${id}`;
}
export async function deleteMessage(id: number) {
  const sql = await db();
  await sql`delete from messages where id = ${id}`;
}
export async function subscribe(email: string) {
  const sql = await db();
  await sql`insert into newsletter (email) values (${email.toLowerCase()}) on conflict do nothing`;
}
export async function subscriberCount() {
  if (!hasDb) return 0;
  const sql = await db();
  const [{ n }] = await sql`select count(*)::int as n from newsletter`;
  return n as number;
}

/* ---------------- admin: products & settings ---------------- */
export type ProductInput = Omit<Product, "id" | "slug"> & { slug?: string };

export async function saveProduct(id: number | null, p: ProductInput) {
  const sql = await db();
  const slug = slugify(p.slug || p.name) || "product";
  const vals = {
    slug, name: p.name, price: p.price, category: p.category, color: p.color, color_name: p.colorName, img: p.img,
    look_id: p.lookId || null, stock: p.stock, description: p.description, material: p.material, care: p.care, published: p.published,
  };
  if (id) {
    await sql`update products set ${sql(vals)} where id = ${id}`;
    return id;
  }
  const taken = await sql`select 1 from products where slug = ${slug}`;
  if (taken.length) vals.slug = `${slug}-${Date.now().toString(36).slice(-4)}`;
  const [r] = await sql`insert into products ${sql(vals)} returning id`;
  return r.id as number;
}

export async function deleteProduct(id: number) {
  const sql = await db();
  await sql`delete from products where id = ${id}`;
}

export async function saveSettings(s: Settings) {
  const sql = await db();
  await sql`insert into settings (key, value) values ('store', ${sql.json(s)}) on conflict (key) do update set value = excluded.value`;
}

export async function clearSampleData() {
  const sql = await db();
  await sql`delete from orders where sample`;
  await sql`delete from customers where sample`;
}

/* ---------------- dashboard ---------------- */
export async function dashboard() {
  if (!hasDb) return null;
  const sql = await db();
  const [t] = await sql`
    select coalesce(sum(total) filter (where status <> 'cancelled'), 0)::int as revenue,
           count(*) filter (where status <> 'cancelled')::int as orders,
           count(*) filter (where status in ('pending','paid'))::int as to_ship,
           (select count(*)::int from customers) as customers,
           coalesce(sum(total) filter (where status <> 'cancelled' and created_at > now() - interval '7 days'), 0)::int as rev7,
           coalesce(sum(total) filter (where status <> 'cancelled' and created_at between now() - interval '14 days' and now() - interval '7 days'), 0)::int as revPrev7
    from orders where created_at > now() - interval '30 days'`;
  const days = await sql`
    select to_char(d, 'YYYY-MM-DD') as day,
      coalesce((select sum(total) from orders o where o.status <> 'cancelled' and o.created_at::date = d::date), 0)::int as revenue
    from generate_series(current_date - 29, current_date, interval '1 day') d order by d`;
  const top = await sql`
    select (i->>'name') as name, (i->>'img') as img, sum((i->>'qty')::int)::int as units, sum((i->>'qty')::int * (i->>'price')::int)::int as revenue
    from orders o, jsonb_array_elements(o.items) i where o.status <> 'cancelled' and o.created_at > now() - interval '30 days'
    group by 1, 2 order by revenue desc limit 5`;
  const low = await sql`select id, name, img, stock from products where published and stock <= 8 order by stock asc limit 6`;
  const recent = (await sql`select * from orders order by created_at desc limit 6`).map(toOrder);
  const [{ unread }] = await sql`select count(*)::int as unread from messages where not read`;
  return {
    revenue: t.revenue as number, orders: t.orders as number, toShip: t.to_ship as number, customers: t.customers as number,
    rev7: t.rev7 as number, revPrev7: t.revprev7 as number,
    days: days.map((d) => ({ day: d.day as string, revenue: d.revenue as number })),
    top: top.map((r) => ({ name: r.name as string, img: r.img as string, units: r.units as number, revenue: r.revenue as number })),
    low: low.map((r) => ({ id: r.id as number, name: r.name as string, img: r.img as string, stock: r.stock as number })),
    recent, unread: unread as number,
  };
}

/* ---------------- discounts ---------------- */
const toDiscount = (r: Row): Discount => ({
  code: r.code as string, kind: r.kind as Discount["kind"], value: r.value as number,
  minSubtotal: r.min_subtotal as number, maxUses: (r.max_uses as number) ?? null, uses: r.uses as number,
  expiresAt: r.expires_at ? new Date(r.expires_at as string).toISOString() : null,
  active: r.active as boolean, createdAt: new Date(r.created_at as string).toISOString(),
});

/** Returns a reason the code can't be used, or null if it's fine. */
export function discountProblem(d: Discount, subtotal: number): string | null {
  if (!d.active) return "That code is no longer active.";
  if (d.expiresAt && new Date(d.expiresAt) < new Date()) return "That code has expired.";
  if (d.maxUses != null && d.uses >= d.maxUses) return "That code has been fully redeemed.";
  if (subtotal < d.minSubtotal) return `That code needs a minimum spend of $${d.minSubtotal}.`;
  return null;
}

export async function findDiscount(code: string): Promise<Discount | null> {
  if (!hasDb) return null;
  const sql = await db();
  const [r] = await sql`select * from discounts where upper(code) = upper(${code})`;
  return r ? toDiscount(r) : null;
}

export async function listDiscounts(): Promise<Discount[]> {
  if (!hasDb) return [];
  const sql = await db();
  return (await sql`select * from discounts order by active desc, created_at desc`).map(toDiscount);
}

export async function createDiscount(d: { code: string; kind: Discount["kind"]; value: number; minSubtotal: number; maxUses: number | null; expiresAt: string | null }) {
  const sql = await db();
  await sql`insert into discounts (code, kind, value, min_subtotal, max_uses, expires_at)
    values (${d.code.toUpperCase()}, ${d.kind}, ${d.value}, ${d.minSubtotal}, ${d.maxUses}, ${d.expiresAt})`;
}

export async function setDiscountActive(code: string, active: boolean) {
  const sql = await db();
  await sql`update discounts set active = ${active} where code = ${code}`;
}

export async function deleteDiscount(code: string) {
  const sql = await db();
  await sql`delete from discounts where code = ${code}`;
}

/* ---------------- reviews ---------------- */
const toReview = (r: Row): Review => ({
  id: r.id as number, productId: r.product_id as number, productName: (r.product_name as string) ?? undefined,
  name: r.name as string, rating: r.rating as number, title: r.title as string, body: r.body as string,
  approved: r.approved as boolean, createdAt: new Date(r.created_at as string).toISOString(),
});

export async function getReviews(productId: number): Promise<Review[]> {
  if (!hasDb) return [];
  const sql = await db();
  return (await sql`select * from reviews where product_id = ${productId} and approved order by created_at desc limit 50`).map(toReview);
}

export async function createReview(r: { productId: number; name: string; email: string; rating: number; title: string; body: string }) {
  const sql = await db();
  await sql`insert into reviews (product_id, name, email, rating, title, body)
    values (${r.productId}, ${r.name}, ${r.email}, ${r.rating}, ${r.title}, ${r.body})`;
}

export async function listAllReviews(status?: "pending" | "approved"): Promise<(Review & { email: string })[]> {
  if (!hasDb) return [];
  const sql = await db();
  const rows = await sql`select r.*, p.name as product_name from reviews r join products p on p.id = r.product_id
    where ${status === "pending" ? sql`not r.approved` : status === "approved" ? sql`r.approved` : sql`true`}
    order by r.approved, r.created_at desc limit 300`;
  return rows.map((r) => ({ ...toReview(r), email: r.email as string }));
}

export async function setReviewApproved(id: number, approved: boolean) {
  const sql = await db();
  await sql`update reviews set approved = ${approved} where id = ${id}`;
}

export async function deleteReview(id: number) {
  const sql = await db();
  await sql`delete from reviews where id = ${id}`;
}

export async function pendingReviewCount() {
  if (!hasDb) return 0;
  const sql = await db();
  const [{ n }] = await sql`select count(*)::int as n from reviews where not approved`;
  return n as number;
}

/* ---------------- waitlist ---------------- */
export async function joinWaitlist(productId: number, email: string) {
  const sql = await db();
  await sql`insert into waitlist (product_id, email) values (${productId}, ${email.toLowerCase()}) on conflict do nothing`;
}

export async function waitlistFor(productId: number): Promise<{ email: string; createdAt: string }[]> {
  if (!hasDb) return [];
  const sql = await db();
  return (await sql`select email, created_at from waitlist where product_id = ${productId} order by created_at`).map((r) => ({
    email: r.email as string, createdAt: new Date(r.created_at as string).toISOString(),
  }));
}

export async function waitlistCounts(): Promise<Record<number, number>> {
  if (!hasDb) return {};
  const sql = await db();
  const rows = await sql`select product_id, count(*)::int as n from waitlist group by product_id`;
  return Object.fromEntries(rows.map((r) => [r.product_id as number, r.n as number]));
}
