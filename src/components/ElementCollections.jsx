
import { CUR_YEAR, CUR_MONTH } from "../helpers/data";

const MONTH_NAMES = ["January", "February", "March", "April","May", "June", "July", "August","September", "October", "November", "December"];

// ─────────────────────────────────────────────────────────────────────────────
// YearNav — ‹ 2026 › with maxYear ceiling
// ─────────────────────────────────────────────────────────────────────────────
export function YearNav({ year, minYear, maxYear = CUR_YEAR, onYearChange }) {
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

      {year < maxYear ? (
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

// ─────────────────────────────────────────────────────────────────────────────
// YearMonthControl
//
// Behaviour:
//  • Default: current month + current year, "All Months" unchecked
//  • ‹ Month › arrows navigate; wraps Jan→Dec prev year, Dec→Jan next year
//  • "All Months" checkbox: checked → hides month nav, sends month=0 to parent
//    unchecked → restores month nav at saved month
//
// ✅ KEY FIX — maxMonth ceiling:
//   If maxYear === CUR_YEAR  → ceiling is CUR_MONTH (can't browse future months)
//   If maxYear >  CUR_YEAR  → ceiling is December (all 12 months allowed —
//                              events like 2027-07-10 must be reachable)
// ─────────────────────────────────────────────────────────────────────────────
export function YearMonthControl({
  year,
  month,                    // 0 = all months, 1–12 = specific month
  minYear,
  maxYear = CUR_YEAR,
  maxMonth: maxMonthProp,   // ✅ from backend — exact ceiling month for selected year
  onYearChange,
  onMonthChange,
}) {
  const allMonths = month === 0;

  // ✅ Use backend-supplied maxMonth when available.
  // Fallback: if maxYear is a future year allow all 12 months,
  //           if current year cap at CUR_MONTH.
  const maxMonth = maxMonthProp != null
    ? maxMonthProp
    : (maxYear > CUR_YEAR ? 12 : CUR_MONTH);

  // ── Checkbox toggle ─────────────────────────────────────────────────────────
  const handleAllMonthsToggle = () => {
    if (allMonths) {
      // Untick → restore to a sensible month
      // If viewing the current year cap at CUR_MONTH, else use December
      const restoreMonth = year === CUR_YEAR ? CUR_MONTH : 12;
      onMonthChange(restoreMonth);
    } else {
      onMonthChange(0); // all months
    }
  };

  // ── ‹ Month — wraps Jan → Dec of previous year ─────────────────────────────
  const handlePrevMonth = () => {
    if (month === 1) {
      if (year > minYear) {
        onYearChange(year - 1);
        onMonthChange(12);
      }
    } else {
      onMonthChange(month - 1);
    }
  };

  // ── › Month — wraps Dec → Jan of next year ─────────────────────────────────
  const handleNextMonth = () => {
    // ✅ FIX: ceiling uses maxMonth not CUR_MONTH — so July 2027 is reachable
    if (year >= maxYear && month >= maxMonth) return;

    if (month === 12) {
      if (year < maxYear) {
        onYearChange(year + 1);
        onMonthChange(1);
      }
    } else {
      onMonthChange(month + 1);
    }
  };

  // ── Disabled states ─────────────────────────────────────────────────────────
  const prevDisabled = year <= minYear && month <= 1;
  // ✅ FIX: nextDisabled also uses maxMonth
  const nextDisabled = year >= maxYear && month >= maxMonth;

  // ── Year change — clamp month only when navigating into CUR_YEAR ────────────
  const handleYearChange = (y) => {
    onYearChange(y);
    if (!allMonths) {
      // Clamp only if we just moved into the current year and month exceeds CUR_MONTH
      if (y === CUR_YEAR && month > CUR_MONTH) {
        onMonthChange(CUR_MONTH);
      }
      // If we moved into a future year, keep the month as-is (all months valid)
    }
  };

  return (
    <div className="flex flex-col md:flex-row justify-between  items-end gap-1.5">

      {/* Row 1 — All Months checkbox */}
      <div className="my-1">
        <YearNav
          year={year}
          minYear={minYear}
          maxYear={maxYear}
          onYearChange={handleYearChange}
        />
      </div>
      <div className="flex items-end justify-between gap-4">
        <div className="flex  gap-1 tooltip my-1" data-tip="All Months">
          
        {!allMonths && (
          <div className="flex items-center gap-1">
            <button
              type="button"
              disabled={prevDisabled}
              onClick={handlePrevMonth}
              className="btn btn-xs btn-ghost text-base-content px-2 disabled:opacity-30"
            >‹</button>

            <span className="text-xs font-semibold text-base-content min-w-[4.5rem] text-center select-none">
              {MONTH_NAMES[(month - 1) % 12]}
            </span>

            <button
              type="button"
              disabled={nextDisabled}
              onClick={handleNextMonth}
              className="btn btn-xs btn-ghost text-base-content px-2 disabled:opacity-30"
            >›</button>
          </div>
        )}
        <label className="flex items-center gap-1.5 cursor-pointer select-none">
            <input
              type="checkbox"
              checked={allMonths}
              onChange={handleAllMonthsToggle}
              className="checkbox checkbox-xs checkbox-primary"
            />
            <span className="text-xs text-base-content/60 font-medium">All</span>
          </label>
        </div>

      </div>

    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Layout primitives
// ─────────────────────────────────────────────────────────────────────────────
export function SectionHeader({ title, tag }) {
  return (
    <div className="mb-5">
      <p className="text-[11px] tracking-[3px] font-bold text-yellow-500 mb-1 uppercase">{tag}</p>
      <h2 className="text-xl font-bold text-base-content">{title}</h2>
    </div>
  );
}

export function Card({ children, className = "" }) {
  return (
    <div className={` bg-base-100 dark:bg-zinc-900 border border-base-300  dark:border-zinc-800 rounded-2xl shadow-sm ${className}`}>
      <div className="">
        {/* card card-body */}
        {children}
      </div>
    </div>
  );
}

export function CardHeader({ title, control }) {
  return (
    <div className="flex flex-row  lg:items-center justify-between mx-5 my-4 flex-wrap gap-2">
      <p className="text-base font-semibold text-base-content">{title}</p>
      {control &&
        <div className="">{control}</div>}
    </div>
  );
}

export function Divider() {
  return <div className="divider my-0 opacity-30" />;
}
