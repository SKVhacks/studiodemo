import { useState } from "react";

import { BarChart }       from "@mui/x-charts/BarChart";
import { LineChart }      from "@mui/x-charts/LineChart";
import { PieChart }       from "@mui/x-charts/PieChart";
import { SparkLineChart } from "@mui/x-charts/SparkLineChart";

// ─────────────────────────────────────────────────────────────────────────────
// CONSTANTS
// ─────────────────────────────────────────────────────────────────────────────
const CUR_YEAR  = new Date().getFullYear();
const CUR_MONTH = new Date().getMonth() + 1;
const MONTHS    = ["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"];

const MONTH_OPTIONS = [
  { value: 0,  label: "All Months"  },
  { value: 1,  label: "January"     }, { value: 2,  label: "February"  },
  { value: 3,  label: "March"       }, { value: 4,  label: "April"     },
  { value: 5,  label: "May"         }, { value: 6,  label: "June"      },
  { value: 7,  label: "July"        }, { value: 8,  label: "August"    },
  { value: 9,  label: "September"   }, { value: 10, label: "October"   },
  { value: 11, label: "November"    }, { value: 12, label: "December"  },
];

// ── Colours ───────────────────────────────────────────────────────────────────
const GOLD           = "#C9A84C";
const PINK_BAR       = "#E879A0";
const BLUE_BAR       = "#7B61FF";
const MUTED          = "#9CA3AF";
const GRID_COLOR     = "#374151";

const STATUS_COLORS  = {
  scheduled:  "#C9A84C",
  shouted:    "#7B61FF",
  processing: "#3ECFCF",
  completed:  "#4CAF7D",
  cancelled:  "#E05C5C",
};
const PAYMENT_COLORS = { paid: "#4CAF7D", partial: "#C9A84C", pending: "#E05C5C" };
const DONUT_COLORS   = ["#4CAF7D", "#E05C5C"];

// ─────────────────────────────────────────────────────────────────────────────
// FAKE DATA
// ─────────────────────────────────────────────────────────────────────────────
const FAKE_KPI = {
  total_clients:  { value: 1248, change_pct: 12.5  },
  total_events:   { value: 376,  change_pct: 8.3   },
  total_revenue:  { value: 1825000, change_pct: 15.2 },
  pending_amount: { value: 342000,  change_pct: -4.7 },
};

// 12-month arrays (Jan → Dec)
const FAKE_CLIENT_BAR   = [14, 18, 22, 19, 27, 31, 25, 34, 28, 22, 30, 38];
const FAKE_EVENT_BAR    = [10, 13, 17, 15, 21, 24, 19, 28, 22, 17, 24, 30];
const FAKE_SPARKLINE    = [14, 32, 54, 73, 100, 131, 156, 190, 218, 240, 270, 308]; // cumulative

const FAKE_REVENUE_LINE = [
  85000, 112000, 134000, 98000, 167000, 195000,
  148000, 210000, 175000, 155000, 198000, 248000,
];
const FAKE_PAY_TREND    = [
  72000, 95000, 118000, 88000, 145000, 172000,
  132000, 188000, 155000, 138000, 175000, 215000,
];

const FAKE_DONUT = [
  { name: "Paid",    value: 1483000 },
  { name: "Pending", value: 342000  },
];

const FAKE_EVENT_PIE = [
  { name: "Scheduled",  value: 48,  status: "scheduled"  },
  { name: "Shouted",    value: 32,  status: "shouted"    },
  { name: "Processing", value: 55,  status: "processing" },
  { name: "Completed",  value: 198, status: "completed"  },
  { name: "Cancelled",  value: 43,  status: "cancelled"  },
];

const FAKE_PAY_PIE = [
  { name: "Paid",           value: 210, status: "paid"    },
  { name: "Partially Paid", value: 98,  status: "partial" },
  { name: "Pending",        value: 68,  status: "pending" },
];

// Available years for year-nav
const AVAILABLE_YEARS = [2023, 2024, 2025, CUR_YEAR];
const MIN_YEAR        = AVAILABLE_YEARS[0];

