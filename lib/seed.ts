import type { Category, Look, Product, Settings } from "./types";

type Raw = [string, number, string, string, Category, string];

const LOOK_RAW: { name: string; items: Raw[] }[] = [
  { name: "Fog wool", items: [
    ["Waxed overshirt", 245, "#5d6148", "Moss", "outer", "Waxed organic cotton"],
    ["Organic tee", 65, "#ece8df", "Chalk", "top", "Organic cotton jersey"],
    ["Pleated chino", 165, "#d9cfbd", "Bone", "bottom", "Cotton twill"],
    ["Suede loafer", 230, "#4a3324", "Cocoa", "shoes", "Calf suede, leather sole"],
  ]},
  { name: "Driftwood", items: [
    ["Suede bomber", 395, "#c4ab88", "Sand", "outer", "Goat suede, cotton rib trims"],
    ["Ribbed vest", 75, "#efe9de", "Ivory", "top", "Cotton rib"],
    ["Wide twill trouser", 175, "#e5dccb", "Cream", "bottom", "Heavy cotton twill"],
    ["Leather loafer", 210, "#8a5a36", "Tan", "shoes", "Vegetable-tanned leather"],
  ]},
  { name: "Ink coat", items: [
    ["Long wool coat", 520, "#2c3343", "Ink", "outer", "Virgin wool and cashmere"],
    ["Merino turtleneck", 150, "#3b3a37", "Charcoal", "knit", "Extra-fine merino"],
    ["Slim wool trouser", 185, "#2e2d2b", "Coal", "bottom", "Wool flannel"],
    ["Chelsea boot", 290, "#191817", "Black", "shoes", "Polished calf leather"],
  ]},
  { name: "Rust rib", items: [
    ["Chunky rib jumper", 210, "#9a4a28", "Rust", "knit", "Lambswool"],
    ["Rib beanie", 55, "#2f2e2c", "Charcoal", "accessory", "Merino rib"],
    ["Charcoal wide trouser", 185, "#2e2d2b", "Coal", "bottom", "Wool flannel"],
    ["Leather derby", 260, "#141312", "Black", "shoes", "Polished calf leather"],
  ]},
  { name: "Camel column", items: [
    ["Camel knit dress", 290, "#b07a4c", "Camel", "dress", "Merino and cashmere"],
    ["Brushed wool scarf", 120, "#ece4d6", "Cream", "accessory", "Brushed alpaca wool"],
    ["Knee boot", 340, "#2e2019", "Espresso", "shoes", "Smooth calf leather"],
    ["Mini shoulder bag", 210, "#8c6242", "Toffee", "bag", "Grained calf leather"],
  ]},
  { name: "Ivory hour", items: [
    ["Ecru denim jacket", 220, "#efebe3", "Ecru", "outer", "Rigid organic denim"],
    ["Bias maxi skirt", 185, "#e6ded1", "Ivory", "bottom", "Washed silk satin"],
    ["Stone knee boot", 340, "#9c938a", "Stone", "shoes", "Calf suede"],
    ["Crescent bag", 230, "#e4dacb", "Bone", "bag", "Smooth calf leather"],
  ]},
  { name: "Night velvet", items: [
    ["Velvet blazer", 480, "#1c1a19", "Black", "outer", "Cotton velvet, cupro lining"],
    ["Fine turtleneck", 150, "#232120", "Black", "knit", "Extra-fine merino"],
    ["Tailored trouser", 210, "#1f1e1d", "Black", "bottom", "Wool gabardine"],
    ["Chelsea boot · black", 290, "#0f0e0e", "Black", "shoes", "Polished calf leather"],
  ]},
  { name: "Sage satin", items: [
    ["Satin slip dress", 240, "#8d9a78", "Sage", "dress", "Washed silk satin"],
    ["Draped cardigan", 230, "#4b3022", "Chocolate", "knit", "Alpaca and wool"],
    ["Hobo shoulder bag", 195, "#4b3022", "Chocolate", "bag", "Soft nappa leather"],
    ["Suede kitten mule", 175, "#b98a5a", "Caramel", "shoes", "Calf suede"],
  ]},
  { name: "Sand & stone", items: [
    ["Bouclé wool coat", 540, "#cbb79c", "Sand", "outer", "Wool and alpaca bouclé"],
    ["Cashmere crew", 260, "#efe9de", "Ivory", "knit", "Grade-A Mongolian cashmere"],
    ["Wide wool trouser", 195, "#efe9de", "Cream", "bottom", "Wool flannel"],
    ["Soft derby", 250, "#8c6242", "Tan", "shoes", "Vegetable-tanned leather"],
  ]},
];

const DESC: Record<Category, string> = {
  outer: "A considered layer cut with a relaxed shoulder and clean front, made to be worn open over knits or closed against the wind.",
  top: "An everyday essential with a soft hand and a neat, close finish. Designed to sit cleanly under tailoring and knitwear.",
  knit: "Knitted for warmth without weight, with a soft handle that gets better with every wear.",
  bottom: "Cut high on the waist with a long, easy line that falls cleanly over shoes.",
  shoes: "Built on a slim last with a comfortable footbed, made to be resoled and worn for years.",
  bag: "A compact shape with a soft structure and a slim strap that sits close to the body.",
  accessory: "A finishing piece in a texture you want to touch, made in a small run.",
  dress: "A long, fluid line that moves with you, easy to dress up or down through the season.",
};

const CARE: Record<Category, string> = {
  outer: "Dry clean only. Brush gently and air between wears.",
  top: "Machine wash cold, dry flat. Warm iron if needed.",
  knit: "Hand wash cold or dry clean. Dry flat and store folded.",
  bottom: "Dry clean recommended. Steam to refresh.",
  shoes: "Wipe clean, condition regularly and use shoe trees.",
  bag: "Wipe with a soft dry cloth. Store in the dust bag.",
  accessory: "Hand wash cold, dry flat.",
  dress: "Dry clean only. Store on a padded hanger.",
};

export const slugify = (s: string) =>
  s.toLowerCase().normalize("NFD").replace(/[̀-ͯ]/g, "").replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");

let pid = 0;
export const SEED_PRODUCTS: Product[] = LOOK_RAW.flatMap((l, i) =>
  l.items.map(([name, price, color, colorName, category, material], j) => {
    const id = ++pid;
    return {
      id,
      slug: slugify(name),
      name,
      price,
      category,
      color,
      colorName,
      img: `/img/p${i + 1}_${j + 1}.webp`,
      lookId: i + 1,
      stock: 6 + ((id * 7) % 23),
      description: DESC[category],
      material,
      care: CARE[category],
      published: true,
    };
  })
);

export const SEED_LOOKS: Omit<Look, "products">[] = LOOK_RAW.map((l, i) => ({
  id: i + 1,
  name: l.name,
  model: `/img/m${i + 1}.webp`,
}));

export const DEFAULT_SETTINGS: Settings = {
  announcements: [
    "Complimentary delivery over $300",
    "Free returns for a full year",
    "Low Tide · the Autumn Winter 2026 collection",
    "Hand-finished in small batches",
  ],
  freeShipping: 300,
};

export const IMAGE_CHOICES = SEED_PRODUCTS.map((p) => p.img);
