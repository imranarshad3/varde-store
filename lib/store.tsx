"use client";

import {
  createContext, useCallback, useContext, useEffect, useMemo, useRef, useState, type ReactNode,
} from "react";
import type { Product, Settings } from "./types";

export type BagLine = { key: string; id: number; size: string; qty: number };

type Store = {
  catalog: Product[];
  byId: (id: number) => Product | undefined;
  settings: Settings;
  bag: BagLine[];
  lines: (BagLine & { p: Product })[];
  count: number;
  subtotal: number;
  add: (id: number, size: string, qty?: number) => void;
  setQty: (key: string, qty: number) => void;
  remove: (key: string) => void;
  clear: () => void;
  saved: Set<number>;
  toggleSaved: (id: number) => void;
  bagOpen: boolean;
  setBagOpen: (v: boolean) => void;
  quickAdd: number | null;
  setQuickAdd: (id: number | null) => void;
  toast: string | null;
  notify: (msg: string) => void;
  hydrated: boolean;
};

const Ctx = createContext<Store | null>(null);
const BAG_KEY = "varde-bag";
const SAVED_KEY = "varde-saved";

export function StoreProvider({ children, catalog, settings }: { children: ReactNode; catalog: Product[]; settings: Settings }) {
  const [bag, setBag] = useState<BagLine[]>([]);
  const [saved, setSaved] = useState<Set<number>>(new Set());
  const [bagOpen, setBagOpen] = useState(false);
  const [quickAdd, setQuickAdd] = useState<number | null>(null);
  const [toast, setToast] = useState<string | null>(null);
  const [hydrated, setHydrated] = useState(false);
  const toastTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const map = useMemo(() => new Map(catalog.map((p) => [p.id, p])), [catalog]);
  const byId = useCallback((id: number) => map.get(id), [map]);

  useEffect(() => {
    try {
      const b = JSON.parse(localStorage.getItem(BAG_KEY) || "[]");
      const s = JSON.parse(localStorage.getItem(SAVED_KEY) || "[]");
      if (Array.isArray(b)) setBag(b.filter((l) => map.has(l.id)));
      if (Array.isArray(s)) setSaved(new Set(s.filter((id: number) => map.has(id))));
    } catch {}
    setHydrated(true);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (!hydrated) return;
    try {
      localStorage.setItem(BAG_KEY, JSON.stringify(bag));
      localStorage.setItem(SAVED_KEY, JSON.stringify([...saved]));
    } catch {}
  }, [bag, saved, hydrated]);

  const notify = useCallback((msg: string) => {
    setToast(msg);
    if (toastTimer.current) clearTimeout(toastTimer.current);
    toastTimer.current = setTimeout(() => setToast(null), 2200);
  }, []);

  const add = useCallback((id: number, size: string, qty = 1) => {
    const key = `${id}|${size}`;
    setBag((b) => {
      const f = b.find((l) => l.key === key);
      return f ? b.map((l) => (l.key === key ? { ...l, qty: Math.min(10, l.qty + qty) } : l)) : [...b, { key, id, size, qty }];
    });
  }, []);
  const setQty = useCallback((key: string, qty: number) => {
    setBag((b) => (qty < 1 ? b.filter((l) => l.key !== key) : b.map((l) => (l.key === key ? { ...l, qty: Math.min(10, qty) } : l))));
  }, []);
  const remove = useCallback((key: string) => setBag((b) => b.filter((l) => l.key !== key)), []);
  const clear = useCallback(() => setBag([]), []);
  const toggleSaved = useCallback((id: number) => {
    setSaved((s) => { const n = new Set(s); n.has(id) ? n.delete(id) : n.add(id); return n; });
  }, []);

  const value = useMemo<Store>(() => {
    const lines = bag.flatMap((l) => { const p = map.get(l.id); return p ? [{ ...l, p }] : []; });
    return {
      catalog, byId, settings, bag, lines,
      count: lines.reduce((s, l) => s + l.qty, 0),
      subtotal: lines.reduce((s, l) => s + l.p.price * l.qty, 0),
      add, setQty, remove, clear, saved, toggleSaved, bagOpen, setBagOpen, quickAdd, setQuickAdd, toast, notify, hydrated,
    };
  }, [catalog, byId, settings, bag, map, saved, bagOpen, quickAdd, toast, hydrated, add, setQty, remove, clear, toggleSaved, notify]);

  return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
}

export function useStore() {
  const c = useContext(Ctx);
  if (!c) throw new Error("useStore must be used inside StoreProvider");
  return c;
}