// ─────────────────────────────────────────────────────────────────────────────
// MUI X CHART STYLES
// ─────────────────────────────────────────────────────────────────────────────
const X_AXIS_STYLE = {
  tickLabelStyle: { fill: MUTED, fontSize: 11 },
  lineStyle:      { stroke: "transparent" },
  tickStyle:      { stroke: "transparent" },
};
const Y_AXIS_HIDDEN = {
  tickLabelStyle: { display: "none" },
  lineStyle:      { stroke: "transparent" },
  tickStyle:      { stroke: "transparent" },
  disableTicks:   true,
};
const Y_AXIS_MONEY = {
  tickLabelStyle: { fill: MUTED, fontSize: 11 },
  lineStyle:      { stroke: "transparent" },
  tickStyle:      { stroke: "transparent" },
  valueFormatter: (v) => v >= 1000 ? `${(v / 1000).toFixed(0)}K` : String(v),
};
const TOOLTIP_SX = {
  "& .MuiChartsTooltip-paper": {
    background:   "#1f2937 !important",
    border:       `1px solid ${GRID_COLOR} !important`,
    borderRadius: "10px !important",
    boxShadow:    "none !important",
  },
  "& .MuiChartsTooltip-labelCell, & .MuiChartsTooltip-valueCell": {
    color: "#f5f5f5 !important", fontSize: "12px !important",
  },
};
const BASE_SX = {
  ...TOOLTIP_SX,
  "& .MuiChartsAxis-line": { stroke: "transparent" },
  "& .MuiChartsAxis-tick": { stroke: "transparent" },
};
const STACKED_BAR_SX = {
  ...BASE_SX,
  "& .MuiChartsAxis-left":    { display: "none" },
  "& .MuiChartsLegend-label": { fill: `${MUTED} !important`, fontSize: "11px !important" },
  "& .MuiChartsLegend-mark":  { rx: 4 },
};
const LINE_BAR_SX = {
  ...BASE_SX,
  "& .MuiChartsGrid-line": { stroke: GRID_COLOR, strokeDasharray: "3 3" },
};

// ─────────────────────────────────────────────────────────────────────────────
// HELPERS
// ─────────────────────────────────────────────────────────────────────────────
const fmtRupee = (v) => {
  const n = Number(v) || 0;
  if (n >= 100000) return `₹${(n / 100000).toFixed(1)}L`;
  if (n >= 1000)   return `₹${(n / 1000).toFixed(1)}K`;
  return `₹${n}`;
};
const fmtNum = (v) => {
  const n = Number(v) || 0;
  if (n >= 1000) return `${(n / 1000).toFixed(1)}K`;
  return String(n);
};

// ─────────────────────────────────────────────────────────────────────────────
// CONTROLS
// ─────────────────────────────────────────────────────────────────────────────
function YearNav({ year, minYear = MIN_YEAR, onYearChange }) {
  return (
    <div className="flex items-center gap-1">
      <button
        type="button"
        disabled={year <= minYear}
        onClick={() => year > minYear && onYearChange(year - 1)}
        className="btn btn-xs btn-ghost text-base-content px-2 disabled:opacity-30"
      >‹</button>
      <span className="text-sm font-bold text-base-content min-w-[3.2rem] text-center select-none tabular-nums">
        {year}
      </span>
      {year < CUR_YEAR ? (
        <button
          type="button"
          onClick={() => onYearChange(year + 1)}
          className="btn btn-xs btn-ghost text-base-content px-2"
        >›</button>
      ) : (
        <span className="w-6 inline-block" />
      )}
    </div>
  );
}

