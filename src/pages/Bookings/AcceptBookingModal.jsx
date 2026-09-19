import { useState } from "react";
import { AcceptBooking } from "../../api/BookingServices";
import { MdCheckCircle } from "react-icons/md";
import ConflictAlert from "../../components/ConflictAlert";

const AcceptBookingModal = ({ booking, onClose, onSuccess, showToast }) => {
    const [form, setForm] = useState({
        // client fields — pre-filled from booking, admin can edit
        name: booking.existing_client?.name || booking.name,
        phone: booking.existing_client?.phone || booking.phone,
        email: booking.existing_client?.email || "",
        place: booking.existing_client?.place || "",
        address: booking.existing_client?.address || "",
        notes: "",
        // event fields
        event_type: booking.event_type,
        event_date: booking.event_date,
        event_time: "09:00",
        location: booking.location || "",
        description: "",
    });
    const [loading, setLoading] = useState(false);
    const [errors, setErrors] = useState({});
    const [conflictMsg, setConflictMsg] = useState(null);
    const [pendingPayload, setPendingPayload] = useState(null);
    const [conflictDate, setConflictDate] = useState(null);
    const handleChange = (e) => {
        setForm(f => ({ ...f, [e.target.name]: e.target.value }));
        setErrors(err => ({ ...err, [e.target.name]: null }));
    };

    // ── core save — force=true skips conflict check on backend ─────────────
    const saveBooking = async (payload, force = false) => {
        setLoading(true);
        try {
            await AcceptBooking(booking.id, force ? { ...payload, force_save: true } : payload);
            showToast("Booking Added — client & event created!", "alert-success");
            onSuccess();
            onClose();
        } catch (err) {
            const data = err.response?.data;
            // conflict returns 409 with { conflict: "..." }
            if (err.response?.status === 409 && data?.conflict) {
                setPendingPayload(payload);
                setConflictDate(form.event_date || null);
                setConflictMsg(Array.isArray(data.conflict) ? data.conflict[0] : data.conflict);
            } else {
                if (data && typeof data === "object") setErrors(data);
                showToast(data?.error || "Something went wrong", "alert-error");
            }
        } finally {
            setLoading(false);
        }
    };

    const handleSubmit = () => saveBooking(form);

    const inputCls = (field) => `w-full mt-1 px-4 py-2 rounded-xl bg-white/60 dark:bg-white/10 border ${errors[field] ? "border-red-500 border-2" : "border-white/20"} focus:ring-2 ${errors[field] ? "focus:ring-red-400/40" : "focus:ring-focus"} outline-none`;

    return (
        <>
            <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-md px-4">
                <div className="w-full max-w-2xl max-h-[90vh] overflow-y-auto  rounded-2xl shadow-2xl bg-white/70 dark:bg-zinc-900/70 backdrop-blur-2xl  border border-white/20 shadow-[0_20px_60px_rgba(0,0,0,0.15)]">

                    <h3 className="text-2xl font-semibold text-center mt-3">
                        Confirm Booking
                    </h3>
                    <p className="text-center text-sm text-gray-500 dark:text-gray-400 mt-0.5">
                        Review  before accepting
                    </p>
                    <div className="px-6 py-1 flex flex-col gap-6 mt-2">

                        {/* Returning client badge */}
                        {booking.is_returning && (
                            <div className="flex items-center gap-3 px-4 py-3 rounded-xl bg-blue-50 dark:bg-blue-500/10 border border-blue-200 dark:border-blue-500/20">
                                <span className="text-blue-500 text-xl">↩</span>
                                <div>
                                    <p className="text-sm font-semibold text-blue-700 dark:text-blue-400">
                                        Returning Client — {booking.existing_client?.client_code}
                                    </p>
                                    <p className="text-xs text-blue-600/70 dark:text-blue-300/60">
                                        Existing client found by phone. Fields pre-filled. Edit if needed.
                                    </p>
                                </div>
                            </div>
                        )}

                        {/* ── Client Details ── */}
                        <div>
                            <div className="flex items-center font-bold uppercase tracking-widest">
                                <div className="flex-1 h-[1px] bg-zinc-400/30 dark:bg-zinc-700"></div>
                                <span className="px-3 mb-1 text-xs text-zinc-400 whitespace-nowrap">
                                    Client Details
                                </span>
                                <div className="flex-1 h-[1px] bg-zinc-400/30 dark:bg-zinc-700"></div>
                            </div>
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                {[
                                    { label: "Full Name *", name: "name", type: "text" },
                                    { label: "Phone *", name: "phone", type: "text" },
                                    { label: "Email", name: "email", type: "email" },
                                    { label: "Place", name: "place", type: "text" },
                                ].map(({ label, name, type }) => (
                                    <div key={name}>
                                        <label className="block text-sm text-zinc-500 mb-1">
                                            {label}
                                        </label>
                                        <input
                                            type={type}
                                            name={name}
                                            value={form[name]}
                                            onChange={handleChange}
                                            className={inputCls(name)}
                                        />
                                        {errors[name] && (
                                            <p className="text-xs text-rose-500 mt-1">{errors[name]}</p>
                                        )}
                                    </div>
                                ))}

                                <div className="sm:col-span-2">
                                    <label className="block  text-sm text-zinc-500 mb-1">
                                        Address
                                    </label>
                                    <textarea
                                        name="address"
                                        value={form.address}
                                        onChange={handleChange}
                                        rows={2}
                                        className={inputCls("address") + " resize-none"}
                                    />
                                </div>

                                <div className="sm:col-span-2">
                                    <label className="block  text-sm text-zinc-500 mb-1">
                                        Notes
                                    </label>
                                    <textarea
                                        name="notes"
                                        value={form.notes}
                                        onChange={handleChange}
                                        rows={2}
                                        className={inputCls("notes") + " resize-none"}
                                    />
                                </div>
                            </div>
                        </div>

                        {/* ── Event Details ── */}
                        <div>
                            <div className="flex items-center font-bold uppercase tracking-widest mb-2">
                                <div className="flex-1 h-[1px] bg-zinc-400/30 dark:bg-zinc-700"></div>
                                <span className="px-3 text-xs text-zinc-400 whitespace-nowrap">
                                    Event Details
                                </span>
                                <div className="flex-1 h-[1px] bg-zinc-400/30 dark:bg-zinc-700"></div>
                            </div>
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                {[
                                    { label: "Event Type *", name: "event_type", type: "text" },
                                    { label: "Location", name: "location", type: "text" },
                                    { label: "Date *", name: "event_date", type: "date" },
                                    { label: "Time *", name: "event_time", type: "time" },
                                ].map(({ label, name, type }) => (
                                    <div key={name}>
                                        <label className="block  text-sm text-zinc-500 mb-1">
                                            {label}
                                        </label>
                                        <input
                                            type={type}
                                            name={name}
                                            value={form[name]}
                                            onChange={handleChange}
                                            className={inputCls(name)}
                                        />
                                        {errors[name] && (
                                            <p className="text-xs text-rose-500 mt-1">{errors[name]}</p>
                                        )}
                                    </div>
                                ))}

                                <div className="sm:col-span-2">
                                    <label className="block  text-sm text-zinc-500 mb-1">
                                        Description
                                    </label>
                                    <textarea
                                        name="description"
                                        value={form.description}
                                        onChange={handleChange}
                                        rows={2}
                                        className={inputCls("description") + " resize-none"}
                                    />
                                </div>
                            </div>
                        </div>
                    </div>
                    <div className="flex flex-row justify-end gap-2 mr-4 my-4">
                        <button
                            className="px-4 py-2 rounded-xl text-sm bg-zinc-200 dark:bg-zinc-700 font-medium  disabled:cursor-not-allowed"
                            onClick={onClose}
                            disabled={loading}
                        >
                            Cancel
                        </button>
                        <button
                            className={` ${loading ? "opacity-60" : "hover:scale-105"} px-5 py-2 rounded-xl text-sm text-white  bg-submit   transition font-medium disabled:cursor-not-allowed`}
                            onClick={handleSubmit}
                            disabled={loading}
                        >
                            {loading ? <><span className="loading loading-spinner loading-sm" /> <span>Saving..</span></> : "Accept"}
                        </button>
                    </div>
                </div>
            </div>

            {/* Conflict alert — same pattern as AddEvent/EditEvent */}
            <ConflictAlert
                message={conflictMsg}
                conflictDate={conflictDate}          // ✅ THIS WAS MISSING
                onConfirm={() => {
                    setConflictMsg(null);
                    setConflictDate(null);
                    saveBooking(pendingPayload, true);
                }}
                onCancel={() => {
                    setConflictMsg(null);
                    setConflictDate(null);
                    setPendingPayload(null);
                }}
            />
        </>
    );

};

export default AcceptBookingModal;