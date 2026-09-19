import React, { useState, useEffect, useRef } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { FaHome } from "react-icons/fa";
import { IoIosPeople } from "react-icons/io";
import { FaUserFriends } from "react-icons/fa";
import { BsCashCoin, BsFillPinFill } from "react-icons/bs";
import { TbListDetails } from "react-icons/tb";
import { TiCamera } from "react-icons/ti";
import { FaChartLine } from "react-icons/fa6";
import { MdOutlineAutoAwesome } from "react-icons/md";
import { FiMenu, FiX, FiChevronDown, FiUser, FiLogOut, FiMonitor } from "react-icons/fi";
import { TbLayoutSidebarLeftExpand, TbLayoutSidebarLeftCollapse } from "react-icons/tb"; // ← NEW
import { FaWpforms } from "react-icons/fa6";
import ThemeToggle from './ThemeToggle';
import Toast from "./Toast";
import EditModal from "./EditModal";
import SessionModal from "./Sessionmodal";
import Avatar from "./Avatar";
import { IoImagesOutline } from "react-icons/io5";

const NAV_ITEMS = (role) => [
  { label: "Home",        icon: <FaHome />,              path: "/",           show: true },
  { label: "Analytics",   icon: <FaChartLine />,         path: "/AdminDashboard", show: role === "ADMIN" },
  {
    label: "Manage", icon: <TbListDetails />, show: true, children: [
      { label: "Clients",   icon: <IoIosPeople />,   path: "/clients",   show: true },
      { label: "Events",    icon: <TiCamera />,      path: "/events",    show: true },
      { label: "Staff", icon: <FaUserFriends />, path: "/staff", show: role === "ADMIN" },
    ]
  },
  { label: "Bookings",    icon: <FaWpforms />,           path: "/bookings",       show: true },
  { label: "Gallery",     icon: <IoImagesOutline />,     path: "/gallery",        show: true },
  { label: "Payments",    icon: <BsCashCoin />,          path: "/payments",       show: role === "ADMIN" },
  { label: "Integration", icon: <MdOutlineAutoAwesome />,path: "/Settings",       show: role === "ADMIN" },
];

function Tooltip({ label, children }) {
  return (
    <div className="relative group/tip flex items-center justify-center">
      {children}
      <span className="
        absolute left-full ml-3 px-2.5 py-1 rounded-lg text-[11px] font-medium tracking-wide
        bg-gray-800/90 dark:bg-black/80 backdrop-blur-md text-white whitespace-nowrap
        pointer-events-none opacity-0 scale-95
        group-hover/tip:opacity-100 group-hover/tip:scale-100
        transition-all duration-150 z-[100]
        shadow-lg shadow-black/20
      ">
        {label}
      </span>
    </div>
  );
}

