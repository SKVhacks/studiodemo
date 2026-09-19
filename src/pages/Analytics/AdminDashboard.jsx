import { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";

import KPICard from './DashComponents/KPICard';
import MergeBar from "./DashComponents/MergeBar";
import ChartSparkLine from "./DashComponents/ChartSparkLine";
import ChartPie from './DashComponents/ChartPie';
import ChartDonut from "./DashComponents/ChartDonut";

import { qs } from "../../helpers/converter";
import { CUR_YEAR, CUR_MONTH, STATUS_COLORS, PAYMENT_COLORS, DONUT_COLORS } from "../../helpers/data";
import { YearNav, YearMonthControl, Card, CardHeader, SectionHeader } from "../../components/ElementCollections";

import API from "../../api/axios";
import CurrentMonthStats from "./DashComponents/CurrentMonthStats";

// ─────────────────────────────────────────────────────────────────────────────
// FETCH
// ─────────────────────────────────────────────────────────────────────────────
async function fetchJSON(url) {
  const res = await API.get(url);
  return res.data;
}

// ─────────────────────────────────────────────────────────────────────────────
// useChart — isolated state per chart
// ✅ FIX: now tracks maxYear from available_years so future years are reachable
// ─────────────────────────────────────────────────────────────────────────────
function useChart(endpoint, initialYear = CUR_YEAR, initialMonth = 0) {
  const [data, setData] = useState(null);
  const [year, setYearRaw] = useState(initialYear);
  const [month, setMonthRaw] = useState(initialMonth);
  const [minYear, setMinYear] = useState(initialYear);
  const [maxYear, setMaxYear] = useState(initialYear);
  // ✅ maxMonth: ceiling month for the selected year (from backend)
  // e.g. July (7) when year=2027 and latest event is 2027-07-10
  const [maxMonth, setMaxMonth] = useState(CUR_MONTH);

  const load = useCallback((y, m) => {
    fetchJSON(`/analytics/${endpoint}/${qs(y, m)}`)
      .then((d) => {
        setData(d);
        if (d.available_years?.length) {
          setMinYear(d.available_years[0]);
          setMaxYear(d.available_years[d.available_years.length - 1]);
        }
        // ✅ Read max_month from backend response
        if (d.max_month != null) setMaxMonth(d.max_month);
      })
      .catch(console.error);
  }, [endpoint]); // eslint-disable-line

  useEffect(() => { load(initialYear, initialMonth); }, []); // eslint-disable-line

  const setYear = useCallback((y) => { setYearRaw(y); load(y, month); }, [load, month]);
  const setMonth = useCallback((m) => { setMonthRaw(m); load(year, m); }, [load, year]);

  return { data, year, month, minYear, maxYear, maxMonth, setYear, setMonth };
}

// ─────────────────────────────────────────────────────────────────────────────
// MAIN DASHBOARD
// ─────────────────────────────────────────────────────────────────────────────
export default function AdminDashboard() {
  const navigate = useNavigate();

  // ── KPI ────────────────────────────────────────────────────────────────────
  const [kpi, setKpi] = useState(null);
  useEffect(() => {
    fetchJSON("/analytics/kpi/").then(setKpi).catch(console.error);
  }, []);

  // ── Dark mode ──────────────────────────────────────────────────────────────
  const [isDark, setIsDark] = useState(() =>
    window.matchMedia('(prefers-color-scheme: dark)').matches
  );
  useEffect(() => {
    const mq = window.matchMedia('(prefers-color-scheme: dark)');
    const handler = (e) => setIsDark(e.matches);
    mq.addEventListener('change', handler);
    return () => mq.removeEventListener('change', handler);
  }, []);

  // ── Section 2 — stacked bar shares ONE year nav ────────────────────────────
  const [combinedYear, setCombinedYear] = useState(CUR_YEAR);
  const [combinedMinYear, setCombinedMinYear] = useState(CUR_YEAR);
  const [combinedMaxYear, setCombinedMaxYear] = useState(CUR_YEAR); // ✅ NEW

  const clientsForBar = useChart("clients");
  const eventsForBar = useChart("events");
  const clientLine = useChart("clients");

  // ✅ FIX: destructure setYear for stable deps + sync maxYear
  const { setYear: setClientBarYear } = clientsForBar;
  const { setYear: setEventBarYear } = eventsForBar;

  const changeCombinedYear = useCallback((y) => {
    setCombinedYear(y);
    setClientBarYear(y);
    setEventBarYear(y);
  }, [setClientBarYear, setEventBarYear]);

  useEffect(() => {
    const minC = clientsForBar.minYear ?? CUR_YEAR;
    const minE = eventsForBar.minYear ?? CUR_YEAR;
    setCombinedMinYear(Math.min(minC, minE));

    // ✅ FIX: also sync maxYear — use the highest max from both endpoints
    const maxC = clientsForBar.maxYear ?? CUR_YEAR;
    const maxE = eventsForBar.maxYear ?? CUR_YEAR;
    setCombinedMaxYear(Math.max(maxC, maxE));
  }, [
    clientsForBar.minYear, eventsForBar.minYear,
    clientsForBar.maxYear, eventsForBar.maxYear,
  ]);

  // ── Section 3 — default to current month ──────────────────────────────────
  const eventPie = useChart("events", CUR_YEAR, CUR_MONTH);

  // ── Section 4 ──────────────────────────────────────────────────────────────
  const revLine = useChart("revenue");
  const revDonut = useChart("revenue", CUR_YEAR, CUR_MONTH); // default current month

  // ── Section 5 ──────────────────────────────────────────────────────────────
  const payPie = useChart("payments", CUR_YEAR, CUR_MONTH); // default current month
  const payTrend = useChart("payments");

  // ── Derived data ───────────────────────────────────────────────────────────
  const clientBarValues = (clientsForBar.data?.bar_data ?? []).map(d => d.clients ?? 0);
  const eventBarValues = (eventsForBar.data?.bar_data ?? []).map(d => d.events ?? 0);
  const sparklineValues = (clientLine.data?.line_data ?? []).map(d => d.total ?? 0);
  const revLineValues = (revLine.data?.line_data ?? []).map(d => d.revenue ?? 0);
  const revBalanceValues = (revLine.data?.line_data ?? []).map(d => d.balance ?? 0);
  const payTrendValues = (payTrend.data?.trend_data ?? []).map(d => d.collected ?? 0);

  const revDonutData = (revDonut.data?.donut_data ?? []).map((d, i) => ({
    id: d.name, value: d.value, label: d.name, color: DONUT_COLORS[i],
  }));
  const eventPieData = (eventPie.data?.pie_data ?? []).map(d => ({
    id: d.status, value: d.value, label: d.name, color: STATUS_COLORS[d.status] ?? "#999",
  }));
  const payPieData = (payPie.data?.pie_data ?? []).map(d => ({
    id: d.status, value: d.value, label: d.name, color: PAYMENT_COLORS[d.status] ?? "#999",
  }));

  // KPI sparkline data
  const payGraphData = revLine.data?.line_data ?? [];
  const revenueValues = payGraphData.map(item => item.revenue ?? 0);
  const balanceValues = payGraphData.map(item => item.balance ?? 0);

  // ✅ FIX: wait for BOTH bar hooks (prevents empty eventBarValues on first render)
  if (!kpi || !clientsForBar.data || !eventsForBar.data) return (
    <div className="min-h-screen bg-base-100 flex items-center justify-center">
      <span className="loading loading-spinner loading-xl text-yellow-500" />
    </div>
  );

  // ─────────────────────────────────────────────────────────────────────────
  return (
     <div className="mx-auto bg-gray-50 dark:bg-[#0B0C0E] shadow-xl px-3 py-0 min-h-screen">

      <div className="breadcrumbs text-xs font-normal">
        <ul>
          <li><a onClick={() => navigate('/')} className='no-underline hover:no-underline hover:text-bread'>Home</a></li>
          <li><a className='text-bread no-underline hover:no-underline'>Analytics</a></li>
        </ul>
      </div>
      {/* ── KPI Cards ── */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-5">
        <KPICard
          data={kpi}
          value={[kpi.clients_monthwise, kpi.events_monthwise, kpi.revenue_monthwise, kpi.pending_monthwise]}
        />
      </div>

      {/* ── Bar + Revenue Line ── */}
      <section className="mb-5">

        <div className="grid grid-cols-1 lg:grid-cols-5 gap-5">

          {/* Stacked Bar */}
          <Card className="lg:col-span-3">
            <CardHeader
              title="Clients & Events"
              control={
                <YearNav
                  year={combinedYear}
                  minYear={combinedMinYear}
                  maxYear={combinedMaxYear}
                  onYearChange={changeCombinedYear}
                />
              }
            />
            <MergeBar
              clientBarValues={clientBarValues}
              eventBarValues={eventBarValues}
              isDark={isDark}
            />
          </Card>

          {/* Revenue Area Chart */}
          <Card className="lg:col-span-2 flex flex-col">
            <CardHeader
              title="Monthly Revenue"
              control={
                <YearNav
                  year={revLine.year}
                  minYear={revLine.minYear}
                  maxYear={revLine.maxYear}
                  onYearChange={revLine.setYear}
                />
              }
            />
            <ChartSparkLine lineData={revLine.data?.line_data ?? []} isDark={isDark} />
          </Card>

        </div>
      </section>

      {/* ── Pie / Donut / Other ── */}
      <section className="mb-10">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">

          {/* Event Status Pie */}
          <Card className="lg:col-span-1">
            <CardHeader
              title="Event Status"
              control={
                <YearMonthControl
                  year={eventPie.year}
                  month={eventPie.month}
                  minYear={eventPie.minYear}
                  maxYear={eventPie.maxYear}
                  maxMonth={eventPie.maxMonth}
                  onYearChange={eventPie.setYear}
                  onMonthChange={eventPie.setMonth}
                />
              }
            />
            <ChartPie eventPieData={eventPieData} />
          </Card>

          {/* Paid vs Pending Donut */}
          <Card className="lg:col-span-1">
            <CardHeader
              title="Payment"
              control={
                <YearMonthControl
                  year={revDonut.year}
                  month={revDonut.month}
                  minYear={revDonut.minYear}
                  maxYear={revDonut.maxYear}
                  maxMonth={revDonut.maxMonth}
                  onYearChange={revDonut.setYear}
                  onMonthChange={revDonut.setMonth}
                />
              }
            />
            <ChartDonut revDonutData={revDonutData} />
          </Card>

          {/* Future slot */}
          <Card className="lg:col-span-1">
            <CardHeader title="Current Month Stats" />
            <CurrentMonthStats
              data={[kpi.total_clients_current_month, kpi.events_this_month_total, kpi.current_month_revenue, kpi.current_month_pending, kpi.events_status.scheduled, kpi.events_status.processing, kpi.events_status.shouted, kpi.events_status.completed, kpi.events_status.cancelled]}
            />
          </Card>

        </div>
      </section>

    </div>
  );
}