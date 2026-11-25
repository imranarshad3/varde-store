"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from "react";
import { productById } from "./data";

export type BagLine = { key: string; id: number; size: string; qty: number };

type Store = {
  bag: BagLine[];
  count: number;
  subtotal: number;
  add: (id: number, size: string, qty?: number) => void;
  setQty: (key: string, qty: number) => void;
  remove: (key: string) => void;
  saved: Set<number>;
  toggleSaved: (id: number) => void;
  bagOpen: boolean;
  setBagOpen: (v: boolean) => void;
  quickAdd: number | null;
  setQuickAdd: (id: number | null) => void;
  toast: string | null;
  notify: (msg: string) => void;
};

const Ctx = createContext<Store | null>(null);
const BAG_KEY = "varde-bag";
const SAVED_KEY = "varde-saved";

export function StoreProvider({ children }: { children: ReactNode }) {
  const [bag, setBag] = useState<BagLine[]>([]);
  const [saved, setSaved] = useState<Set<number>>(new Set());
  const [bagOpen, setBagOpen] = useState(false);
  const [quickAdd, setQuickAdd] = useState<number | null>(null);
  const [toast, setToast] = useState<string | null>(null);
  const toastTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const loaded = useRef(false);

  // restore from localStorage once on the client
  useEffect(() => {
    try {
      const b = JSON.parse(localStorage.getItem(BAG_KEY) || "[]");
      const s = JSON.parse(localStorage.getItem(SAVED_KEY) || "[]");
      if (Array.isArray(b)) setBag(b.filter((l) => productById(l.id)));
      if (Array.isArray(s)) setSaved(new Set(s));
    } catch {}
    loaded.current = true;
  }, []);

  useEffect(() => {
    if (!loaded.current) return;
    try {
      localStorage.setItem(BAG_KEY, JSON.stringify(bag));
      localStorage.setItem(SAVED_KEY, JSON.stringify([...saved]));
    } catch {}
  }, [bag, saved]);

  const notify = useCallback((msg: string) => {
    setToast(msg);
    if (toastTimer.current) clearTimeout(toastTimer.current);
    toastTimer.current = setTimeout(() => setToast(null), 1900);
  }, []);

  const add = useCallback((id: number, size: string, qty = 1) => {
    const key = `${id}|${size}`;
    setBag((b) => {
      const f = b.find((l) => l.key === key);
      return f
        ? b.map((l) => (l.key === key ? { ...l, qty: l.qty + qty } : l))
        : [...b, { key, id, size, qty }];
    });
  }, []);

  const setQty = useCallback((key: string, qty: number) => {
    setBag((b) =>
      qty < 1 ? b.filter((l) => l.key !== key) : b.map((l) => (l.key === key ? { ...l, qty } : l))
    );
  }, []);

  const remove = useCallback((key: string) => setBag((b) => b.filter((l) => l.key !== key)), []);

  const toggleSaved = useCallback((id: number) => {
    setSaved((s) => {
      const n = new Set(s);
      n.has(id) ? n.delete(id) : n.add(id);
      return n;
    });
  }, []);

  const value = useMemo<Store>(() => {
    const count = bag.reduce((s, l) => s + l.qty, 0);
    const subtotal = bag.reduce((s, l) => s + productById(l.id).price * l.qty, 0);
    return {
      bag, count, subtotal, add, setQty, remove,
      saved, toggleSaved, bagOpen, setBagOpen,
      quickAdd, setQuickAdd, toast, notify,
    };
  }, [bag, saved, bagOpen, quickAdd, toast, add, setQty, remove, toggleSaved, notify]);

  return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
}

export function useStore() {
  const c = useContext(Ctx);
  if (!c) throw new Error("useStore must be used inside StoreProvider");
  return c;
}
