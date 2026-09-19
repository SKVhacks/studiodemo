import { useState, useEffect, useCallback, useRef } from "react";
import { CalendarSummary, EventsByDate } from '../../api/EventServices';
import EventDetail from "../Events/EventDetail";
import { MdAccessTime } from "react-icons/md";
import { AiOutlineUser } from "react-icons/ai";
import { FiPhoneCall } from "react-icons/fi";
import { CiLocationOn } from "react-icons/ci";
import { DAYS , MONTHSFull } from "../../helpers/data";

// ── helpers ───────────────────────────────────────────────────────────────

const MONTHS = MONTHSFull;
const pad = n => String(n).padStart(2, "0");
const getDaysInMonth = (y, m) => new Date(y, m + 1, 0).getDate();
const getFirstDay = (y, m) => new Date(y, m, 1).getDay();
const toStr = d => `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;

// ── status config ─────────────────────────────────────────────────────────
const STATUS = {
  scheduled: { badgeLight: "bg-sky-100 text-sky-700", badgeDark: "dark:bg-sky-900/50 dark:text-sky-300", accentLight: "bg-sky-400", accentDark: "dark:bg-sky-400", label: "Scheduled" },
  shouted: { badgeLight: "bg-amber-100 text-amber-700", badgeDark: "dark:bg-amber-900/50 dark:text-amber-300", accentLight: "bg-amber-400", accentDark: "dark:bg-amber-400", label: "Shouted" },
  processing: { badgeLight: "bg-violet-100 text-violet-700", badgeDark: "dark:bg-violet-900/50 dark:text-violet-300", accentLight: "bg-violet-400", accentDark: "dark:bg-violet-400", label: "Processing" },
  completed: { badgeLight: "bg-emerald-100 text-emerald-700", badgeDark: "dark:bg-emerald-900/50 dark:text-emerald-300", accentLight: "bg-emerald-400", accentDark: "dark:bg-emerald-400", label: "Completed" },
  cancelled: { badgeLight: "bg-rose-100 text-rose-700", badgeDark: "dark:bg-rose-900/50 dark:text-rose-300", accentLight: "bg-rose-400", accentDark: "dark:bg-rose-400", label: "Cancelled" },
};

// ── fetch only { date: count } — works for lakhs of events ───────────────
// Returns e.g. { "2026-03-12": 6, "2026-03-20": 2 }
// The backend GROUP BY query returns max 31 rows regardless of total events.
async function fetchCalendarSummary(year, month) {
  const base = `${year}-${pad(month + 1)}`;
  const from = `${base}-01`;
  const to = `${base}-${getDaysInMonth(year, month)}`;
  try {
    const result = await CalendarSummary(from, to);
    const map = {};
    (result.data || []).forEach(({ event_date, count }) => {
      map[event_date] = count;
    });
    return map;
  } catch (err) {
    console.error("Calendar summary fetch error:", err);
    return {};
  }
}

// ── Tooltip — shows event count on hover ──────────────────────────────────
function Tooltip({ count, date, visible, anchorRef }) {
  const [style, setStyle] = useState({});

  useEffect(() => {
    if (!visible || !anchorRef?.current) return;
    const r = anchorRef.current.getBoundingClientRect();
    const tip = { left: r.right + 8, top: r.top };
    if (tip.left + 180 > window.innerWidth) {
      tip.left = r.left - 180 - 8;
    }
    setStyle({ left: tip.left, top: tip.top });
  }, [visible, anchorRef]);

  if (!visible || !count) return null;

  return (
    <div
      className="fixed z-[9999] pointer-events-none w-44"
      style={style}
    >
      <div className="rounded-2xl border shadow-2xl overflow-hidden
                      bg-white border-slate-200
                      dark:bg-slate-800 dark:border-slate-700">
        <div className="p-3 text-center">
          <p className="text-2xl font-black text-auxillary">{count}</p>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            event{count !== 1 ? "s" : ""} on this day
          </p>
          <p className="text-[10px] text-slate-500 mt-1">
            Click to view details
          </p>
        </div>
      </div>
    </div>
  );
}



// ── EventCard ─────────────────────────────────────────────────────────────


// ── Main ──────────────────────────────────────────────────────────────────
export default function EventCalendar({ refreshKey }) {
  const [showModelEvent, setShowModelEvent] = useState(false);
  const [eventDetail, setEventDetail] = useState({});
  const today = new Date();
  const [year, setYear] = useState(today.getFullYear());
  const [month, setMonth] = useState(today.getMonth());

  // evMap: { "2026-03-12": 6, "2026-03-20": 2 } — counts only, not full events
  // This keeps the month-view API call tiny regardless of total event count.
  const [evMap, setEvMap] = useState({});
  const [loading, setLoading] = useState(false);

  const [selected, setSelected] = useState(null);
  // selectedEvs: full event objects, fetched only when a date is clicked
  const [selectedEvs, setSelectedEvs] = useState([]);
  const [detailLoading, setDetailLoading] = useState(false);

  const [hoveredDate, setHoveredDate] = useState(null);
  const hoveredRef = useRef(null);
  const detailRef = useRef(null);

  // ── On month change: fetch only the summary (dots + counts) ──────────────
  useEffect(() => {
    setLoading(true);
    setSelected(null);
    setSelectedEvs([]);
    fetchCalendarSummary(year, month).then(map => {
      setEvMap(map);
      setLoading(false);
    });
  }, [year, month , refreshKey]);

  const prevMonth = () => {
    if (month === 0) { setYear(y => y - 1); setMonth(11); } else setMonth(m => m - 1);
  };
  const nextMonth = () => {
    if (month === 11) { setYear(y => y + 1); setMonth(0); } else setMonth(m => m + 1);
  };
  const goToday = () => {
    setYear(today.getFullYear());
    setMonth(today.getMonth());
  };

  const handleEnter = useCallback((e, ds) => {
    if (!evMap[ds]) return;
    hoveredRef.current = e.currentTarget;
    setHoveredDate(ds);
  }, [evMap]);

  const handleLeave = useCallback(() => {
    hoveredRef.current = null;
    setHoveredDate(null);
  }, []);

  // ── On date click: fetch full events only for that one date ───────────────
  const handleClick = useCallback((ds) => {
    if (!evMap[ds]) return;

    // toggle off if already selected
    if (selected === ds) {
      setSelected(null);
      setSelectedEvs([]);
      return;
    }

    setSelected(ds);
    setSelectedEvs([]);
    setDetailLoading(true);

    EventsByDate(ds)
      .then(res => {
        setSelectedEvs(res.data.results || []);
      })
      .catch(err => {
        console.error("EventsByDate fetch error:", err);
        setSelectedEvs([]);
      })
      .finally(() => {
        setDetailLoading(false);
      });

    setTimeout(() => detailRef.current?.scrollIntoView({ behavior: "smooth", block: "start" }), 60);
  }, [evMap, selected]);

  // ── calendar grid ─────────────────────────────────────────────────────────
  const firstDay = getFirstDay(year, month);
  const daysInMonth = getDaysInMonth(year, month);
  const todayStr = toStr(today);

  // Sum of all counts for "This Month" stat
  const totalEvents = Object.values(evMap).reduce((a, b) => a + b, 0);

  const cells = [
    ...Array(firstDay).fill(null),
    ...Array.from({ length: daysInMonth }, (_, i) =>
      `${year}-${pad(month + 1)}-${pad(i + 1)}`
    ),
  ];

  return (
    <>
      <style>{`
        @keyframes slideIn { to { opacity:1; transform:translateX(0); } }
        .day-cell { transition: transform .13s ease; }
        .day-cell:hover { transform: scale(1.08); }
        * { font-family: sans-serif; }
      `}</style>

      <div className="transition-colors duration-300 ">

        <div className='px-0 py-2 md:py-4 mt-4'>
          <div className="flex flex-col">
            <h1 className='text-4xl font-bold text-base-content'>Calendar</h1>
            <p className="text-xs mt-1 text-slate-400 dark:text-slate-500">
              Quick Viewer of Events
            </p>
          </div> 
        </div>

        {/* ── main layout ── */}
        <div className="flex flex-col gap-6">

          {/* ══ Calendar card ══ */}
          <div className="rounded-2xl border shadow-lg mx-auto md:w-[420px] w-full  bg-white/5 backdrop-blur-xl border border-slate-200 dark:border-white/10">
                     <div className="p-4 sm:p-6">

              {/* month nav */}
              <div className="flex items-center justify-between mb-5">
                <div>
                  <button
                    onClick={prevMonth}
                    className="w-8 h-8 rounded-xl flex items-center justify-center text-lg font-bold transition-colors
                             text-slate-400 hover:text-slate-700 hover:bg-slate-100
                             dark:text-slate-500 dark:hover:text-slate-200 dark:hover:bg-slate-700"
                  >‹</button>
                </div>
                <div className="text-center">
                  <h2 className="text-base sm:text-lg font-black text-slate-800 dark:text-slate-100">
                    {MONTHS[month]}
                  </h2>
                  <p className="text-[11px] -mt-0.5 text-slate-400 dark:text-slate-500">{year}</p>
                </div>
                <div>
                  <button
                    onClick={goToday}
                    className="px-4 py-1.5 rounded-xl text-xs font-semibold border transition-colors text-auxillary hover:bg-auxillary hover:text-white hover:border-auxillary"
                  >
                    Today
                  </button>
                </div>
                <div>
                  <button
                    onClick={nextMonth}
                    className="w-8 h-8 rounded-xl flex items-center justify-center text-lg font-bold transition-colors
                             text-slate-400 hover:text-slate-700 hover:bg-slate-100
                             dark:text-slate-500 dark:hover:text-slate-200 dark:hover:bg-slate-700"
                  >›</button>
                </div>
              </div>

              {/* weekday headers */}
              <div className="grid grid-cols-7 mb-1.5">
                {DAYS.map(d => (
                  <div key={d}
                    className="text-center text-[10px] font-bold uppercase tracking-widest py-1
                               text-slate-300 dark:text-slate-600">
                    {d}
                  </div>
                ))}
              </div>

              {/* day cells */}
              {loading ? (
                <div className="flex justify-center py-16">
                  <div className="w-6 h-6 rounded-full border-2 border-auxillary border-t-transparent animate-spin" />
                </div>
              ) : (
                <div className="grid grid-cols-7 gap-1">
                  {cells.map((ds, idx) => {
                    if (!ds) return <div key={`e${idx}`} />;

                    // evMap[ds] is a count (number), not an array
                    const hasEv = !!evMap[ds];
                    const isToday = ds === todayStr;
                    const isSel = ds === selected;
                    const isHov = ds === hoveredDate;
                    const day = parseInt(ds.split("-")[2]);

                    return (
                      <div
                        key={ds}
                        className={`
                          day-cell rounded-xl py-3 min-h-[52px] flex flex-col items-center select-none
                          ${hasEv ? "cursor-pointer" : "cursor-default"}
                          ${isSel
                            ? "bg-auxillary shadow-lg shadow-auxillary/30"
                            : isToday
                              ? "bg-core/10 border border-core"
                              : hasEv
                                ? `border transition-colors
                                   ${isHov
                                  ? "bg-slate-100 border-slate-300 dark:bg-slate-700 dark:border-slate-500"
                                  : "bg-slate-50 border-slate-200 dark:bg-slate-700/50 dark:border-slate-700"}`
                                : "border border-transparent"}
                        `}
                        onMouseEnter={e => handleEnter(e, ds)}
                        onMouseLeave={handleLeave}
                        onClick={() => handleClick(ds)}
                      >
                        <span className={`text-xs font-semibold leading-none
                          ${isSel ? "text-white font-bold" :
                            isToday ? "text-core font-black" :
                              hasEv ? "text-slate-700 dark:text-slate-200 font-semibold" :
                                "text-slate-300 dark:text-slate-600"}
                        `}>{day}</span>

                        {hasEv && (
                          <span className={`mt-1.5 w-1 h-1 rounded-full
                            ${isSel ? "bg-white/70" : "bg-auxillary"}`}
                          />
                        )}
                      </div>
                    );
                  })}
                </div>
              )}

              {/* stats */}
              <div className="mt-5 grid grid-cols-2 gap-2">
                <div className="rounded-xl p-3 text-center border border-white/5 bg-white/5">
                  <p className="text-[10px] uppercase tracking-widest text-slate-400 dark:text-slate-500">
                    This Month
                  </p>
                  <p className="text-2xl font-black text-core/80 mt-0.5">{totalEvents}</p>
                  <p className="text-[10px] text-slate-400 dark:text-slate-500">events</p>
                </div>
                <div className="rounded-xl p-3 text-center border bg-white/5 border-white/5">
                  <p className="text-[10px] uppercase tracking-widest text-slate-400 dark:text-slate-500">
                    Active Days
                  </p>
                  <p className="text-2xl font-black text-auxillary/80 mt-0.5">
                    {Object.keys(evMap).length}
                  </p>
                  <p className="text-[10px] text-slate-400 dark:text-slate-500">booked</p>
                </div>
              </div>
            </div>
          </div>

          {/* ══ Detail Panel ══ */}
          <div ref={detailRef} className="w-full min-w-0 flex-1">
            {selected ? (
              <>
                <div className="flex flex-wrap items-start justify-between gap-2 mb-4">
                  <div>
                    <h2 className="font-black text-sm sm:text-base leading-tight
                                   text-slate-800 dark:text-slate-100">
                      {new Date(selected + "T00:00:00").toLocaleDateString("en-IN", {
                        weekday: "long", day: "numeric", month: "long", year: "numeric",
                      })}
                    </h2>
                    <p className="text-xs mt-0.5 text-slate-400 dark:text-slate-500">
                      {detailLoading
                        ? "Loading events…"
                        : `${selectedEvs.length} event${selectedEvs.length !== 1 ? "s" : ""} scheduled`
                      }
                    </p>
                  </div>
                  <button
                    onClick={() => { setSelected(null); setSelectedEvs([]); }}
                    className="px-3 py-1 rounded-lg text-xs border transition-colors text-red-500 hover:text-white hover:bg-red-500 hover:border-red-500"
                  >
                    Clear ✕
                  </button>
                </div>

                {detailLoading ? (
                  <div className="flex justify-center py-16">
                    <div className="w-6 h-6 rounded-full border-2 border-auxillary border-t-transparent animate-spin" />
                  </div>
                ) : (
                  // <div className="grid grid-cols-1 sm:grid-cols-2 5xl:grid-cols-3 gap-4">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {selectedEvs.map((ev, i) => (
                      <EventCard
                        key={ev.id}
                        ev={ev}
                        index={i}
                        setEventDetail={setEventDetail}
                        setShowModelEvent={setShowModelEvent}
                        onClose={() => { setSelected(null); setSelectedEvs([]); }}
                      />
                    ))}
                  </div>
                )}
              </>
            ) : (
              <div className="flex flex-col items-center justify-center text-center py-20 opacity-30 select-none">
                <div className="text-6xl mb-5">📅</div>
                <p className="font-bold text-sm text-slate-600 dark:text-slate-400">No date selected</p>
                <p className="text-xs mt-1.5 text-slate-400 dark:text-slate-500">
                  Click a highlighted date to see event details
                </p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* ── Tooltip ── */}
      <Tooltip
        count={hoveredDate ? evMap[hoveredDate] : 0}
        date={hoveredDate}
        visible={!!hoveredDate && !!evMap[hoveredDate]}
        anchorRef={hoveredRef}
      />

      {showModelEvent && (
        <EventDetail viewEventDetail={eventDetail} setViewEventDetail={setEventDetail} setShowEventModel={setShowModelEvent} />
      )}

    </>
  );
}

function EventCard({ ev, onClose, index, setEventDetail, setShowModelEvent }) {
  const s = STATUS[ev.status] || STATUS.scheduled;
  const date = new Date(ev.event_date + "T00:00:00");


  return (
    <div
     className={`relative rounded-2xl border overflow-hidden shadow-md w-full backdrop-blur-3xl
  ${ev.status === "cancelled" ? "bg-red-600/20 text-white" : "bg-white/55 dark:bg-zinc-900"}
  border-base-300  dark:border-zinc-800 hover:cursor-pointer hover:border-auxillary`}

      onClick={() => {
        console.log(ev)
        setEventDetail(ev);
        setShowModelEvent(true);
      }}
    >
      <div className="p-4 space-y-2">

        {/* header */}
        <div className="flex justify-around">
          <div className="flex items-start gap-3">
            <div className="rounded-xl px-3 py-2 text-center flex-shrink-0 min-w-[52px]
                          bg-base-100 dark:bg-zinc-900 border border-base-300  dark:border-zinc-800">
              <div className="text-2xl font-black text-auxillary leading-none">
                {date.getDate()}
              </div>
              <div className="text-[10px] uppercase tracking-widest mt-0.5
                            text-slate-400 dark:text-slate-500">
                {MONTHS[date.getMonth()].slice(0, 3)}
              </div>
            </div>
          </div>
        </div>

        <div className="flex flex-row justify-around text-center">
          <div>
            <p className="text-base-content text-xl font-bold capitalize">
              {ev.photography_type}
            </p>
            <p className="text-[11px] font-mono mt-0.5 text-core">
              {ev.event_code}
            </p>
          </div>
        </div>

        {/* info grid — always 2 cols, no breakpoint switches that cause shrink */}
        <div className="grid grid-cols-2 gap-x-2 gap-y-3 mt-4">
          {[
            [<AiOutlineUser />, "Client", ev.client_name],
            [<FiPhoneCall />, "Phone", ev.client_phone],
            [<MdAccessTime />, "Time", ev.event_time?.slice(0, 5)],
            [<CiLocationOn />, "Venue", ev.location],
          ].map(([icon, k, v]) => v ? (
            <div key={k} className="flex items-center min-w-0">
              <span className="text-xl mr-1 flex-shrink-0">{icon}</span>
              <p className="text-base-content text-sm truncate">{v}</p>
            </div>
          ) : null)}
        </div>

      </div>
    </div>
  );
}