import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { GetBookings, DeclineBooking } from "../../api/BookingServices";
import AcceptBookingModal from "./AcceptBookingModal";
import Toast from "../../components/Toast";
import { MdEvent } from "react-icons/md";
import { RiArrowRightUpLine } from "react-icons/ri";

const ViewAllBookings = () => {
    const navigate = useNavigate();
    const [bookings, setBookings] = useState([]);
    const [toast, setToast] = useState(null);
    const [selectedBooking, setSelected] = useState(null);
    const [decliningId, setDecliningId] = useState(null);
    const [bookingsLoading, setBookingsLoading] = useState(false); // for table loading state
    const showToast = (msg, color) => {
        setToast({ msg, color });
        setTimeout(() => setToast(null), 5000);
    };

    const fetchBookings = async () => {
        try {
            setBookingsLoading(true);
            const res = await GetBookings({ status: "pending" });
            setBookings(res.data);
        } catch {
            showToast("Failed to load bookings", "alert-error");
        } finally {
            setBookingsLoading(false);
        }
    };

    useEffect(() => {
        fetchBookings();
    }, []);

    const handleDecline = async (id) => {
        if (!window.confirm("Decline this booking? This cannot be undone.")) return;
        setDecliningId(id);
        try {
            setBookingsLoading(true);
            await DeclineBooking(id);
            showToast("Booking declined and removed.", "alert-warning");
            fetchBookings();
        } catch {
            showToast("Failed to decline booking", "alert-error");
        } finally {
            setDecliningId(null);
            setBookingsLoading(false);
        }
    };

    const fmtDate = (d) =>
        d ? new Date(d).toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" }) : "—";

    const daysAgo = (created) => {
        const diff = Math.floor((Date.now() - new Date(created)) / 86400000);
        if (diff === 0) return "Today";
        if (diff === 1) return "Yesterday";
        return `${diff}d ago`;
    };

    return (
        <>
            {toast && <Toast msg={toast.msg} color={toast.color} />}

            <div className="mx-auto bg-gray-50 dark:bg-[#0B0C0E]  p-3 py-0 min-h-screen  antialiased tracking-tight transition-colors duration-300 mb-3">

                <div className="breadcrumbs text-xs font-normal">
                    <ul>
                        <li><a onClick={() => navigate('/')} className="no-underline hover:no-underline hover:text-bread">Home</a></li>
                        <li><a className="text-bread no-underline hover:no-underline">Bookings</a></li>
                    </ul>
                </div>

                {/* iOS/macOS Style Header Group */}
                <div className="flex flex-row sm:items-baseline justify-between gap-3 mb-5 pb-5 border-b border-neutral-200/60 dark:border-neutral-800/60">
                    <div>
                        <h1 className="text-3xl md:text-4xl font-semibold text-neutral-900 dark:text-white tracking-tight">
                            Bookings
                        </h1>
                        <p className="text-sm text-neutral-500 dark:text-neutral-400 mt-1 font-normal tracking-wide">
                            Pending requests from your <a href="" target="_blank" className="text-blue-500 appearance-none inline">Site<RiArrowRightUpLine className="inline mb-2" /></a>.
                        </p>
                    </div>
                    {bookings.length > 0 && (
                        <div className="text-xs font-medium tracking-wide px-2.5 py-1 rounded-full bg-neutral-900 text-white dark:bg-white dark:text-black shadow-sm self-start sm:self-auto mt-3">
                            {bookings.length} pending
                        </div>
                    )}
                </div>
 <div className="my-5 text- text-center text-red-500 font-semibold text-md">
                <p>“These are event booking requests received from your website. Please review the booking details and accept or cancel the request. Once you accept it, the booking will be confirmed and the client will be notified.”
</p>
                   </div>
                {/* Empty State */}
                <div className="relative">
                    {bookingsLoading && (
                        <div className="absolute inset-0 z-10 flex items-center justify-center rounded-2xl bg-white/60 dark:bg-black/40 backdrop-blur-sm">
                            <span className="loading loading-spinner w-7 text-neutral-400 dark:text-neutral-500" />
                        </div>
                    )}
                    {bookings.length === 0 && !bookingsLoading ? (
                        <div className="flex flex-col items-center justify-center py-40 gap-3 text-center">
                            <div className="w-16 h-16 rounded-2xl bg-white dark:bg-[#1C1C1E] shadow-sm flex items-center justify-center border border-neutral-200/40 dark:border-neutral-800/40">
                                <MdEvent className="text-2xl text-neutral-400 dark:text-neutral-500" />
                            </div>
                            <p className="text-base font-semibold text-neutral-800 dark:text-neutral-200 mt-2">No Pending Bookings</p>
                            <p className="text-xs text-neutral-500 dark:text-neutral-400 max-w-xs leading-relaxed">
                                New incoming landing page schedules will securely appear here.
                            </p>
                        </div>
                    ) : (
                        /* Grid Layout with San Francisco feel */
                        <div className="grid grid-cols-1 xl:grid-cols-2 2xl:grid-cols-3 gap-6">
                            {bookings.map((b) => (
                                <div
                                    key={b.id}
                                    // className="group relative rounded-2xl border border-white/20 dark:border-neutral-700/30 bg-white/40 dark:bg-[#1C1C1E]/40 backdrop-blur-xl backdrop-saturate-150 shadow-[0_8px_32px_0_rgba(0,0,0,0.08)] dark:shadow-[0_8px_32px_0_rgba(0,0,0,0.37)] hover:shadow-xl hover:border-white/40 dark:hover:border-neutral-600/50 transition-all duration-500 flex flex-col justify-between overflow-hidden"
                                    className="group relative rounded-2xl border border-neutral-200 dark:border-neutral-800/50 bg-white dark:bg-[#1C1C1E]/80 backdrop-blur-md shadow-sm hover:shadow-md transition-all duration-300 flex flex-col justify-between overflow-hidden"
                                >
                                    {/* Card Body Content */}
                                    <div className="px-3 pt-6">
                                        <div className="flex items-center justify-between mb-5">
                                            {b.is_returning ? (
                                                <span className="flex items-center gap-1.5 text-xs font-semibold tracking-wide text-blue-600 dark:text-[#0A84FF]">
                                                    RETURNING CLIENT
                                                </span>
                                            ) : (
                                                <span className="flex items-center gap-1.5 text-xs font-semibold tracking-wide text-purple-600 dark:text-[#BF5AF2]">
                                                    NEW CLIENT
                                                </span>
                                            )}
                                            <span className="text-xs font-medium text-neutral-400 dark:text-neutral-500 mr-1">
                                                {daysAgo(b.created_at)}
                                            </span>
                                        </div>

                                        {/* Responsive Comparison Column splitting */}
                                        <div className={`grid gap-6 ${b.is_returning && b.existing_client ? "md:grid-cols-2" : "grid-cols-1"}`}>

                                            {/* Segment 1: Submission */}
                                            <div className="space-y-2.5">
                                                <h3 className="text-[11px] font-bold tracking-widest text-neutral-400 dark:text-neutral-500 uppercase">
                                                    Form Request
                                                </h3>
                                                <div className="space-y-2 bg-neutral-50 dark:bg-[#2C2C2E]/40 p-3.5 rounded-xl border border-neutral-100 dark:border-neutral-800/30">
                                                    <Row label="Name" value={b.name} />
                                                    <Row label="Phone" value={b.phone} />
                                                    <Row label="Event" value={b.event_type} />
                                                    <Row label="Date" value={fmtDate(b.event_date)} />
                                                    <Row label="Location" value={b.location || "—"} />
                                                </div>
                                            </div>

                                            {/* Segment 2: Database Sync (Only when returning) */}
                                            {b.is_returning && b.existing_client && (
                                                <div className="space-y-2.5">
                                                    <h3 className="text-[11px] font-bold tracking-widest text-blue-500 dark:text-[#0A84FF] uppercase">
                                                        System Record
                                                    </h3>
                                                    <div className="space-y-2 bg-blue-50/30 dark:bg-[#0A84FF]/5 p-3.5 rounded-xl border border-blue-100/50 dark:border-[#0A84FF]/10">
                                                        <Row label="Name" value={b.existing_client.name} highlight />
                                                        <Row label="Cust Code" value={b.existing_client.client_code} highlight />
                                                        <Row label="Email" value={b.existing_client.email || "—"} highlight />
                                                        <Row label="Place" value={b.existing_client.place || "—"} highlight />
                                                        <Row label="Address" value={b.existing_client.address.slice(0, 30) + "..." || "—"} highlight />
                                                    </div>
                                                </div>
                                            )}
                                        </div>
                                    </div>

                                    {/* Apple Style Action Bar Footer */}
                                    <div className="px-3 py-4   flex gap-3 items-center justify-end">
                                        <button
                                            onClick={() => handleDecline(b.id)}
                                            disabled={decliningId === b.id}
                                            className="h-9 px-4 rounded-xl text-xs font-semibold bg-red-500/80 hover:bg-red-500 text-white  active:scale-[0.98] transition-all flex items-center justify-center gap-1.5 disabled:opacity-50"
                                        >
                                            {decliningId === b.id ? (
                                                <span className="loading loading-spinner loading-xs" />
                                            ) : (
                                                <>
                                                    Decline
                                                </>
                                            )}
                                        </button>

                                        <button
                                            onClick={() => setSelected(b)}
                                            className="h-9 px-5 rounded-xl text-xs font-semibold bg-green-500 text-white  hover:opacity-90 active:scale-[0.98] transition-all flex items-center justify-center gap-1.5 shadow-sm"
                                        >

                                            Accept
                                        </button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </div>

            {/* Accept modal */}
            {selectedBooking && (
                <AcceptBookingModal
                    booking={selectedBooking}
                    onClose={() => setSelected(null)}
                    onSuccess={fetchBookings}
                    showToast={showToast}
                />
            )}
        </>
    );
};

// ── Refactored Row Component ──────────────────────────────────────────────────
const Row = ({ label, value, highlight }) => (
    <div className="flex items-baseline justify-between gap-4 py-0.5 text-xs">
        <span className="text-neutral-400 dark:text-neutral-500 font-normal shrink-0">
            {label}
        </span>
        <span className={`font-medium break-all text-right max-w-[70%] ${highlight
                ? "text-blue-600 dark:text-[#0A84FF]"
                : "text-neutral-800 dark:text-neutral-200"
            }`}>
            {value}
        </span>
    </div>
);

export default ViewAllBookings;