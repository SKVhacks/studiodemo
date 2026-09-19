import { useState, useEffect } from "react";
import { DeviceList, DeleteDevice } from "../api/EmployeeServices";
import { IoLogoWindows } from "react-icons/io5";
import { FaApple } from "react-icons/fa";
import { SiMacos } from "react-icons/si";
import { BsAndroid2 } from "react-icons/bs";
import { FcLinux } from "react-icons/fc";
import { MdOutlineQuestionMark } from "react-icons/md";


const PCIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
    <rect x="2" y="3" width="20" height="14" rx="2" stroke="currentColor" strokeWidth="1.5" />
    <path d="M8 21h8M12 17v4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
  </svg>
);

const MobileIcon = () => (
  <svg width="18" height="20" viewBox="0 0 24 24" fill="none">
    <rect x="7" y="2" width="10" height="20" rx="2" stroke="currentColor" strokeWidth="1.5" />
    <circle cx="12" cy="18.5" r="1" fill="currentColor" />
  </svg>
);

const TabletIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
    <rect x="4" y="2" width="16" height="20" rx="2" stroke="currentColor" strokeWidth="1.5" />
    <circle cx="12" cy="18.5" r="1" fill="currentColor" />
  </svg>
);

// ── Helpers ──────────────────────────────────────────────────────────────────

function getOsIcon(os = "", deviceType = "") {
  const o = os.toLowerCase();
  if (o.includes("windows")) return <IoLogoWindows className="text-3xl text-blue-500" />;
  if (o.includes("android")) return <BsAndroid2  className="text-3xl text-lime-500"/>;
  if (o.includes("ios") || (o.includes("mac") && deviceType === "Tablet")) return <FaApple className="text-3xl" />;
  if (o.includes("mac")) return <SiMacos className="text-4xl" />;
  if (o.includes("linux")) return <FcLinux className="text-4xl"/>;
  return <MdOutlineQuestionMark className="text-2xl"/>;
}

function getDeviceIcon(deviceType = "") {
  if (deviceType === "Mobile") return <MobileIcon />;
  if (deviceType === "Tablet") return <TabletIcon />;
  return <PCIcon />;
}

function getOsAccent(os = "") {
  const o = os.toLowerCase();
  if (o.includes("windows"))
    return " border-none";
  if (o.includes("android"))
    return "border-none";
  if (o.includes("ios") || o.includes("mac"))
    return "border-none";
  if (o.includes("linux"))
    return "border-none";
  return "border-none";
}

function timeAgo(dateStr) {
  const diff = Date.now() - new Date(dateStr).getTime();
  const m = Math.floor(diff / 60000);
  if (m < 1) return "just now";
  if (m < 60) return `${m}m ago`;
  const h = Math.floor(m / 60);
  if (h < 24) return `${h}h ago`;
  return `${Math.floor(h / 24)}d ago`;
}

// ── Skeleton ──────────────────────────────────────────────────────────────────

function SkeletonCard() {
  return (
    <div className="flex items-center gap-3 p-3 rounded-2xl border border-gray-100 dark:border-gray-800 animate-pulse">
      <div className="w-11 h-11 rounded-xl bg-gray-200 dark:bg-gray-700 shrink-0" />
      <div className="flex-1 space-y-2">
        <div className="h-3.5 w-28 rounded-full bg-gray-200 dark:bg-gray-700" />
        <div className="h-3 w-44 rounded-full bg-gray-100 dark:bg-gray-800" />
        <div className="h-2.5 w-20 rounded-full bg-gray-100 dark:bg-gray-800" />
      </div>
      <div className="h-7 w-14 rounded-lg bg-gray-100 dark:bg-gray-800" />
    </div>
  );
}

// ── Session Card ─────────────────────────────────────────────────────────────

