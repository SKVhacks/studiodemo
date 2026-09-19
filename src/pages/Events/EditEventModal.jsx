import React, { useState, useEffect } from 'react';
import { UpdateEvent } from '../../api/EventServices';
import ConflictAlert from '../../components/ConflictAlert';
import { FaUser } from "react-icons/fa";
import { MdOutlinePhone } from "react-icons/md";

const EditEventModal = ({ fetchEvents, ModifyDetail, setModifyDetail, setShowModelModifyEvent, showToast }) => {
    const [conflictDate, setConflictDate] = useState(null);
    const [sendWhatsapp, setSendWhatsapp] = useState(true);
    const [isSaving, setIsSaving] = useState(false);
    const [eventForm, setEventForm] = useState({
        photography_type: "",
        location: "",
        event_date: "",
        event_time: "",
        description: "",
        address: "",
        status: ""
    });
    const [errors, setErrors] = useState({});
    const [conflictMsg, setConflictMsg] = useState(null);
    const [pendingPayload, setPendingPayload] = useState(null);
    const REQUIRED_FIELDS = ['photography_type', 'location', 'event_date', 'event_time', 'status'];
    useEffect(() => {
        if (ModifyDetail) {
            setEventForm({
                photography_type: ModifyDetail.photography_type,
                location: ModifyDetail.location,
                event_date: ModifyDetail.event_date,
                event_time: ModifyDetail.event_time,
                description: ModifyDetail.description,
                address: ModifyDetail.address,
                status: ModifyDetail.status || "scheduled"
            });
            setErrors({});
        }
    }, [ModifyDetail]);

    const validate = (form) => {
        const newErrors = {};
        REQUIRED_FIELDS.forEach(field => {
            if (!form[field] || form[field].toString().trim() === '') {
                newErrors[field] = 'This field is required';
            }
        });
        return newErrors;
    };

    const handleChange = (e) => {
        const { name, value } = e.target;
        setEventForm(prev => ({ ...prev, [name]: value }));
        if (errors[name]) {
            setErrors(prev => ({ ...prev, [name]: undefined }));
        }
    };

    const saveEvent = async (payload, force = false) => {
        const finalPayload = {
            ...payload,
            send_notification: sendWhatsapp,
            ...(force && { force_save: true }),
        };
        setIsSaving(true);
        try {
            await UpdateEvent(ModifyDetail.id, finalPayload);
            showToast(`${eventForm.photography_type} Event has been Updated`, "alert-success")
            setShowModelModifyEvent(false);
            setModifyDetail(null);
            setConflictMsg(null);
            setPendingPayload(null);
            fetchEvents();
        } catch (err) {
            const conflict = err.response?.data?.conflict;
            if (conflict) {
                setPendingPayload(payload);
                const conflictText = Array.isArray(conflict) ? conflict[0] : conflict;
                setConflictMsg(conflictText);
                setConflictDate(eventForm.event_date || null);
            } else {
                showToast(err.response?.data || "Something went wrong", 'alert-error')
            }
        } finally {
            setIsSaving(false);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        const validationErrors = validate(eventForm);
        if (Object.keys(validationErrors).length > 0) {
            setErrors(validationErrors);
            return;
        }
        saveEvent(eventForm);
    };

    return (
        <>
            <div className="fixed inset-0 flex items-center justify-center bg-black/40 backdrop-blur-md p-4 z-50">
                <div className=" w-full max-w-lg max-h-[90vh] overflow-y-auto  rounded-3xl p-6 bg-white/70 dark:bg-zinc-900/70  backdrop-blur-2xl border border-white/20 shadow-[0_20px_60px_rgba(0,0,0,0.15)] ">
                    <h3 className="text-xl font-semibold text-center mb-6">
                        Edit Event Details
                    </h3>
                    <div className="flex justify-between items-center mb-6 p-4 rounded-2xl  bg-white/40 dark:bg-white/10 backdrop-blur">
                        <div className="flex items-center gap-2 text-sm">
                            <FaUser />
                            <span>{ModifyDetail.client_name}</span> - {ModifyDetail.client_place}
                        </div>
                        <div className="flex items-center gap-2 text-sm">
                            <MdOutlinePhone />
                            <span>{ModifyDetail.client_phone}</span>
                        </div>
                    </div>

                    <form onSubmit={handleSubmit} className="space-y-5">
                        <div>
                            <label className="text-sm text-zinc-500">Event</label>
                            <input
                                type="text"
                                name="photography_type"
                                value={eventForm.photography_type}
                                onChange={handleChange}
                                className="w-full mt-1 px-4 py-2 rounded-xl  bg-white/60 dark:bg-white/10  border border-white/20 focus:ring-2 focus:ring-focus outline-none"
                            />
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className="text-sm text-zinc-500">Date</label>
                                <input
                                    type="date"
                                    min={eventForm.event_date < new Date().toISOString().split("T")[0] ? eventForm.event_date : new Date().toISOString().split("T")[0] }
                                    // min={new Date().toISOString().split("T")[0]}
                                    name="event_date"
                                    value={eventForm.event_date}
                                    onChange={handleChange}
                                    className="w-full mt-1 px-4 py-2 rounded-xl bg-white/60 dark:bg-white/10 border border-white/20 focus:ring-2 focus:ring-focus outline-none"
                                />
                            </div>
                            <div>
                                <label className="text-sm text-zinc-500">Time</label>
                                <input
                                    type="time"
                                    name="event_time"
                                    value={eventForm.event_time}
                                    onChange={handleChange}
                                    className="w-full mt-1 px-4 py-2 rounded-xl bg-white/60 dark:bg-white/10 border border-white/20 focus:ring-2 focus:ring-focus outline-none"
                                />
                            </div>
                            <div>
                                <label className="text-sm text-zinc-500">Venue</label>
                                <input
                                    type="text"
                                    name="location"
                                    value={eventForm.location}
                                    onChange={handleChange}
                                    className="w-full mt-1 px-4 py-2 rounded-xl bg-white/60 dark:bg-white/10 border border-white/20 focus:ring-2 focus:ring-focus outline-none"
                                />
                            </div>
                            <div>
                                <label className="text-sm text-zinc-500">Status</label>
                                <select
                                    name="status"
                                    value={eventForm.status}
                                    onChange={handleChange}
                                    className="w-full mt-1 px-4 py-2 rounded-xl bg-white/60 dark:bg-white/10 border border-white/20 focus:ring-2 focus:ring-focus outline-none"
                                >
                                    <option value="scheduled" className='bg-white dark:bg-zinc-900'  >Scheduled</option>
                                    <option value="shouted" className='bg-white dark:bg-zinc-900'  >Shouted</option>
                                    <option value="processing" className='bg-white dark:bg-zinc-900'  >Processing</option>
                                    <option value="completed" className='bg-white dark:bg-zinc-900'  >Completed</option>
                                    <option value="cancelled" className='bg-white dark:bg-zinc-900 text-red-600'  >Cancelled</option>
                                </select>
                            </div>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <textarea
                                name="address"
                                placeholder="Event Address"
                                value={eventForm.address}
                                onChange={handleChange}
                                className="w-full h-24 px-4 py-2 rounded-xl bg-white/60 dark:bg-white/10 border border-white/20 focus:ring-2 focus:ring-focus outline-none"
                            />
                            <textarea
                                name="description"
                                placeholder="Event Description"
                                value={eventForm.description}
                                onChange={handleChange}
                                className="w-full h-24 px-4 py-2 rounded-xl bg-white/60 dark:bg-white/10 border border-white/20 focus:ring-2 focus:ring-focus outline-none"
                            />
                        </div>
                        <div className="flex items-center justify-between mt-4">
                            <span className="text-sm text-zinc-600 dark:text-zinc-300">
                                Send Updates to WhatsApp
                            </span>
                            <button
                                type="button"
                                onClick={() => setSendWhatsapp(!sendWhatsapp)}
                                className={` relative w-12 h-7 rounded-full transition duration-300  ${sendWhatsapp ? "bg-green-500" : "bg-zinc-300 dark:bg-zinc-700"} `}
                            >
                                <span className={`  absolute top-1 left-1 w-5 h-5 bg-white rounded-full shadow-md  transition-transform duration-300  ${sendWhatsapp ? "translate-x-5" : ""} `}   />
                            </button>
                        </div>

                        <div className="flex justify-end gap-3 pt-4">
                            <button
                                type="button"
                                onClick={() => {
                                    setShowModelModifyEvent(false);
                                    setModifyDetail(null);
                                }}
                                className="px-4 py-2 rounded-xl text-sm bg-zinc-200 dark:bg-zinc-700 font-medium"
                            >
                                Cancel
                            </button>
                            <button
                                type="submit"
                                disabled={isSaving}
                                className={` ${isSaving ? "opacity-60" : ""} px-5 py-2 rounded-xl text-sm text-white  bg-submit  hover:scale-105 transition font-medium disabled:cursor-not-allowed`}
                            >
                                {isSaving ? "Saving..." : "Update"}
                            </button>
                        </div>
                    </form>
                </div>
            </div>


            {/* conflict modal — alert model both event on same date */}
            <ConflictAlert
                message={conflictMsg}
                conflictDate={conflictDate}          // ✅ ADD THIS
                onConfirm={() => {
                    setConflictMsg(null);
                    setConflictDate(null);           // ✅ ADD THIS
                    saveEvent(pendingPayload, true);
                }}
                onCancel={() => {
                    setConflictMsg(null);
                    setConflictDate(null);           // ✅ ADD THIS
                    setPendingPayload(null);
                }}
            />
        </>
    );
};

export default EditEventModal;