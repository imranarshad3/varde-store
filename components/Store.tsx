"use client";

import { useState } from "react";
import { StoreProvider } from "@/lib/store";
import { START_LOOK } from "@/lib/data";
import Header from "./Header";
import ProductGrid from "./ProductGrid";
import Lookbook from "./Lookbook";
import QuickAdd from "./QuickAdd";
import BagDrawer from "./BagDrawer";
import Toast from "./Toast";

export default function Store() {
  const [cur, setCur] = useState(START_LOOK);
  return (
    <StoreProvider>
      <div className="bar">Free delivery over $300, returns for a year</div>
      <Header />
      <main className="main">
        <ProductGrid cur={cur} />
        <Lookbook cur={cur} setCur={setCur} />
      </main>
      <QuickAdd />
      <BagDrawer cur={cur} />
      <Toast />
    </StoreProvider>
  );
}
