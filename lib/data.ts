export type Product = {
  id: number;
  name: string;
  price: number;
  color: string;
  colorName: string;
  img: string;
  category: "top" | "knit" | "bottom" | "shoes" | "bag" | "accessory" | "dress" | "outer";
};

export type Look = {
  id: number;
  name: string;
  model: string;
  products: Product[];
};

type Raw = [string, number, string, string, Product["category"]];

const raw: { name: string; items: Raw[] }[] = [
  { name: "Fog wool", items: [
    ["Waxed overshirt", 245, "#5d6148", "Moss", "outer"],
    ["Organic tee", 65, "#ece8df", "Chalk", "top"],
    ["Pleated chino", 165, "#d9cfbd", "Bone", "bottom"],
    ["Suede loafer", 230, "#4a3324", "Cocoa", "shoes"],
  ]},
  { name: "Driftwood", items: [
    ["Suede bomber", 395, "#c4ab88", "Sand", "outer"],
    ["Ribbed vest", 75, "#efe9de", "Ivory", "top"],
    ["Wide twill trouser", 175, "#e5dccb", "Cream", "bottom"],
    ["Leather loafer", 210, "#8a5a36", "Tan", "shoes"],
  ]},
  { name: "Ink coat", items: [
    ["Long wool coat", 520, "#2c3343", "Ink", "outer"],
    ["Merino turtleneck", 150, "#3b3a37", "Charcoal", "knit"],
    ["Slim wool trouser", 185, "#2e2d2b", "Coal", "bottom"],
    ["Chelsea boot", 290, "#191817", "Black", "shoes"],
  ]},
  { name: "Rust rib", items: [
    ["Chunky rib jumper", 210, "#9a4a28", "Rust", "knit"],
    ["Rib beanie", 55, "#2f2e2c", "Charcoal", "accessory"],
    ["Charcoal wide trouser", 185, "#2e2d2b", "Coal", "bottom"],
    ["Leather derby", 260, "#141312", "Black", "shoes"],
  ]},
  { name: "Camel column", items: [
    ["Camel knit dress", 290, "#b07a4c", "Camel", "dress"],
    ["Brushed wool scarf", 120, "#ece4d6", "Cream", "accessory"],
    ["Knee boot", 340, "#2e2019", "Espresso", "shoes"],
    ["Mini shoulder bag", 210, "#8c6242", "Toffee", "bag"],
  ]},
  { name: "Ivory hour", items: [
    ["Ecru denim jacket", 220, "#efebe3", "Ecru", "outer"],
    ["Bias maxi skirt", 185, "#e6ded1", "Ivory", "bottom"],
    ["Stone knee boot", 340, "#9c938a", "Stone", "shoes"],
    ["Crescent bag", 230, "#e4dacb", "Bone", "bag"],
  ]},
  { name: "Night velvet", items: [
    ["Velvet blazer", 480, "#1c1a19", "Black", "outer"],
    ["Fine turtleneck", 150, "#232120", "Black", "knit"],
    ["Tailored trouser", 210, "#1f1e1d", "Black", "bottom"],
    ["Chelsea boot", 290, "#0f0e0e", "Black", "shoes"],
  ]},
  { name: "Sage satin", items: [
    ["Satin slip dress", 240, "#8d9a78", "Sage", "dress"],
    ["Draped cardigan", 230, "#4b3022", "Chocolate", "knit"],
    ["Hobo shoulder bag", 195, "#4b3022", "Chocolate", "bag"],
    ["Suede kitten mule", 175, "#b98a5a", "Caramel", "shoes"],
  ]},
  { name: "Sand & stone", items: [
    ["Boucle wool coat", 540, "#cbb79c", "Sand", "outer"],
    ["Cashmere crew", 260, "#efe9de", "Ivory", "knit"],
    ["Wide wool trouser", 195, "#efe9de", "Cream", "bottom"],
    ["Soft derby", 250, "#8c6242", "Tan", "shoes"],
  ]},
];

let pid = 0;
export const LOOKS: Look[] = raw.map((l, i) => ({
  id: i + 1,
  name: l.name,
  model: `/img/m${i + 1}.webp`,
  products: l.items.map(([name, price, color, colorName, category], j) => ({
    id: ++pid,
    name,
    price,
    color,
    colorName,
    category,
    img: `/img/p${i + 1}_${j + 1}.webp`,
  })),
}));

export const ALL_PRODUCTS = LOOKS.flatMap((l) => l.products);
export const productById = (id: number) => ALL_PRODUCTS.find((p) => p.id === id)!;
export const SIZES = ["XS", "S", "M", "L", "XL"] as const;
export const FREE_SHIPPING = 300;
export const START_LOOK = 3;

export const money = (n: number) =>
  "$" + n.toFixed(2).replace(/\B(?=(\d{3})+(?!\d))/g, ",");
