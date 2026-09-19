import React, { useState, useEffect } from 'react'
import { ImWhatsapp } from "react-icons/im";
import { FaPhoneAlt } from "react-icons/fa";
import { BsFillCalendarDateFill } from "react-icons/bs";
import { FaClock, FaLocationDot } from "react-icons/fa6";
import { MdCameraEnhance } from "react-icons/md";
import { AiOutlineSchedule } from "react-icons/ai";
import { TbCapture, TbTruckDelivery } from "react-icons/tb";
import { RiComputerFill } from "react-icons/ri";
import { useAuth } from "../../context/AuthContext";
const EventDetail = ({ setShowEventModel, viewEventDetail, setViewEventDetail }) => {
    const formatDateTime = (dateString) => {
        const d = new Date(dateString);
        const year = d.getFullYear();
        const month = String(d.getMonth() + 1).padStart(2, "0");
        const day = String(d.getDate()).padStart(2, "0");
        const hours = String(d.getHours()).padStart(2, "0");
        const minutes = String(d.getMinutes()).padStart(2, "0");
        return `${year}-${month}-${day} ${hours}:${minutes}`;
    };
    const statusSteps = ["scheduled", "shouted", "processing", "completed"];
    const statusIcon = [<AiOutlineSchedule />, <TbCapture />, <RiComputerFill />, <TbTruckDelivery />];
    const { role } = useAuth();

    return (
        <>
            <div className="modal modal-open backdrop-blur-md p-3">
                <div className="modal-box w-full max-w-lg p-0 overflow-y-auto max-h-[92vh] rounded-2xl shadow-2xl border border-base-300/50 bg-base-100 no-scrollbar">
                    <div className="px-5 pt-6 pb-4">
                        <div className="flex justify-between items-start gap-3">
                            <div className="min-w-0 flex-1">
                                <span className="text-[9px] font-bold tracking-[0.2em] uppercase text-primary/60 block truncate">
                                    {viewEventDetail.event_code}
                                </span>
                                <h2 className="text-xl sm:text-2xl font-extrabold tracking-tight text-base-content truncate mt-0.5 capitalize">
                                    {viewEventDetail.client_name}
                                </h2>
                            </div>
                            <button
                                className='btn btn-sm btn-circle absolute right-2 top-2 text-red-500 hover:bg-red-500/40 hover:text-white'
                                onClick={() => { setShowEventModel(false); setViewEventDetail(null); }}
                            >
                                ✕
                            </button>
                        </div>
                        {/* ── Contact Buttons ── */}
                        <div className="grid grid-cols-2 gap-2 mt-4">
                            <a
                                href={`tel:+91${viewEventDetail.client_phone}`}
                                className="flex items-center justify-center gap-2 py-2.5 px-3 rounded-xl bg-base-300 hover:bg-primary/10 hover:text-primary border border-base-300/60 hover:border-primary/30 transition-all"
                            >
                                <FaPhoneAlt className="text-xs shrink-0" />
                                <span className="text-xs sm:text-sm font-semibold text-base-content/70 truncate">
                                    {viewEventDetail.client_phone}
                                </span>
                            </a>
                            <a
                                href={`https://wa.me/91${viewEventDetail.client_phone}?text=Hello%20${viewEventDetail.client_name}%20I%20'm%20reaching%20out%20regarding%20your%20${viewEventDetail.photography_type}%20event%20on%20${viewEventDetail.event_date}`}
                                target="_blank"
                                rel="noreferrer"
                                className="flex items-center justify-center gap-2 py-2.5 px-3 rounded-xl bg-base-300 hover:bg-green-500/10 hover:text-green-500 border border-base-300/60 hover:border-green-500/30 transition-all"
                            >
                                <ImWhatsapp className="text-sm shrink-0" />
                                <span className="text-xs sm:text-sm font-semibold text-base-content/70 truncate">
                                    WhatsApp
                                </span>
                            </a>
                        </div>
                    </div>
                    {/* ── Body ── */}
                    <div className="px-5 pb-6 space-y-5">
                        <div className='divider text-base-content/40'>Event Details</div>
                        <div className='md:px-15 capitalize'>
                            <ul className="steps w-full">
                                {viewEventDetail.status === "cancelled" ? (
                                    <li className="step step-error" data-content="✕">Cancelled</li>
                                ) : (
                                    statusSteps.map((step, index) => {
                                        const currentIndex = statusSteps.indexOf(viewEventDetail.status);
                                        return (
                                            <li key={step}
                                                className={`step ${index <= currentIndex ? "step-secondary" : ""}`}>
                                                <span className="step-icon text-xl">{statusIcon[index]}</span>{step}

                                            </li>
                                        );
                                    })
                                )}
                            </ul>
                        </div>

                        <div className="grid grid-cols-2 gap-2.5">
                            {[
                                { icon: <BsFillCalendarDateFill />, label: "Date", value: viewEventDetail.event_date },
                                { icon: <FaClock />, label: "Time", value: viewEventDetail.event_time },
                                { icon: <MdCameraEnhance />, label: "Event", value: viewEventDetail.photography_type },
                                { icon: <FaLocationDot />, label: "Location", value: viewEventDetail.location },
                            ].map(({ icon, label, value }) => (
                                <div key={label} className="bg-base-300/70 rounded-xl px-3.5 py-3 border border-base-300/40 min-w-0">
                                    <p className="text-[9px] uppercase tracking-widest font-bold text-base-content/35 mb-1.5">
                                        {label}
                                    </p>
                                    <p className="text-sm font-semibold text-base-content flex items-center gap-1.5 min-w-0">
                                        <span className="text-auxillary/70 shrink-0 text-base">{icon}</span>
                                        <span className="truncate">{value}</span>
                                    </p>
                                </div>
                            ))}
                        </div>

                        {/* Address + Notes — stack on small, side by side on sm+ */}
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                            <div className="bg-base-300/70 rounded-xl px-3.5 py-3 border border-base-300/40">
                                <p className="text-[9px] uppercase tracking-widest font-bold text-base-content/35 mb-1.5">
                                    Address
                                </p>
                                <p className="text-xs sm:text-sm text-base-content/75 leading-relaxed">
                                    {viewEventDetail.address || "—"}
                                </p>
                            </div>
                            <div className="bg-base-300/70 rounded-xl px-3.5 py-3 border border-base-300/40">
                                <p className="text-[9px] uppercase tracking-widest font-bold text-base-content/35 mb-1.5">
                                    Notes
                                </p>
                                <p className="text-xs sm:text-sm text-base-content/75 leading-relaxed">
                                    {viewEventDetail.description || "—"}
                                </p>
                            </div>
                        </div>

                        {/* Payment */}
                        {role === "ADMIN" && (
                            <div>
                                <div className='divider text-base-content/40'>Payment Summary</div>
                                <div className="bg-base-300/70 rounded-xl border border-base-300/40 overflow-hidden">
                                    <div className="grid grid-cols-3 divide-x divide-base-300/50">
                                        {[
                                            { label: "Total", value: viewEventDetail.total_amount, color: "text-base-content" },
                                            { label: "Paid", value: viewEventDetail.total_paid, color: "text-emerald-500" },
                                            { label: "Balance", value: viewEventDetail.balance_amount, color: "text-rose-400" },
                                        ].map(({ label, value, color }) => (
                                            <div key={label} className="flex flex-col items-center py-3.5 px-2 gap-1">
                                                <p className="text-[9px] uppercase tracking-widest font-bold text-base-content/35">
                                                    {label}
                                                </p>
                                                <p className={`text-sm sm:text-base font-bold ${color} truncate w-full text-center`}>
                                                    ₹{value}
                                                </p>
                                            </div>
                                        ))}
                                    </div>
                                    {/* Payment progress bar */}
                                    <div className="h-1 bg-base-300/50">
                                        <div
                                            className="h-full bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 transition-all duration-700"
                                            style={{
                                                width: `${Math.min(100, Math.round((viewEventDetail.total_paid / viewEventDetail.total_amount) * 100))}%`
                                            }}
                                        />
                                    </div>
                                </div>
                            </div>
                        )}
                        {/* ── Meta Footer ── */}
                        <div className="pt-1 border-t border-base-300/40">
                            <div className="flex justify-between items-start gap-4">
                                <div className="min-w-0">
                                    <p className="text-[10px] uppercase tracking-wider font-bold text-base-content/50 truncate">
                                        Created · {viewEventDetail.created_by_name}
                                    </p>
                                    <p className="text-[10px] text-base-content/50 mt-0.5">
                                        {formatDateTime(viewEventDetail.created_at)}
                                    </p>
                                </div>
                                <div className="text-right min-w-0 shrink-0">
                                    <p className="text-[10px] uppercase tracking-wider font-bold text-base-content/50 truncate">
                                        Updated · {viewEventDetail.updated_by_name}
                                    </p>
                                    <p className="text-[10px] text-base-content/50 mt-0.5">
                                        {formatDateTime(viewEventDetail.updated_at)}
                                    </p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
                <div className="modal-backdrop" onClick={() => setShowEventModel(false)} />
            </div>
        </>
    );
}

export default EventDetail