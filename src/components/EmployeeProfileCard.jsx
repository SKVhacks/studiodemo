import { useState, useEffect } from "react";
import { DeviceList, DeleteDevice } from "../api/EmployeeServices";
import { IoLogoWindows } from "react-icons/io5";
import { FaApple, FaPhoneAlt } from "react-icons/fa";
import { SiMacos } from "react-icons/si";
import { BsAndroid2 } from "react-icons/bs";
import { FcLinux } from "react-icons/fc";
import { MdOutlineQuestionMark, MdClose } from "react-icons/md";
import { ImWhatsapp } from "react-icons/im";
import { FiMail } from "react-icons/fi";

// ── Device Type Icons ─────────────────────────────────────────────────────────

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

// ── Helpers ───────────────────────────────────────────────────────────────────

function getOsIcon(os = "", deviceType = "") {
  const o = os.toLowerCase();
  if (o.includes("windows")) return <IoLogoWindows className="text-3xl text-blue-500" />;
  if (o.includes("android")) return <BsAndroid2 className="text-3xl text-lime-500" />;
  if (o.includes("ios") || (o.includes("mac") && deviceType === "Tablet"))
    return <FaApple className="text-3xl" />;
  if (o.includes("mac")) return <SiMacos className="text-4xl" />;
  if (o.includes("linux")) return <FcLinux className="text-4xl" />;
  return <MdOutlineQuestionMark className="text-2xl" />;
}