function MonthSelect({ value, year, onChange }) {
  const opts = MONTH_OPTIONS.filter(
    (o) => o.value === 0 || year < CUR_YEAR || o.value <= CUR_MONTH
  );
  return (
    <select
      value={value}
      onChange={(e) => onChange(Number(e.target.value))}
      className="select select-bordered select-xs text-base-content text-xs min-w-[120px]"
    >
      {opts.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
    </select>
  );
}

function YearMonthControl({ year, month, onYearChange, onMonthChange }) {
  return (
    <div className="flex items-center gap-2 flex-wrap">
      <MonthSelect value={month} year={year} onChange={onMonthChange} />
      <YearNav year={year} onYearChange={onYearChange} />
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// LAYOUT PRIMITIVES
// ─────────────────────────────────────────────────────────────────────────────
function SectionHeader({ title, tag }) {
  return (
    <div className="mb-5">
      <p className="text-[11px] tracking-[3px] font-bold text-yellow-500 mb-1 uppercase">{tag}</p>
      <h2 className="text-xl font-bold text-base-content">{title}</h2>
    </div>
  );
}
function Card({ children, className = "" }) {
  return (
    <div className={`card bg-base-200 border border-base-300 rounded-2xl shadow-sm ${className}`}>
      <div className="card-body p-5">{children}</div>
    </div>
  );
}
function CardHeader({ title, control }) {
  return (
    <div className="flex items-center justify-between mb-3 flex-wrap gap-2">
      <p className="text-sm font-semibold text-base-content">{title}</p>
      {control && <div>{control}</div>}
    </div>
  );
}
function Divider() {
  return <div className="divider my-0 opacity-30" />;
}

// ─────────────────────────────────────────────────────────────────────────────
// KPI CARDS
// ─────────────────────────────────────────────────────────────────────────────
const KPI_META = [
  { key: "total_clients",  label: "Total Clients",  icon: "👥", fmt: fmtNum,   accent: "#7B61FF" },
  { key: "total_events",   label: "Total Events",   icon: "📸", fmt: fmtNum,   accent: "#E879A0" },
  { key: "total_revenue",  label: "Total Revenue",  icon: "💰", fmt: fmtRupee, accent: "#C9A84C" },
  { key: "pending_amount", label: "Pending Amount", icon: "⏳", fmt: fmtRupee, accent: "#E05C5C" },
];

function KPICards() {
  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
      {KPI_META.map(({ key, label, icon, fmt, accent }) => {
        const stat = FAKE_KPI[key];
        const pct  = stat.change_pct;
        const up   = pct >= 0;
        return (
          <div key={key} className="relative overflow-hidden bg-base-200 border border-base-300 rounded-2xl p-5">
            <div
              className="absolute inset-x-0 top-0 h-[3px] rounded-t-2xl"
              style={{ background: `linear-gradient(90deg, ${accent}, transparent)` }}
            />
            <div className="flex justify-between items-start mb-3">
              <span className="text-xs font-medium text-base-content/60">{label}</span>
              <span className="text-xl leading-none">{icon}</span>
            </div>
            <div className="text-3xl font-extrabold mb-2 leading-none" style={{ color: accent }}>
              {fmt(stat.value)}
            </div>
            <div className="flex items-center gap-2 flex-wrap">
              <span className={`badge badge-sm font-bold ${up ? "badge-success" : "badge-error"}`}>
                {up ? "↑" : "↓"} {Math.abs(pct)}%
              </span>
              <span className="text-xs text-base-content/40">vs last month</span>
            </div>
          </div>
        );
      })}
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// MAIN DASHBOARD
// ─────────────────────────────────────────────────────────────────────────────
export default function sample() {

  // ── Year / month state — pure UI, no API calls ────────────────────────────
  const [combinedYear,  setCombinedYear]  = useState(CUR_YEAR);
  const [sparkYear,     setSparkYear]     = useState(CUR_YEAR);
  const [evtPieYear,    setEvtPieYear]    = useState(CUR_YEAR);
  const [evtPieMon,     setEvtPieMon]     = useState(0);
  const [revLineYear,   setRevLineYear]   = useState(CUR_YEAR);
  const [revDonutYear,  setRevDonutYear]  = useState(CUR_YEAR);
  const [revDonutMon,   setRevDonutMon]   = useState(0);
  const [payPieYear,    setPayPieYear]    = useState(CUR_YEAR);
  const [payPieMon,     setPayPieMon]     = useState(0);
  const [payTrendYear,  setPayTrendYear]  = useState(CUR_YEAR);

  // NOTE: Year/month controls are fully wired for UI interaction.
  // In production, changing year/month would trigger an API fetch.
  // Here the data stays static (fake) regardless of selection.

  // ── Pie data shaped for MUI X ─────────────────────────────────────────────
  const eventPieData = FAKE_EVENT_PIE.map(d => ({
    id: d.status, value: d.value, label: d.name,
    color: STATUS_COLORS[d.status] ?? "#999",
  }));
  const revDonutData = FAKE_DONUT.map((d, i) => ({
    id: d.name, value: d.value, label: d.name, color: DONUT_COLORS[i],
  }));
  const payPieData = FAKE_PAY_PIE.map(d => ({
    id: d.status, value: d.value, label: d.name,
    color: PAYMENT_COLORS[d.status] ?? "#999",
  }));

  // ─────────────────────────────────────────────────────────────────────────
  return (
    <div className="min-h-screen bg-base-100 text-base-content px-4 md:px-8 py-8">

      {/* ── Page Header ── */}
      <div className="mb-8 pb-6 border-b border-base-300">
        <p className="text-[11px] tracking-[4px] font-bold text-yellow-500 mb-2 uppercase">
          Ela Studio
        </p>
        <h1 className="text-3xl font-extrabold text-base-content">Admin Dashboard</h1>
        <p className="text-sm text-base-content/50 mt-1">
          {new Date().toLocaleDateString("en-IN", {
            weekday: "long", year: "numeric", month: "long", day: "numeric",
          })}
        </p>
      </div>

      {/* ══ KPI ══ */}
      <KPICards />

      {/* ══ SECTION 2 — Client Analytics ══ */}
      <section className="mb-10">
        <SectionHeader tag="Section 02" title="Client Analytics" />
        <div className="grid grid-cols-1 lg:grid-cols-5 gap-5">

          {/* Stacked Bar — Clients (pink) + Events (blue) */}
          <Card className="lg:col-span-3">
            <CardHeader
              title="Clients & Events Per Month"
              control={
                <YearNav year={combinedYear} onYearChange={setCombinedYear} />
              }
            />
            <BarChart
              height={270}
              xAxis={[{ scaleType: "band", data: MONTHS, ...X_AXIS_STYLE }]}
              yAxis={[{ ...Y_AXIS_HIDDEN }]}
              series={[
                {
                  data:           FAKE_CLIENT_BAR,
                  label:          "Clients",
                  color:          PINK_BAR,
                  stack:          "combined",
                  valueFormatter: (v) => `${v} clients`,
                },
                {
                  data:           FAKE_EVENT_BAR,
                  label:          "Events",
                  color:          BLUE_BAR,
                  stack:          "combined",
                  valueFormatter: (v) => `${v} events`,
                },
              ]}
              borderRadius={6}
              grid={{ horizontal: false }}
              sx={STACKED_BAR_SX}
              slotProps={{
                legend: {
                  direction:      "row",
                  position:       { vertical: "bottom", horizontal: "middle" },
                  padding:        { top: 12 },
                  itemMarkWidth:  12,
                  itemMarkHeight: 12,
                  labelStyle:     { fontSize: 11, fill: MUTED },
                },
              }}
            />
          </Card>

          {/* Sparkline — Client Growth Trend */}
          <Card className="lg:col-span-2 flex flex-col">
            <CardHeader
              title="Client Growth Trend"
              control={<YearNav year={sparkYear} onYearChange={setSparkYear} />}
            />
            <div className="mb-3">
              <p className="text-4xl font-extrabold text-base-content leading-none">
                {FAKE_SPARKLINE[FAKE_SPARKLINE.length - 1]}
              </p>
              <p className="text-xs text-base-content/50 mt-1">
                Cumulative clients · {sparkYear}
              </p>
            </div>
            <Divider />
            <div className="flex-1 min-h-[130px] mt-2">
              <SparkLineChart
                data={FAKE_SPARKLINE}
                height={140}
                curve="monotoneX"
                showTooltip
                showHighlight
                area
                colors={[GOLD]}
                sx={{
                  "& .MuiAreaElement-root": { fill: GOLD, opacity: 0.15 },
                  "& .MuiLineElement-root": { stroke: GOLD, strokeWidth: 2.5 },
                  "& .MuiMarkElement-root": { stroke: GOLD, fill: "transparent", strokeWidth: 2 },
                  ...TOOLTIP_SX,
                }}
              />
            </div>
            <div className="flex justify-between px-1 mt-1">
              {["J","F","M","A","M","J","J","A","S","O","N","D"].map((m, i) => (
                <span key={i} className="text-[10px] text-base-content/30">{m}</span>
              ))}
            </div>
          </Card>

        </div>
      </section>

      {/* ══ SECTION 3 — Event Analytics ══ */}
      <section className="mb-10">
        <SectionHeader tag="Section 03" title="Event Analytics" />
        <div className="grid grid-cols-1 lg:grid-cols-5 gap-5">

          {/* Pie — Event Status */}
          <Card className="lg:col-span-2">
            <CardHeader
              title="Event Status"
              control={
                <YearMonthControl
                  year={evtPieYear} month={evtPieMon}
                  onYearChange={setEvtPieYear} onMonthChange={setEvtPieMon}
                />
              }
            />
            <PieChart
              height={260}
              series={[{
                data:           eventPieData,
                innerRadius:    0,
                outerRadius:    90,
                paddingAngle:   2,
                cornerRadius:   4,
                highlightScope: { fade: "global", highlight: "item" },
                valueFormatter: (v) => `${v.value} events`,
              }]}
              sx={TOOLTIP_SX}
              slotProps={{
                legend: {
                  direction:      "row",
                  position:       { vertical: "bottom", horizontal: "middle" },
                  padding:        { top: 8 },
                  itemMarkWidth:  8,
                  itemMarkHeight: 8,
                  labelStyle:     { fontSize: 11, fill: MUTED },
                },
              }}
            />
          </Card>

          {/* Event status summary grid */}
          <Card className="lg:col-span-3 flex flex-col gap-4">
            <div>
              <p className="text-[11px] tracking-[3px] font-bold text-yellow-500 uppercase mb-1">Quick Stats</p>
              <p className="text-base font-bold text-base-content">Event Overview</p>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 flex-1">
              {FAKE_EVENT_PIE.map((d) => (
                <div key={d.status} className="bg-base-300 rounded-xl p-4 flex flex-col gap-2 border border-base-300">
                  <div className="flex items-center gap-2">
                    <span className="w-2.5 h-2.5 rounded-full shrink-0" style={{ background: STATUS_COLORS[d.status] ?? "#999" }} />
                    <span className="text-xs text-base-content/60 capitalize truncate">{d.name}</span>
                  </div>
                  <span className="text-2xl font-extrabold text-base-content">{d.value}</span>
                </div>
              ))}
            </div>
          </Card>

        </div>
      </section>

      {/* ══ SECTION 4 — Revenue Analytics ══ */}
      <section className="mb-10">
        <SectionHeader tag="Section 04" title="Revenue Analytics" />
        <div className="grid grid-cols-1 lg:grid-cols-5 gap-5">

          {/* Line — Monthly Revenue */}
          <Card className="lg:col-span-3">
            <CardHeader
              title="Monthly Revenue"
              control={<YearNav year={revLineYear} onYearChange={setRevLineYear} />}
            />
            <LineChart
              height={250}
              xAxis={[{ scaleType: "band", data: MONTHS, ...X_AXIS_STYLE }]}
              yAxis={[{ ...Y_AXIS_MONEY }]}
              series={[{
                data:           FAKE_REVENUE_LINE,
                label:          "Revenue",
                color:          GOLD,
                area:           false,
                showMark:       true,
                valueFormatter: fmtRupee,
              }]}
              grid={{ horizontal: true }}
              sx={LINE_BAR_SX}
              slotProps={{ legend: { hidden: true } }}
            />
          </Card>

          {/* Donut — Paid vs Pending */}
          <Card className="lg:col-span-2 flex flex-col">
            <CardHeader
              title="Paid vs Pending"
              control={
                <YearMonthControl
                  year={revDonutYear} month={revDonutMon}
                  onYearChange={setRevDonutYear} onMonthChange={setRevDonutMon}
                />
              }
            />
            <PieChart
              height={190}
              series={[{
                data:           revDonutData,
                innerRadius:    52,
                outerRadius:    82,
                paddingAngle:   3,
                cornerRadius:   4,
                highlightScope: { fade: "global", highlight: "item" },
                valueFormatter: (v) => fmtRupee(v.value),
              }]}
              sx={TOOLTIP_SX}
              slotProps={{ legend: { hidden: true } }}
            />
            <div className="flex flex-col gap-2 mt-3">
              {FAKE_DONUT.map((d, i) => (
                <div key={d.name} className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="w-2.5 h-2.5 rounded-full shrink-0" style={{ background: DONUT_COLORS[i] }} />
                    <span className="text-xs text-base-content/60">{d.name}</span>
                  </div>
                  <span className="text-sm font-bold text-base-content">{fmtRupee(d.value)}</span>
                </div>
              ))}
            </div>
          </Card>

        </div>
      </section>

      {/* ══ SECTION 5 — Payment Analytics ══ */}
      <section className="mb-10">
        <SectionHeader tag="Section 05" title="Payment Analytics" />
        <div className="grid grid-cols-1 lg:grid-cols-5 gap-5">

          {/* Pie — Payment Status */}
          <Card className="lg:col-span-2">
            <CardHeader
              title="Payment Status"
              control={
                <YearMonthControl
                  year={payPieYear} month={payPieMon}
                  onYearChange={setPayPieYear} onMonthChange={setPayPieMon}
                />
              }
            />
            <PieChart
              height={240}
              series={[{
                data:           payPieData,
                innerRadius:    0,
                outerRadius:    90,
                paddingAngle:   2,
                cornerRadius:   4,
                highlightScope: { fade: "global", highlight: "item" },
                valueFormatter: (v) => `${v.value} payments`,
              }]}
              sx={TOOLTIP_SX}
              slotProps={{
                legend: {
                  direction:      "row",
                  position:       { vertical: "bottom", horizontal: "middle" },
                  padding:        { top: 8 },
                  itemMarkWidth:  8,
                  itemMarkHeight: 8,
                  labelStyle:     { fontSize: 11, fill: MUTED },
                },
              }}
            />
          </Card>

          {/* Line — Payment Collection Trend */}
          <Card className="lg:col-span-3">
            <CardHeader
              title="Payment Collection Trend"
              control={<YearNav year={payTrendYear} onYearChange={setPayTrendYear} />}
            />
            <LineChart
              height={250}
              xAxis={[{ scaleType: "band", data: MONTHS, ...X_AXIS_STYLE }]}
              yAxis={[{ ...Y_AXIS_MONEY }]}
              series={[{
                data:           FAKE_PAY_TREND,
                label:          "Collected",
                color:          "#4CAF7D",
                area:           false,
                showMark:       true,
                valueFormatter: fmtRupee,
              }]}
              grid={{ horizontal: true }}
              sx={LINE_BAR_SX}
              slotProps={{ legend: { hidden: true } }}
            />
          </Card>

        </div>
      </section>

      {/* ── Footer ── */}
      <footer className="border-t border-base-300 pt-5 text-center">
        <p className="text-xs text-base-content/30 tracking-widest uppercase">
          Ela Studio Management · Admin Analytics · {CUR_YEAR}
        </p>
      </footer>

    </div>
  );
}