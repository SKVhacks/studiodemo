import { useEffect, useState } from "react";
import EventDetail from "../pages/Events/EventDetail";


export default function UpcomingEventsTable({ events, loading }) {
    const [showModelEvent, setShowModelEvent] = useState(false);
    const [eventDetail, setEventDetail] = useState({});


    return (
        <div className="w-full">
            <div className='px-0 py-2 md:py-4 mt-4'>
                <div className="flex flex-col">
                    <h1 className='text-4xl font-bold text-base-content'>Upcoming Events</h1>
                    <p className="text-xs mt-1 text-slate-400 dark:text-slate-500">
                        Next 10 Events
                    </p>
                </div>

            </div>
        
                <div className="relative">
                    {loading && (
                        <div className="absolute inset-0 z-10 flex items-center justify-center rounded-2xl backdrop-blur-sm">
                            <span className="loading loading-spinner w-7 text-core" />
                        </div>
                    )}
                    {events.length !== 0 && !loading ? (
                        <div className="bg-white/5 backdrop-blur-xl border border-slate-200 dark:border-white/10 rounded-xl shadow-xl  overflow-x-auto overflow-y-auto max-h-[520px]">
                            <table className="table table-pin-rows table-fixed text-center w-full text-base min-w-[700px]">
                                <tbody>
                                    {events.map(ev => (
                                        <tr
                                            key={ev.id}
                                            className="hover cursor-pointer capitalize transition-all duration-200 hover:bg-black/5 dark:bg-white/5"
                                            onClick={() => {
                                                setEventDetail(ev);
                                                setShowModelEvent(true);
                                            }}
                                        >

                                            <td className="">
                                                <div
                                                    className="font-semibold text-base-content truncate"
                                                    title={ev.client_name}
                                                >
                                                    {ev.client_name}
                                                </div>
                                                <div className="text-xs text-base-content/40">
                                                    {ev.client_phone}
                                                </div>
                                            </td>
                                            <td className=" text-base-content ">
                                                {ev.photography_type}
                                            </td>
                                            <td className="whitespace-nowrap">
                                                <div className="text-base-content/90">
                                                    {new Date(ev.event_date + "T00:00:00").toLocaleDateString("en-IN", {
                                                        day: "numeric", month: "short", year: "numeric"
                                                    })}
                                                </div>
                                                <div className="text-xs text-auxillary/80">
                                                    {ev.event_time?.slice(0, 5)}
                                                </div>
                                            </td>
                                            <td className="text-base-content ">
                                                {ev.location || ". . ."}
                                            </td>
                                            <td>
                                                <span className="font-mono text-xs text-base-content/40 whitespace-nowrap">
                                                    {ev.event_code}
                                                </span>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    ) : (
                        <div className="text-center py-10 bg-white/5 backdrop-blur-xl border border-slate-200 dark:border-white/10 rounded-xl shadow-xl text-sm">
                            No upcoming events
                        </div>
                    )}

                </div>
            
            {showModelEvent && (
                <EventDetail viewEventDetail={eventDetail} setViewEventDetail={setEventDetail} setShowEventModel={setShowModelEvent} />
            )}
        </div>
    );
}