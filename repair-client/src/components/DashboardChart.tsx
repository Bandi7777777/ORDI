// @ts-nocheck
import React, { useMemo } from "react";
import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
} from "recharts";
import type { Part } from "../types";

type Props = {
  parts: Part[];
};

const DashboardChart: React.FC<Props> = ({ parts }) => {
  const data = useMemo(() => {
    const map = new Map<string, number>();
    parts.forEach((p) => {
      if (!p.receivedDate) return;
      const d = p.receivedDate;
      map.set(d, (map.get(d) ?? 0) + 1);
    });
    return Array.from(map.entries())
      .sort((a, b) => a[0].localeCompare(b[0]))
      .slice(-30)
      .map(([date, count]) => ({ date, count }));
  }, [parts]);

  if (!data.length) return null;

  return (
    <div className="card mt-4 p-4">
      <h3 className="text-xs font-semibold mb-2">
        تعداد سفارش‌های دریافت‌شده در ۳۰ تاریخ اخیر
      </h3>
      <div style={{ width: "100%", height: 220 }}>
        <ResponsiveContainer>
          <LineChart data={data}>
            <CartesianGrid strokeDasharray="3 3" stroke="rgba(148,163,184,0.4)" />
            <XAxis dataKey="date" tick={{ fontSize: 10 }} />
            <YAxis tick={{ fontSize: 10 }} />
            <Tooltip />
            <Line
              type="monotone"
              dataKey="count"
              stroke="#2be5b9"
              strokeWidth={2}
              dot={{ r: 3 }}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};

export default DashboardChart;
