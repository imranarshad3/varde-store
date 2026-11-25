"use client";

import { useEffect } from "react";
import { useStore } from "@/lib/store";

export default function ClearBag() {
  const { clear, hydrated } = useStore();
  useEffect(() => { window.scrollTo(0, 0); }, []);
  useEffect(() => { if (hydrated) clear(); }, [hydrated, clear]);
  return null;
}
