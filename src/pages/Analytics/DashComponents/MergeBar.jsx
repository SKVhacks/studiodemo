import React from "react";
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  Tooltip,
  Legend,
  CartesianGrid,
} from "recharts";
import { MONTHS } from "../../../helpers/data";

const MergeBar = ({ clientBarValues, eventBarValues, isDark }) => {

  // Build data with bottom (larger) and top (smaller) for overlay effect
  const data = MONTHS.map((month, i) => {
    const clients = clientBarValues[i] || 0;
    const events = eventBarValues[i] || 0;
    const clientsBigger = clients >= events;

    return {
      month,
      clients,
      events,
      bottom: Math.max(clients, events),
      top: Math.min(clients, events),
      bottomColor: clientsBigger ? "#ffb900" : "#7B61FF",
      topColor: clientsBigger ? "#7B61FF" : "#ffb900",
    };
  });

  // Custom shape that renders two rects: big bar behind, small bar on top
  const OverlayBarShape = (props) => {
    const { x, y, width, height, bottomColor, topColor, top, bottom } = props;

    if (!bottom || height <= 0) return null;

    const topHeight = (top / bottom) * height;

    const r = 6;

    return (
      <g>
        {/* Bottom (larger value) bar — top corners rounded only */}
        <path
          d={`
            M ${x + r},${y}
            H ${x + width - r}
            Q ${x + width},${y} ${x + width},${y + r}
            V ${y + height}
            H ${x}
            V ${y + r}
            Q ${x},${y} ${x + r},${y}
            Z
          `}
          fill={bottomColor}
        />
        {/* Top (smaller value) bar — no border radius */}
        {top > 0 && (
          <rect
            x={x}
            y={y + height - topHeight}
            width={width}
            height={topHeight}
            fill={topColor}
          />
        )}
      </g>
    );
  };

  // Custom tooltip showing real clients & events values
  const CustomTooltip = ({ active, payload, label }) => {
    if (!active || !payload || !payload[0]) return null;
    const entry = payload[0].payload;

    return (
      <div className="card bg-base-200 shadow-md border border-base-300 text-xs">
        <div className="card-body p-3">
          <p className="font-semibold">{label}</p>
          <p className="flex items-center gap-2">
            <span
              className="w-2 h-2 rounded-full inline-block"
              style={{ background: "#ffb900" }}
            />
            clients: {entry.clients}
          </p>
          <p className="flex items-center gap-2">
            <span
              className="w-2 h-2 rounded-full inline-block"
              style={{ background: "#7B61FF" }}
            />
            events: {entry.events}
          </p>
        </div>
      </div>
    );
  };

  // Custom legend — hardcoded since we only use one <Bar> now
  const CustomLegend = () => (
    <div style={{ display: "flex", justifyContent: "center", gap: 16, fontSize: 13, color: "#9CA3AF", marginTop: 4 }}>
      <span style={{ display: "flex", alignItems: "center", gap: 6 }}>
        <span style={{ width: 12, height: 12, background: "#ffb900", borderRadius: 3, display: "inline-block" }} />
        clients
      </span>
      <span style={{ display: "flex", alignItems: "center", gap: 6 }}>
        <span style={{ width: 12, height: 12, background: "#7B61FF", borderRadius: 3, display: "inline-block" }} />
        events
      </span>
    </div>
  );

  return (
    <div className="w-full h-[270px] px-1 mb-2">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={data} barGap={4}>

          <CartesianGrid
            vertical={false}
            strokeOpacity={isDark ? 0.1 : 0.3}
          />

          <XAxis
            dataKey="month"
            tick={{ fill: "#9CA3AF", fontSize: 11 }}
            axisLine={false}
            tickLine={false}
          />

          <Tooltip
            content={<CustomTooltip />}
            cursor={{ fill: "#9CA3AF", opacity: 0.2 }}
          />

          <Legend content={<CustomLegend />} />

          {/* Single bar using overlay shape */}
          <Bar
            dataKey="bottom"
            shape={(props) => {
              // recharts passes bar data via props, merge entry data manually
              const entry = props.bottom !== undefined ? props : {};
              return <OverlayBarShape {...props} />;
            }}
          />

        </BarChart>
      </ResponsiveContainer>
    </div>
  );
};

export default MergeBar;