function NavItem({ item, expanded, navigate, isActive }) {
  const [open, setOpen] = useState(false);
  const hasChildren = item.children?.filter(c => c.show).length > 0;
  const active = item.path ? isActive(item.path) : false;

  if (!item.show) return null;

  if (hasChildren) {
    return (
      <div>
        <button
          onClick={() => expanded && setOpen(o => !o)}
          className={`
            relative flex items-center w-full
            ${expanded ? "px-3 py-2 gap-3" : "px-0 py-2.5 justify-center"}
            rounded-xl text-[15px] font-medium transition-all duration-200 select-none
            ${open && expanded
              ? "text-core/80"
              : "text-gray-700 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white hover:bg-black/[0.04] dark:hover:bg-white/[0.06]"
            }
          `}
        >
          {!expanded
            ? <Tooltip label={item.label}><span className="text-[18px] flex-shrink-0 opacity-75">{item.icon}</span></Tooltip>
            : <span className="text-[18px] flex-shrink-0 opacity-75">{item.icon}</span>
          }
          {expanded && (
            <>
              <span className="flex-1 text-left">{item.label}</span>
              <FiChevronDown className={`w-3.5 h-3.5 opacity-50 transition-transform duration-200 ${open ? "rotate-180" : ""}`} />
            </>
          )}
        </button>
        <div className={`overflow-hidden transition-all duration-250 ${open && expanded ? "max-h-52 opacity-100" : "max-h-0 opacity-0"}`}>
          <div className="ml-3 mt-0.5 pl-3 border-l border-gray-200 dark:border-white/10 space-y-0.5">
            {item.children.filter(c => c.show).map(child => (
              <NavItem key={child.label} item={child} expanded={expanded} navigate={navigate} isActive={isActive} />
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <button
      onClick={() => navigate(item.path)}
      className={`
        relative flex items-center w-full select-none text-md
        ${expanded ? "px-3 py-2 gap-3" : "px-0 py-2.5 justify-center"}
        rounded-xl  font-medium transition-all duration-200 ease-out
        ${active
          ? "bg-core text-white shadow-sm shadow-core/30"
          : "text-gray-700 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white hover:bg-black/[0.04] dark:hover:bg-white/[0.06]"
        }
      `}
    >
      {!expanded
        ? <Tooltip label={item.label}><span className={`text-[18px] flex-shrink-0 ${active ? "" : "opacity-75"}`}>{item.icon}</span></Tooltip>
        : <span className={`text-[18px] flex-shrink-0 ${active ? "" : "opacity-75"}`}>{item.icon}</span>
      }
      {expanded && <span>{item.label}</span>}
    </button>
  );
}

// ─── Sidebar ────────────────────────────────────────────────────────────────
// NEW: accepts `pinned` and `setPinned`
function Sidebar({ role, navigate, isActive, mobileOpen, setMobileOpen, hovered, setHovered, pinned, setPinned }) {
  const isMobile = typeof window !== "undefined" && window.innerWidth < 768;
  const expanded = isMobile ? true : pinned || hovered; // ← NEW: pinned keeps it open
  const items = NAV_ITEMS(role);

  return (
    <>
      {mobileOpen && (
        <div
          className="fixed inset-0 bg-black/30 backdrop-blur-sm z-40 md:hidden"
          onClick={() => setMobileOpen(false)}
        />
      )}

      <aside
        onMouseEnter={() => !pinned && setHovered(true)}   // ← skip hover when pinned
        onMouseLeave={() => !pinned && setHovered(false)}  // ← skip hover when pinned
        className={`
          fixed top-0 left-0 h-full z-50 flex flex-col
          bg-white/90 dark:bg-[#1c1c1e]/90
          backdrop-blur-2xl
          border-r border-black/[0.06] dark:border-white/[0.06]
          transition-all duration-300 ease-in-out overflow-hidden
          ${mobileOpen ? "translate-x-0" : "-translate-x-full"}
          md:translate-x-0
          ${expanded ? "w-[220px]" : "w-[64px]"}
        `}
        style={{ boxShadow: "0 0 0 0.5px rgba(0,0,0,0.08)" }}
      >
        {/* Logo + Pin button */}
        <div className={`flex items-center h-[60px] flex-shrink-0 px-3.5 ${expanded ? "gap-3" : "justify-center"}`}>
          <div className="w-14 h-12 rounded-[10px] flex items-center justify-center shadow-sm flex-shrink-0">
            {/* <TiCamera className="dark:text-white text-black text-xl" /> */}
            <img src="./logo.png" />
          </div>

          {expanded && (
            <div className="overflow-hidden leading-tight flex-1">
              <p
                className="text-[14px] font-semibold text-gray-900 dark:text-white tracking-tight whitespace-nowrap"
              >
                Photography
              </p>
              <p
                className="text-[8px] text-gray-400 dark:text-gray-500 whitespace-nowrap tracking-wide"
              >
               Studio Management
              </p>
            </div>
          )}

          {/* ── PIN BUTTON (desktop only) ── */}
          {expanded && (
            <button
              onClick={() => setPinned(p => !p)}
              title={pinned ? "Unpin sidebar" : "Pin sidebar"}
              className={`
                hidden md:flex items-center justify-center w-7 h-7 rounded-lg
                transition-all duration-150 flex-shrink-0
                ${pinned
                  ? "bg-core/10 text-core"
                  : "text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 hover:bg-black/[0.04] dark:hover:bg-white/[0.06]"
                }
              `}
            >
              {pinned
                ? <BsFillPinFill className="w-4 h-4" />
                : <BsFillPinFill className="w-4 h-4" />
              }
            </button>
          )}

          {/* Mobile close button */}
          <button
            className="ml-auto md:hidden text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors"
            onClick={() => setMobileOpen(false)}
          >
            <FiX className="w-4 h-4 text-red-500" />
          </button>
        </div>

        {/* Divider */}
        <div className="mx-3 border-t border-black/[0.06] dark:border-white/[0.06]" />

        {/* Nav */}
        <nav className="flex-1 overflow-y-auto overflow-x-hidden p-2 space-y-0.5 mt-1">
          {items.map(item => (
            <NavItem
              key={item.label}
              item={item}
              expanded={expanded}
              navigate={(path) => { navigate(path); setMobileOpen(false); }}
              isActive={isActive}
            />
          ))}
        </nav>

        {/* Collapsed dot */}
        {/* {!expanded && (
          <div className="py-4 flex justify-center">
            <div className="w-1 h-1 rounded-full bg-gray-300 dark:bg-gray-600" />
          </div>
        )} */}
      </aside>
    </>
  );
}

/* ─── Profile Dropdown ──────────────────────────────────── */
function ProfileDropdown({ name, Gmail, role, profile, loggingOut, handleLogout, setEditModal, setShowSessions }) {
  const [open, setOpen] = useState(false);
  const ref = useRef();

  useEffect(() => {
    const handler = (e) => { if (ref.current && !ref.current.contains(e.target)) setOpen(false); };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  const initials = name?.slice(0, 2)?.toUpperCase() || "??";

  return (
    <div ref={ref} className="relative">
      <button
        onClick={(e) => { e.stopPropagation(); setOpen((o) => !o); }}
        className={`hover:opacity-70 transition-all duration-150 cursor-pointer ${profile ? "mt-1.5" : "mt-0"}`}
      >
        <div className={`p-[2px] rounded-full ${role === "ADMIN" ? "bg-gradient-to-tr from-yellow-400 via-red-500 to-purple-600" : "bg-lime-400"}`}>
          <div className="p-[2px] rounded-full bg-white dark:bg-zinc-900">
            {console.log(profile)}
            
            {profile ? (
              <Avatar src={profile} name={name} rounded="rounded-full" size="h-11 w-11" />
            ) : (
              <div className="w-11 h-11 rounded-full bg-blue-500 text-white flex items-center justify-center text-2xl font-semibold">
                {initials}
              </div>
            )}
          </div>
        </div>
      </button>

      {open && (
        <div className="absolute right-0 top-full mt-2 w-60
          bg-white/95 dark:bg-zinc-900/95 backdrop-blur-3xl
          rounded-2xl border border-black/[0.06] dark:border-white/[0.06]
          shadow-xl shadow-black/10 dark:shadow-black/40
          overflow-hidden z-50"
        >
          <div className="p-2 flex items-center gap-3 border-b border-black/[0.06] dark:border-white/[0.06]">
            {profile
              ? <Avatar src={profile} name={name} rounded="rounded-xl" size="h-18 w-20" />
              : (
                <div className="w-18 h-18 rounded-xl bg-blue-500 text-white flex items-center justify-center text-sm font-semibold shadow-sm">
                  {initials}
                </div>
              )
            }
            <div className="min-w-0">
              <p className="text-md font-semibold text-gray-900 dark:text-white tracking-tight truncate">{name}</p>
              <p className="text-xs text-gray-500 dark:text-gray-400 truncate">{Gmail}</p>
            </div>
          </div>

          <div className="p-1.5 space-y-0.5">
            <DropMenuItem icon={<FiUser className="w-4 h-4" />} label="Edit Profile" badge={!profile ? "New" : null} onClick={() => { setEditModal(true); setOpen(false); }} />
            <DropMenuItem icon={<FiMonitor className="w-4 h-4" />} label="Sessions" onClick={() => { setShowSessions(true); setOpen(false); }} />
            <div><ThemeToggle /></div>
          </div>

          <div className="mx-3 border-t border-black/[0.06] dark:border-white/[0.06]" />

          <div className="p-1.5">
            <button
              onClick={handleLogout}
              disabled={loggingOut}
              className={`flex items-center gap-2.5 w-full px-3 py-2 rounded-xl text-[13px] font-medium
                text-red-500 transition-all duration-150
                ${loggingOut ? "opacity-50 cursor-not-allowed" : "hover:bg-red-500/[0.08]"}`}
            >
              {loggingOut
                ? <div className="w-4 h-4 border-2 border-red-500 border-t-transparent rounded-full animate-spin" />
                : <FiLogOut className="w-4 h-4" />
              }
              {loggingOut ? "Signing Out..." : "Sign Out"}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

function DropMenuItem({ icon, label, badge, onClick }) {
  return (
    <button
      onClick={onClick}
      className="flex items-center gap-2.5 w-full px-3 py-2 rounded-xl text-[13px] font-medium
        text-gray-700 dark:text-gray-200 hover:bg-black/[0.04] dark:hover:bg-white/[0.06]
        transition-all duration-150"
    >
      <span className="text-gray-400 dark:text-gray-500">{icon}</span>
      {label}
      {badge && (
        <span className="ml-auto text-[10px] font-semibold bg-blue-500/10 text-blue-500 dark:text-blue-400 px-2 py-0.5 rounded-full tracking-wide">
          {badge}
        </span>
      )}
    </button>
  );
}

/* ─── Main Navbar ───────────────────────────────────────── */
export default function Navbar({ children }) {
  const { role, name, Gmail, profile, phone, userID, logout, updateProfileDetail } = useAuth();
  const [loggingOut, setLoggingOut] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();
  const [editModal, setEditModal] = useState(false);
  const [showSessions, setShowSessions] = useState(false);
  const [toast, setToast] = useState(null);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [hovered, setHovered] = useState(false);

  // ── NEW: pin state, persisted to localStorage ──
  const [pinned, setPinned] = useState(() => {
    try { return localStorage.getItem("sidebar-pinned") === "true"; }
    catch { return false; }
  });

  useEffect(() => {
    try { localStorage.setItem("sidebar-pinned", pinned); }
    catch {}
  }, [pinned]);
  // ────────────────────────────────────────────────

  const [isMobile, setIsMobile] = useState(
    typeof window !== "undefined" && window.innerWidth < 768
  );

  useEffect(() => {
    const handler = () => setIsMobile(window.innerWidth < 768);
    window.addEventListener("resize", handler);
    return () => window.removeEventListener("resize", handler);
  }, []);

  const isActive = (path) =>
    path === "/" ? location.pathname === "/" : location.pathname.startsWith(path);

  const handleLogout = async () => { setLoggingOut(true); await logout(); setLoggingOut(false); navigate("/login"); };

  // ── NEW: sidebarWidth respects pinned ──
  const sidebarWidth = isMobile ? 0 : (pinned || hovered) ? 220 : 64;
const notice =
  "⚠️ This is a demo site. Some features may be limited, unavailable, or may not function as expected and some data has error.";

const tickerItems = Array.from({ length: 4 });

  return (
    <>
      <div className="z-[999] w-full overflow-hidden whitespace-nowrap bg-red-600">
    <div className="flex w-max animate-marquee">
      {tickerItems.map((_, index) => (
        <div key={index} className="flex shrink-0">
          <span className="px-8 text-xs text-white">
            {notice}
          </span>
        </div>
      ))}
    </div>
  </div>
    {/* <p>This is a demo site. Some features may be limited, unavailable, or may not function as expected.</p> */}
      {toast && <Toast msg={toast.msg} color={toast.color} />}

      <div className="flex min-h-screen bg-[#f5f5f7] dark:bg-[#000000]">
        
        <Sidebar
          role={role}
          navigate={navigate}
          isActive={isActive}
          mobileOpen={mobileOpen}
          setMobileOpen={setMobileOpen}
          hovered={hovered}
          setHovered={setHovered}
          pinned={pinned}          // ← NEW
          setPinned={setPinned}    // ← NEW
        />

        <div
          className="flex flex-col flex-1 min-w-0 transition-all duration-300 ease-in-out"
          style={{ marginLeft: sidebarWidth }}
        >
          <header
            className="sticky top-0 z-30 flex items-center px-4 sm:px-5
              bg-white/80 dark:bg-[#1c1c1e]/80 backdrop-blur-2xl h-15
              border-b border-black/[0.06] dark:border-white/[0.06]"
            style={{ boxShadow: "0 0.5px 0 rgba(0,0,0,0.08)" }}
          >
            <button
              onClick={() => setMobileOpen(true)}
              className="md:hidden flex items-center justify-center w-8 h-8 rounded-xl
                hover:bg-black/[0.04] dark:hover:bg-white/[0.06] transition-colors mr-2"
            >
              <FiMenu className="w-4 h-4 text-gray-600 dark:text-gray-400" />
            </button>

            <div className="flex-1 flex justify-center">
              <h1 className="text-lg lg:text-xl font-bold select-none"> <span className="text-core">Photography</span> Studio <span className="hidden md:inline">Management</span></h1>
            </div>

            <ProfileDropdown
              name={name} Gmail={Gmail} role={role} profile={profile}
              loggingOut={loggingOut} handleLogout={handleLogout}
              setEditModal={setEditModal} setShowSessions={setShowSessions}
            />
          </header>

          <main>{children}</main>
        </div>
      </div>

      <style>{`
        @keyframes appleDropdown {
          from { opacity: 0; transform: scale(0.95) translateY(-4px); }
          to   { opacity: 1; transform: scale(1) translateY(0); }
        }
      `}</style>

      {editModal && (
        <EditModal
          setEditModal={setEditModal} id={userID}
          updateProfileDetail={updateProfileDetail}
          setToast={setToast} profile={profile}
          name={name} phone={phone}
        />
      )}
      {showSessions && <SessionModal userId={userID} onClose={() => setShowSessions(false)} />}
    </>
  );
}