function SessionCard({ session: s, revoking, onRevoke }) {
  return (
    <div
      className={[
        "flex items-center gap-3 p-3 rounded-2xl transition-all duration-200",
        s.is_current
          ? "border-2 border-blue-500 bg-white dark:bg-white/5"
          : "border border-gray-100 bg-white dark:bg-white/10  hover:bg-gray-50/80 dark:border-gray-800  dark:hover:bg-gray-800/50",
        revoking ? "opacity-40" : "opacity-100",
      ].join(" ")}
    >
      {/* OS icon */}
      <div className={`w-15 h-15 rounded-xl border flex items-center justify-center shrink-0 ${getOsAccent(s.os)}`}>
        {getOsIcon(s.os, s.device_type)}
      </div>

      {/* Info */}
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 mb-0.5 flex-wrap">
          <span className="text-sm font-semibold text-gray-900 dark:text-gray-100 truncate">
            {s.device_name || s.os}
          </span>
          {s.is_current && (
            <span 
            // className="shrink-0 text-[10px] font-medium bg-blue-100 text-blue-600 dark:bg-blue-900/50 dark:text-blue-300 px-2 py-0.5 rounded-full"
            className="bg-blue-500 px-3 py-1 rounded-full text-xs md:text-sm text-white"
            >
              This device
            </span>
          )}
        </div>

        <div className="flex items-center gap-1 text-[11px] text-gray-500 dark:text-gray-400 mb-0.5 flex-wrap">
          <span className="text-gray-400 dark:text-gray-500 flex items-center">
            {getDeviceIcon(s.device_type)}
          </span>
          <span>{s.browser} {s.browser_version?.split(".")[0]}</span>
          <span className="text-gray-300 dark:text-gray-600">·</span>
          <span className="truncate">{s.os} {s.os_version}</span>
        </div>

        <p className="text-[11px] text-gray-400 dark:text-gray-500 truncate">
          {s.ip && <span>{s.ip} · </span>}
          {timeAgo(s.login_time)}
        </p>
      </div>

      {/* Revoke */}
      {!s.is_current && (
        <button
          onClick={onRevoke}
          disabled={revoking}
          className="
            shrink-0 text-xs font-medium
            bg-rose-500
            text-white
            border-none
            hover:scale-105
            active:scale-95
            px-3 py-1.5 rounded-lg
            transition-all duration-150
            disabled:cursor-not-allowed disabled:opacity-60
          "
        >
          {revoking ? (
            <svg className="animate-spin w-3.5 h-3.5 text-rose-500" viewBox="0 0 24 24" fill="none">
              <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="3" strokeDasharray="31" strokeDashoffset="10" strokeLinecap="round" />
            </svg>
          ) : "Revoke"}
        </button>
      )}
    </div>
  );
}

// ── Main Component ────────────────────────────────────────────────────────────

export default function SessionModal({ userId, onClose }) {
  const [sessions, setSessions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [revoking, setRevoking] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const res = await DeviceList(userId);
        setSessions(res.data);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [userId]);

  const handleRevoke = async (sessionId) => {
    if (!window.confirm("Revoke this session? That device will be logged out.")) return;
    setRevoking(sessionId);
    try {
      await DeleteDevice(sessionId);
      setSessions((prev) => prev.filter((s) => s.session_id !== sessionId));
    } catch (err) {
      console.error(err);
    } finally {
      setRevoking(null);
    }
  };

  return (
    <div
      className="fixed inset-0 z-40 flex items-end sm:items-center justify-center sm:p-4 bg-black/50 backdrop-blur-sm"
      onClick={(e) => e.target === e.currentTarget && onClose()}
    >
      <div className="container
        w-full sm:max-w-lg z-50
       rounded-t-3xl sm:rounded-3xl p-2
      bg-white/80 dark:bg-zinc-900/80
      backdrop-blur-2xl
      border border-white/20
      shadow-[0_25px_80px_rgba(0,0,0,0.25)]
        overflow-hidden
      ">

     
        <div className="flex items-start justify-between px-5 pt-4 sm:pt-5 pb-3">
          <div>
            <h2 className="text-xl font-semibold tracking-tight text-gray-900 dark:text-gray-100">
              Active Sessions
            </h2>
            <p className="text-xs text-gray-400 dark:text-gray-500 mt-0.5">
              {loading
                ? "Loading devices..."
                : `${sessions.length} device${sessions.length !== 1 ? "s" : ""} signed in`}
            </p>
          </div>

          <button
            onClick={onClose}
            className="
              w-7 h-7 rounded-full
              bg-gray-100 dark:bg-gray-800
              hover:bg-red-500 dark:hover:bg-red-700 hover:text-white
              flex items-center justify-center
              text-red-500 dark:text-red-400
              transition-colors duration-150 active:scale-95
              text-xs font-medium
            "
          >
            ✕
          </button>
        </div>

        {/* List */}
        <div className="px-3 py-3 flex flex-col gap-2 overflow-y-auto max-h-[58vh] sm:max-h-[400px]">
          {loading ? (
            <>
              <SkeletonCard />
              <SkeletonCard />
              <SkeletonCard />
            </>
          ) : sessions.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 gap-2 text-gray-400 dark:text-gray-500">
              <PCIcon />
              <p className="text-sm">No active sessions found</p>
            </div>
          ) : (
            sessions.map((s) => (
              <SessionCard
                key={s.session_id}
                session={s}
                revoking={revoking === s.session_id}
                onRevoke={() => handleRevoke(s.session_id)}
              />
            ))
          )}
        </div>

        {/* Footer note */}
        {!loading && sessions.length > 0 && (
          <div className="px-5 py-3 border-t border-gray-100 dark:border-gray-800">
            <p className="text-[11px] text-center text-gray-400 dark:text-gray-500">
              Revoking a session immediately logs out that device
            </p>
          </div>
        )}

      </div>
    </div>
  );
}