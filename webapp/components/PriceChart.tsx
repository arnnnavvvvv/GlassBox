"use client";

import { CartesianGrid, Line, LineChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import type { DecisionSummary } from "@/lib/types";
import { markerColor } from "@/lib/markerColor";

function CustomDot(props: { cx?: number; cy?: number; payload?: DecisionSummary }) {
  const { cx, cy, payload } = props;
  if (cx == null || cy == null || !payload) return null;
  return <circle cx={cx} cy={cy} r={5} fill={markerColor(payload.action, payload.verdict)} stroke="var(--background)" strokeWidth={1.5} />;
}

function ChartTooltip({ active, payload }: { active?: boolean; payload?: { payload: DecisionSummary }[] }) {
  if (!active || !payload?.length) return null;
  const d = payload[0].payload;
  return (
    <div className="rounded-md border border-border bg-surface-raised px-3 py-2 text-xs shadow-lg">
      <div className="font-mono text-muted-foreground">#{d.id}</div>
      <div className="mt-1">
        {d.action} @ ${Number(d.price).toLocaleString()}
      </div>
      <div className="mt-1" style={{ color: markerColor(d.action, d.verdict) }}>
        {d.action === "hold" ? "hold" : d.verdict === 1 ? "approved" : "rejected"}
      </div>
    </div>
  );
}

export default function PriceChart({ decisions }: { decisions: DecisionSummary[] }) {
  const data = decisions
    .filter((d) => d.price !== null)
    .map((d) => ({ ...d, priceNum: Number(d.price) }));

  if (data.length === 0) {
    return (
      <div className="flex h-64 items-center justify-center rounded-lg border border-border bg-surface text-sm text-muted-foreground">
        No decisions committed yet.
      </div>
    );
  }

  return (
    <div className="h-72 rounded-lg border border-border bg-surface p-4">
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={data} margin={{ top: 8, right: 16, bottom: 0, left: 0 }}>
          <CartesianGrid stroke="var(--border)" vertical={false} />
          <XAxis dataKey="id" tick={{ fill: "var(--muted-foreground)", fontSize: 11 }} tickLine={false} axisLine={{ stroke: "var(--border)" }} />
          <YAxis
            domain={["auto", "auto"]}
            tick={{ fill: "var(--muted-foreground)", fontSize: 11 }}
            tickLine={false}
            axisLine={{ stroke: "var(--border)" }}
            width={64}
            tickFormatter={(v: number) => `$${v.toLocaleString()}`}
          />
          <Tooltip content={<ChartTooltip />} />
          <Line
            type="monotone"
            dataKey="priceNum"
            stroke="var(--accent)"
            strokeWidth={1.5}
            dot={<CustomDot />}
            activeDot={false}
            isAnimationActive={false}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}
