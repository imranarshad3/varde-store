export type Article = {
  slug: string;
  title: string;
  kicker: string;
  date: string;
  cover: string;
  excerpt: string;
  body: string[];
};

export const ARTICLES: Article[] = [
  {
    slug: "the-colours-of-low-tide",
    title: "The colours of low tide",
    kicker: "Collection notes",
    date: "2026-11-02",
    cover: "/img/m9.webp",
    excerpt: "How a winter shoreline at dawn became the palette for this season: sand, stone, wet rope and the last of the rust.",
    body: [
      "Every collection starts with a walk. This one started on a beach in late November, an hour after sunrise, when the tide had pulled back so far the sand looked like a second sky.",
      "We photographed everything: the bleached driftwood, the dark wet stone, the rust on an old mooring ring, the green-grey of seaweed drying in the wind. Back in the studio those photographs became swatches, and the swatches became yarn and cloth.",
      "You can see it most clearly in the bouclé coat, woven to echo the texture of dry sand, and in the rust jumper, which took eleven lab dips before the colour felt like weathered iron rather than a pumpkin.",
      "Low Tide is a quiet collection on purpose. These are pieces made to be layered, re-worn and mended, colours that sit together without trying, and that will still feel right in ten winters' time.",
    ],
  },
  {
    slug: "a-coat-for-ten-winters",
    title: "A coat for ten winters",
    kicker: "Craft",
    date: "2026-10-18",
    cover: "/img/m3.webp",
    excerpt: "Inside the making of the long wool coat: the cloth, the canvas and the thirty-two steps between a sketch and your shoulders.",
    body: [
      "Our long wool coat is made from a virgin wool and cashmere cloth milled in small runs. It is dense enough to stop the wind but soft enough to wear over a fine knit without feeling armoured.",
      "The front is half-canvassed, which means a layer of horsehair canvas is stitched in behind the chest and lapel. Over time it moulds to the wearer, so the coat looks better in its fifth winter than its first.",
      "Each one passes through thirty-two separate steps, from cutting to the final press, and every buttonhole is finished by hand.",
      "We'd rather sell you one coat that lasts a decade than a new one every season. That's why every VARDE coat comes with free repairs for life.",
    ],
  },
  {
    slug: "how-to-care-for-knitwear",
    title: "How to care for knitwear",
    kicker: "Care guide",
    date: "2026-09-27",
    cover: "/img/m4.webp",
    excerpt: "Wash less, fold always, and never fear the pill. A short guide to keeping lambswool, merino and cashmere at their best.",
    body: [
      "Good knitwear needs less washing than you think. Wool is naturally odour-resistant, so airing a jumper overnight is often enough between wears.",
      "When it does need a wash, use cold water and a wool detergent, press out the water without wringing, and dry it flat on a towel, away from direct heat.",
      "Always fold your knits rather than hanging them, because hangers stretch the shoulders out of shape. A cedar block in the drawer keeps moths away.",
      "Pilling is normal in the first few weeks as loose fibres work their way out. A cashmere comb removes them in seconds, and after that the surface settles.",
    ],
  },
];

export const articleBySlug = (slug: string) => ARTICLES.find((a) => a.slug === slug);
export const fmtDate = (iso: string) =>
  new Date(iso).toLocaleDateString("en-GB", { day: "numeric", month: "long", year: "numeric" });
