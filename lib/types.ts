export type Category = "top" | "knit" | "bottom" | "shoes" | "bag" | "accessory" | "dress" | "outer";

export type Product = {
  id: number;
  slug: string;
  name: string;
  price: number; // whole dollars
  category: Category;
  color: string;
  colorName: string;
  img: string;
  lookId: number;
  stock: number;
  description: string;
  material: string;
  care: string;
  published: boolean;
  rating?: number;
  reviews?: number;
};

export type Look = {
  id: number;
  name: string;
  model: string;
  products: Product[];
};

export type OrderItem = { id: number; name: string; price: number; size: string; qty: number; img: string; colorName: string };

export type Order = {
  id: number;
  number: string;
  email: string;
  name: string;
  phone: string;
  address: { line1: string; line2?: string; city: string; postcode: string; country: string };
  delivery: string;
  items: OrderItem[];
  subtotal: number;
  discount: number;
  discountCode: string | null;
  shipping: number;
  total: number;
  status: OrderStatus;
  createdAt: string;
  sample?: boolean;
};

export const ORDER_STATUSES = ["pending", "paid", "shipped", "delivered", "cancelled"] as const;
export type OrderStatus = (typeof ORDER_STATUSES)[number];

export type Customer = { id: number; email: string; name: string; createdAt: string; orders?: number; spent?: number };
export type Message = { id: number; name: string; email: string; subject: string; body: string; read: boolean; createdAt: string };
export type Settings = { announcements: string[]; freeShipping: number };

export const CATEGORY_LABEL: Record<Category, string> = {
  top: "Essentials",
  knit: "Knitwear",
  bottom: "Bottoms",
  shoes: "Footwear",
  bag: "Bags",
  accessory: "Accessories",
  dress: "Dresses",
  outer: "Outerwear",
};

export const SIZES = ["XS", "S", "M", "L", "XL"] as const;

export const money = (n: number) =>
  "$" + (Number.isInteger(n) ? n.toString() : n.toFixed(2)).replace(/\B(?=(\d{3})+(?!\d))/g, ",");

export type Discount = {
  code: string;
  kind: "percent" | "fixed";
  value: number;
  minSubtotal: number;
  maxUses: number | null;
  uses: number;
  expiresAt: string | null;
  active: boolean;
  createdAt: string;
};

export type Review = {
  id: number;
  productId: number;
  productName?: string;
  name: string;
  rating: number;
  title: string;
  body: string;
  approved: boolean;
  createdAt: string;
};

export const discountAmount = (d: Pick<Discount, "kind" | "value">, subtotal: number) =>
  Math.min(subtotal, d.kind === "percent" ? Math.round((subtotal * d.value) / 100) : d.value);
