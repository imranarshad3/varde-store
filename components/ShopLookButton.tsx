"use client";

import { useStore } from "@/lib/store";

export default function ShopLookButton({ ids }: { ids: number[] }) {
  const { add, setBagOpen, notify } = useStore();
  return (
    <button
      className="btn"
      disabled={!ids.length}
      onClick={() => { ids.forEach((id) => add(id, "M")); notify("Whole look added in size M"); setBagOpen(true); }}
    >
      Add the look · size M
    </button>
  );
}