function getDeviceIcon(deviceType = "") {
  if (deviceType === "Mobile") return <MobileIcon />;
  if (deviceType === "Tablet") return <TabletIcon />;
  return <PCIcon />;
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

// ── Session Card ──────────────────────────────────────────────────────────────

function SessionCard({ session: s, revoking, onRevoke }) {
  return (
    <div
      className={[
        "flex items-center gap-3 p-3 rounded-2xl transition-all duration-200",
        s.is_current
          ? "border-2 border-blue-500 bg-blue-50/60 dark:bg-blue-500/10"
          : "border border-gray-100 dark:border-gray-800 bg-white dark:bg-white/5 hover:bg-gray-50 dark:hover:bg-white/10",
        revoking ? "opacity-40 pointer-events-none" : "opacity-100",
      ].join(" ")}
    >
      {/* OS icon */}
      <div className="w-11 h-11 rounded-xl bg-gray-100 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 flex items-center justify-center shrink-0">
        {getOsIcon(s.os, s.device_type)}
      </div>

      {/* Info */}
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 mb-0.5 flex-wrap">
          <span className="text-sm font-semibold text-gray-900 dark:text-gray-100 truncate">
            {s.device_name || s.os}
          </span>
          {s.is_current && (
            <span className="shrink-0 bg-blue-500 text-white text-[10px] font-medium px-2 py-0.5 rounded-full">
              This device
            </span>
          )}
        </div>

        <div className="flex items-center gap-1 text-[11px] text-gray-500 dark:text-gray-400 mb-0.5 flex-wrap">
          <span className="flex items-center text-gray-400 dark:text-gray-500">
            {getDeviceIcon(s.device_type)}
          </span>
          <span>
            {s.browser} {s.browser_version?.split(".")[0]}
          </span>
          <span className="text-gray-300 dark:text-gray-600">·</span>
          <span className="truncate">
            {s.os} {s.os_version}
          </span>
        </div>

        <p className="text-[11px] text-gray-400 dark:text-gray-500 truncate">
          {s.ip && <span>{s.ip} · </span>}
          {timeAgo(s.login_time)}
        </p>
      </div>

      {/* Revoke button — hidden for current device */}
      {!s.is_current && (
        <button
          onClick={onRevoke}
          disabled={revoking}
          className="shrink-0 text-xs font-medium bg-rose-500 hover:bg-rose-600 active:scale-95 text-white border-none px-3 py-1.5 rounded-lg transition-all duration-150 disabled:cursor-not-allowed disabled:opacity-60"
        >
          {revoking ? (
            <svg
              className="animate-spin w-3.5 h-3.5"
              viewBox="0 0 24 24"
              fill="none"
            >
              <circle
                cx="12"
                cy="12"
                r="10"
                stroke="currentColor"
                strokeWidth="3"
                strokeDasharray="31"
                strokeDashoffset="10"
                strokeLinecap="round"
              />
            </svg>
          ) : (
            "Revoke"
          )}
        </button>
      )}
    </div>
  );
}

// ── Session Modal ─────────────────────────────────────────────────────────────

function SessionModal({ userId }) {
  const [sessions, setSessions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [revoking, setRevoking] = useState(null);

  useEffect(() => {
    if (!userId) return;
    const fetchData = async () => {
      setLoading(true);
      try {
        const res = await DeviceList(userId);
        setSessions(res.data);
      } catch (err) {
        console.error("Failed to fetch sessions:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [userId]);

  const handleRevoke = async (sessionId) => {
    if (!window.confirm("Revoke this session? That device will be signed out.")) return;
    setRevoking(sessionId);
    try {
      await DeleteDevice(sessionId);
      setSessions((prev) => prev.filter((s) => s.session_id !== sessionId));
    } catch (err) {
      console.error("Failed to revoke session:", err);
    } finally {
      setRevoking(null);
    }
  };

  return (
    <div className="w-full sm:w-[380px] rounded-3xl bg-white/80 dark:bg-zinc-900/80 backdrop-blur-2xl border border-white/20 dark:border-white/10 shadow-[0_25px_80px_rgba(0,0,0,0.25)] overflow-hidden">
      {/* Header */}
      <div className="flex items-start justify-between px-5 pt-5 pb-3">
        <div>
          <h2 className="text-lg font-semibold tracking-tight text-gray-900 dark:text-gray-100">
            Active Sessions
          </h2>
          <p className="text-xs text-gray-400 dark:text-gray-500 mt-0.5">
            {loading
              ? "Loading devices..."
              : `${sessions.length} device${sessions.length !== 1 ? "s" : ""} signed in`}
          </p>
        </div>
      </div>

      {/* List — on mobile no fixed max-h so content flows naturally inside the scrollable overlay */}
      <div className="px-3 pb-4 flex flex-col gap-2 overflow-y-auto max-h-[50vh] sm:max-h-[400px]">
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
    </div>
  );
}

// ── Employee Profile Card ─────────────────────────────────────────────────────

export default function EmployeeProfileCard({
  employee,
  onClose,
  onWhatsApp,
  onCall,
  onEmail,
}) {
  if (!employee) return null;

  const handleWhatsApp = () => {
    if (onWhatsApp) onWhatsApp(employee);
  };

  const handleCall = () => {
    if (onCall) onCall(employee);
  };

  const handleEmail = () => {
    if (onEmail) onEmail(employee);
  };

  return (
    <div
      className="fixed inset-0 z-[99] overflow-y-auto bg-black/40 backdrop-blur-xl"
      onClick={onClose}
    >
      {/* Inner centering wrapper */}
      <div className="min-h-full w-full flex flex-col md:flex-row items-center justify-center gap-4 p-6 py-10">

        {/* Profile Photo Card */}
        <div
          onClick={(e) => e.stopPropagation()}
          className="relative w-[300px] h-[440px] rounded-[28px] overflow-hidden shadow-2xl shrink-0"
        >
          {/* Background image */}
          <img
            src={employee.picture}
            alt={employee.full_name}
            className="absolute inset-0 w-full h-full object-cover"
          />

          {/* Close button */}
          <button
            onClick={onClose}
            className="absolute top-3 right-3 z-20 w-7 h-7 rounded-full bg-black/30 flex items-center justify-center text-white hover:bg-black/50 transition"
          >
            <MdClose size={14} />
          </button>

          {/* Bottom glass overlay */}
          <div className="absolute bottom-0 w-full h-[52%] flex flex-col justify-end px-6 pb-6 text-center overflow-hidden">
            {/* Gradient fade */}
            <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-black/20 to-transparent" />
            {/* Progressive blur */}
            <div
              className="absolute inset-0 backdrop-blur-[10px]"
              style={{
                maskImage: "linear-gradient(to top, black 60%, transparent 100%)",
                WebkitMaskImage: "linear-gradient(to top, black 60%, transparent 100%)",
              }}
            />

            {/* Content */}
            <div className="relative z-10">
              <h2 className="text-white text-lg font-semibold drop-shadow">
                {employee.full_name}
              </h2>
              <p className="text-white/70 text-xs mt-1 mb-5">
                {new Date(employee.created_at).toLocaleDateString("en-US", {
                  year: "numeric",
                  month: "short",
                  day: "numeric",
                })}{" "}
                · EMP-{String(employee.id).padStart(3, "0")}
              </p>

              <div className="flex justify-center gap-3">
                <button
                  onClick={handleWhatsApp}
                  title="WhatsApp"
                  className="w-10 h-10 rounded-full bg-white/90 hover:bg-white text-gray-800 flex items-center justify-center shadow-md hover:scale-105 active:scale-95 transition-transform"
                >
                  <ImWhatsapp size={16} className="text-green-500" />
                </button>
                <button
                  onClick={handleCall}
                  title="Call"
                  className="w-10 h-10 rounded-full bg-white/90 hover:bg-white text-gray-800 flex items-center justify-center shadow-md hover:scale-105 active:scale-95 transition-transform"
                >
                  <FaPhoneAlt size={14} className="text-blue-500" />
                </button>
                <button
                  onClick={handleEmail}
                  title="Email"
                  className="w-10 h-10 rounded-full bg-white/90 hover:bg-white text-gray-800 flex items-center justify-center shadow-md hover:scale-105 active:scale-95 transition-transform"
                >
                  <FiMail size={16} className="text-gray-700" />
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Session Modal */}
        <div onClick={(e) => e.stopPropagation()}>
          <SessionModal userId={employee.id} />
        </div>

      </div>{/* end inner centering wrapper */}
    </div>
  );
}