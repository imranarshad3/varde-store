"use client";

import { useEffect, useRef, useState } from "react";

type Day = { day: string; revenue: number };

/** Area + line chart of daily revenue, drawn at real pixel size with a hover read-out. */
export default function RevenueChart({ days }: { days: Day[] }) {
  const box = useRef<HTMLDivElement>(null);
  const [w, setW] = useState(800);
  const [hover, setHover] = useState<number | null>(null);
  const H = 240, padL = 48, padR = 12, padT = 16, padB = 28;

  useEffect(() => {
    const el = box.current;
    if (!el) return;
    const ro = new ResizeObserver(() => setW(el.clientWidth));
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  const max = Math.max(100, ...days.map((d) => d.revenue));
  const nice = Math.ceil(max / 250) * 250;
  const x = (i: number) => padL + (i / Math.max(1, days.length - 1)) * (w - padL - padR);
  const y = (v: number) => padT + (1 - v / nice) * (H - padT - padB);
  const line = days.map((d, i) => `${i ? "L" : "M"}${x(i).toFixed(1)},${y(d.revenue).toFixed(1)}`).join("");
  const area = `${line}L${x(days.length - 1)},${y(0)}L${x(0)},${y(0)}Z`;
  const ticks = [0, 0.5, 1].map((t) => Math.round(nice * t));
  const fmt = (s: string) => new Date(s + "T00:00:00").toLocaleDateString("en-GB", { day: "numeric", month: "short" });
  const narrow = w < 520;

  return (
    <div className="chart" ref={box}>
      <svg width={w} height={H} role="img" aria-label="Daily revenue for the last 30 days"
        onMouseLeave={() => setHover(null)}
        onMouseMove={(e) => {
          const r = e.currentTarget.getBoundingClientRect();
          const i = Math.round(((e.clientX - r.left - padL) / (w - padL - padR)) * (days.length - 1));
          setHover(Math.max(0, Math.min(days.length - 1, i)));
        }}>
        <defs>
          <linearGradient id="rv" x1="0" x2="0" y1="0" y2="1"><stop offset="0" stopColor="#a4532f" stopOpacity=".22" /><stop offset="1" stopColor="#a4532f" stopOpacity="0" /></linearGradient>
        </defs>
        {ticks.map((t) => (
          <g key={t}>
            <line x1={padL} x2={w - padR} y1={y(t)} y2={y(t)} stroke="#e4ded5" />
            <text x={padL - 10} y={y(t) + 4} textAnchor="end" fontSize="11" fill="#8b857c">${t >= 1000 ? `${(t / 1000).toFixed(1)}k` : t}</text>
          </g>
        ))}
        <path d={area} fill="url(#rv)" />
        <path d={line} fill="none" stroke="#a4532f" strokeWidth="2" strokeLinejoin="round" />
        {days.map((d, i) => ((!narrow && i % 7 === 0) || (narrow && i % 14 === 0)) && i < days.length - 4 || i === days.length - 1 ? (
          <text key={d.day} x={x(i)} y={H - 8} textAnchor={i === days.length - 1 ? "end" : "middle"} fontSize="11" fill="#8b857c">{fmt(d.day)}</text>
        ) : null)}
        {hover != null && (
          <g>
            <line x1={x(hover)} x2={x(hover)} y1={padT} y2={y(0)} stroke="#171614" strokeDasharray="3 3" />
            <circle cx={x(hover)} cy={y(days[hover].revenue)} r="4.5" fill="#fff" stroke="#a4532f" strokeWidth="2" />
          </g>
        )}
      </svg>
      {hover != null && (
        <div className="chart-tip" style={{ left: Math.min(w - 140, Math.max(0, x(hover) - 70)) }}>
          <span>{fmt(days[hover].day)}</span><b>${days[hover].revenue.toLocaleString()}</b>
        </div>
      )}
    </div>
  );
}
