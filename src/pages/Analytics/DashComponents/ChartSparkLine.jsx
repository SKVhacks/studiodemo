import React, {useState , useEffect} from "react";
import {
  ResponsiveContainer,
  ComposedChart,
  Line,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
} from "recharts";
import { MONTHS } from "../../../helpers/data";
import { fmtRupee } from "../../../helpers/converter";

const REVENUE_COLOR = "#ffb900";
const BALANCE_COLOR = "#7B61FF";
const Color = ["#ffb900", "#7B61FF"]
const CustomTooltip = ({ active, payload, label }) => {
  if (!active || !payload?.length) return null;

  // Deduplicate: keep only one entry per dataKey (prefer Line over Area)
  const seen = new Set();
  const unique = payload.filter((entry) => {
    if (seen.has(entry.dataKey)) return false;
    seen.add(entry.dataKey);
    return true;
  });

  return (
    <div className="card bg-base-200 border border-base-300 shadow-md text-xs">
      <div className="card-body p-3">
        <p className="font-semibold">{label}</p>
        {unique.map((entry, i) => (
          <p key={i} className="flex items-center gap-2">
            <span
              className="w-2 h-2 rounded-full"
              style={{ background: Color[i] }}
            />
            {entry.name}: {fmtRupee(entry.value)}
          </p>
        ))}
      </div>
    </div>
  );
};

export default function ChartSparkLine({ lineData = [] ,isDark , height = 260 }) {
  const data =
    lineData.length === 12
      ? lineData
      : MONTHS.map((m) => ({ month: m, revenue: 0, balance: 0 }));



  return (
    <div className="w-full pr-3 " style={{ height }}>
      <ResponsiveContainer width="100%" height="100%">
        {/* ComposedChart supports Area + Line together cleanly */}
        <ComposedChart data={data}>
         
          <defs>
            <linearGradient id="revenueFill" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor={Color[0]} stopOpacity={0.6} />  {/* was 0.25 */}
              <stop offset="95%" stopColor={Color[0]} stopOpacity={0.15} /> {/* was 0 */}
            </linearGradient>

            <linearGradient id="balanceFill" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor={Color[1]} stopOpacity={0.6} />  {/* was 0.25 */}
              <stop offset="95%" stopColor={Color[1]} stopOpacity={0.15} /> {/* was 0 */}
            </linearGradient>
          </defs>
          <CartesianGrid
            vertical={false}
            strokeDasharray="3 3"
            // stroke={isDark ? "red" : "blue"}
            opacity={isDark ? 0.2 : 0.6}
          />
          <XAxis
            dataKey="month"
            tick={{ fill: "#9CA3AF", fontSize: 11 }}
            axisLine={false}
            tickLine={false}
          />
          <YAxis
            // hide
            tick={{ fill: "#9CA3AF", fontSize: 11 }}
            axisLine={false}
            tickLine={false}
            tickFormatter={fmtRupee}
          />

          <Tooltip
            content={<CustomTooltip />}
            cursor={{ stroke: "#374151", strokeWidth: 1 }}
          />

          {/* Legend only reads from Line entries */}
          <Legend
            verticalAlign="bottom"
            align="center"
            wrapperStyle={{ fontSize: 11, color: "#9CA3AF", paddingTop: 16 }}
          />

          <Area
            type="monotone"
            dataKey="revenue"
            fill="url(#revenueFill)"
            stroke="none"
            legendType="none"
            tooltipType="none"
          />
          <Area
            type="monotone"
            dataKey="balance"         //{/* blue - above pink */}
            fill="url(#balanceFill)"
            stroke="none"
            legendType="none"
            tooltipType="none"
          />

          {/* Lines */}
          <Line
            type="monotone"
            dataKey="revenue"         //{/* pink line - bottom layer */}
            name="Revenue"
            stroke={REVENUE_COLOR}
            strokeWidth={3}
            dot={false}
          />
          <Line
            type="monotone"
            dataKey="balance"         //{/* blue line - on top */}
            name="Balance"
            stroke={BALANCE_COLOR}
            strokeWidth={3}
            dot={false}
          />
        </ComposedChart>
      </ResponsiveContainer>
    </div>
  );
}