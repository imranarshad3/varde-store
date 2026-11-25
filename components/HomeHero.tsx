"use client";

import { useState } from "react";
import type { Look } from "@/lib/types";
import Lookbook from "./Lookbook";
import ProductGrid from "./ProductGrid";

const START = 3;

export default function HomeHero({ looks }: { looks: Look[] }) {
  const [cur, setCur] = useState(Math.min(START, looks.length - 1));
  if (!looks.length) return null;
  return (
    <main className="main">
      <ProductGrid looks={looks} cur={cur} />
      <Lookbook looks={looks} cur={cur} setCur={setCur} />
    </main>
  );
}
