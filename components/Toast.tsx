"use client";

import { useStore } from "@/lib/store";

export default function Toast() {
  const { toast } = useStore();
  return (
    <div className={`toast${toast ? " on" : ""}`} role="status" aria-live="polite">
      {toast}
    </div>
  );
}
