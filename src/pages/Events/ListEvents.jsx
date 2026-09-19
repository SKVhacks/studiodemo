import React, { useEffect, useState, useRef } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { ListEvent, DeleteEvent } from "../../api/EventServices";
import AddEventModal from "./AddEventModal";
import EditEventModal from "./EditEventModal";
import EventDetail from "./EventDetail";
import { MdCamera, MdDeleteOutline, MdEdit } from "react-icons/md";
import { AiOutlineSchedule } from "react-icons/ai";
import { TbCapture } from "react-icons/tb";
import { RiComputerFill } from "react-icons/ri";
import { TiTick } from "react-icons/ti";
import { FetchTransaction } from "../../api/PaymentServices";
import TransactionCard from "../Payments/TransactionCard";
import { FaEye } from "react-icons/fa";
import Toast from '../../components/Toast';
import Button from "../../components/Button";
import { useAuth } from "../../context/AuthContext";
import { TbCameraPlus } from "react-icons/tb";
import SearchBox from "../../components/SearchBox";
const PAGE_SIZE = 25;

const getPaginationPages = (current, total) => {
    if (total <= 7) return Array.from({ length: total }, (_, i) => i + 1);
    const pages = [1];
    if (current > 4) pages.push("...");
    const start = Math.max(2, current - 1);
    const end = Math.min(total - 1, current + 1);
    for (let i = start; i <= end; i++) pages.push(i);
    if (current < total - 3) pages.push("...");
    pages.push(total);
    return pages;
};

const ListEvents = () => {
    const { role } = useAuth();
    const navigate = useNavigate();
    const location = useLocation();
    const inputRef = useRef(null);

    // ── Read ?date= query param on mount ──────────────────
    const _params = new URLSearchParams(location.search);
    const _dateParam = _params.get("date");

    const [showModalEvent, setShowModalEvent] = useState(false);
    const [showModelModifyEvent, setShowModelModifyEvent] = useState(false);
    const [showModelEventDetail, setShowModelEventDetail] = useState(false);
    const [ModifyDetail, setModifyDetail] = useState(null);

    const [events, setEvents] = useState([]);
    const [search, setSearch] = useState("");
    const [sortStatus, setSortStatus] = useState("");
    const [filterType, setFilterType] = useState(_dateParam ? "custom" : "");
    const [customFrom, setCustomFrom] = useState(_dateParam || "");
    const [customTo, setCustomTo] = useState(_dateParam || "");

    const [currentPage, setCurrentPage] = useState(1);
    const [totalCount, setTotalCount] = useState(0);
    const [hasNext, setHasNext] = useState(false);

    const [transactionData, setTransactionData] = useState([]);
    const [expandedRow, setExpandedRow] = useState(null);

    const [toast, setToast] = useState(null);
    const [tableLoading, setTableLoading] = useState(false);

    const totalPages = totalCount > 0 ? Math.ceil(totalCount / PAGE_SIZE) : 1;
    const statusUi = [
        { statusSteps: "scheduled", statusIcon: <AiOutlineSchedule />, statusvalue: "scheduled" },
        { statusSteps: "shouted", statusIcon: <TbCapture />, statusvalue: "shouted" },
        { statusSteps: "processing", statusIcon: <RiComputerFill />, statusvalue: "processing" },
        { statusSteps: "completed", statusIcon: <TiTick />, statusvalue: "done" },
    ];

    const statusStyles = {
        partial: "bg-yellow-500/20 text-yellow-400",
        pending: "bg-red-400/20 text-red-600",
        paid: "bg-green-300/20 text-green-600",
    };

    const showToast = (msg, color) => {
        setToast({ msg, color });
        setTimeout(() => setToast(null), 5000);
    };


    // Cmd+K focus
    useEffect(() => {
        const handler = (e) => {
            if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === "k") {
                e.preventDefault();
                inputRef.current?.focus();
            }
        };
        window.addEventListener("keydown", handler);
        return () => window.removeEventListener("keydown", handler);
    }, []);

    const fetchEvents = async (page = 1) => {
        try {
            setTableLoading(true);
            const params = { page, page_size: PAGE_SIZE };
            if (search) params.search = search;
            if (sortStatus) params.status = sortStatus;
            const today = new Date();
            if (filterType === "this_month") {
                params.event_date_from = new Date(today.getFullYear(), today.getMonth(), 1).toISOString().split("T")[0];
                params.event_date_to = new Date(today.getFullYear(), today.getMonth() + 1, 0).toISOString().split("T")[0];
            } else if (filterType === "last_month") {
                params.event_date_from = new Date(today.getFullYear(), today.getMonth() - 1, 1).toISOString().split("T")[0];
                params.event_date_to = new Date(today.getFullYear(), today.getMonth(), 0).toISOString().split("T")[0];
            } else if (filterType === "previous_month") {
                params.event_date_from = new Date(today.getFullYear(), today.getMonth() - 2, 1).toISOString().split("T")[0];
                params.event_date_to = new Date(today.getFullYear(), today.getMonth() - 1, 0).toISOString().split("T")[0];
            } else if (filterType === "next_month") {
                params.event_date_from = new Date(
                    today.getFullYear(),
                    today.getMonth() + 1,
                    1
                ).toISOString().split("T")[0];

                params.event_date_to = new Date(
                    today.getFullYear(),
                    today.getMonth() + 2,
                    0
                ).toISOString().split("T")[0];
            } else if (filterType === "custom" && customFrom && customTo) {
                params.event_date_from = customFrom;
                params.event_date_to = customTo;
            }
            const res = await ListEvent(params);
            const data = res.data;
            if (data.results) {
                setEvents(data.results);
                setTotalCount(data.count || 0);
                setHasNext(!!data.next);
            } else {
                setEvents(Array.isArray(data) ? data : []);
                setTotalCount(Array.isArray(data) ? data.length : 0);
                setHasNext(false);
            }
        } catch (err) {
            console.error(err);
        } finally {
            setTableLoading(false);
        }
    };

    const getTransaction = async (id) => {
        try {
            const res = await FetchTransaction(id);
            setTransactionData(res.data.results || res.data);
        } catch (err) {
            console.error("Error fetching transactions:", err);
        }
    };

    const deleteEvent = async (id) => {
        if (!window.confirm("Delete this event?")) return;
        try {
            await DeleteEvent(id);
            showToast("Event Deleted Successfully", "alert-success");
            fetchEvents(currentPage, false);
        } catch (err) {
            showToast(err.response?.data?.error || "Something went wrong", "alert-error");
        }
    };

    useEffect(() => {
        setCurrentPage(1);
        fetchEvents(1);
    }, [search, filterType, customFrom, customTo, sortStatus]);

    // Page changes (skip when page was just reset to 1 by filter change)
    const prevPage = useRef(1);
    useEffect(() => {
        if (currentPage === prevPage.current) return;
        prevPage.current = currentPage;
        fetchEvents(currentPage);
    }, [currentPage]);


    return (
        <>
            {toast && <Toast msg={toast.msg} color={toast.color} />}
            <div className="mx-auto bg-gray-50 dark:bg-[#0B0C0E] shadow-xl p-3 py-0 min-h-screen">
                <div className="breadcrumbs text-xs font-normal">
                    <ul>
                        <li><a onClick={() => navigate('/')} className="no-underline hover:no-underline hover:text-bread">Home</a></li>
                        <li><a className="text-bread no-underline hover:no-underline">Events</a></li>
                    </ul>
                </div>
                <div className="my-1 mb-4 flex flex-col gap-1">
                    <div className='flex flex-row justify-between'>
                        <h1 className="text-3xl md:text-4xl font-semibold text-neutral-900 dark:text-white tracking-tight">Events</h1>
                        <div className="">
                            <Button modal={() => setShowModalEvent(true)} bg="bg-lime-500" hoverBg="hover:bg-lime-600" logo={<TbCameraPlus />} text="Event" tip="Add Event" />
                        </div>
                    </div>
                    <div className="mt-2 flex flex-col md:flex-row gap-3 md:items-center justify-between">
                        <SearchBox
                            placeholders={["Client Name", "Client Phone", "Event Date"]}
                            value={search}
                            onChange={(val) => {
                                setSearch(val);
                            }}
                            onSearch={(val) => {
                                setSearch(val);
                            }}
                            onClear={() => {
                                setSearch("");

                            }}
                            autoFocus={true}
                        />
                        <div className='flex flex-col md:flex-row gap-3 w-full md:w-auto'>
                            <div className='flex flex-row gap-2'>
                                <select
                                    className="w-full md:w-35 px-4 py-2.5 pr-8 rounded-xl bg-white dark:bg-zinc-900 border border-gray-200 dark:border-white/10 text-gray-800 dark:text-white shadow-sm appearance-none focus:outline-none focus:ring-2 focus:ring-focus"
                                    onChange={(e) => setSortStatus(e.target.value)}
                                >
                                    <option value="">All Status</option>
                                    <option value="scheduled">Scheduled</option>
                                    <option value="shouted">Shouted</option>
                                    <option value="processing">Processing</option>
                                    <option value="completed">Done</option>
                                    <option value="cancelled">Cancelled</option>
                                </select>
                                <select
                                    className="w-full md:w-35 px-4 py-2.5 pr-8 rounded-xl bg-white dark:bg-zinc-900 border border-gray-200 dark:border-white/10 text-gray-800 dark:text-white shadow-sm appearance-none focus:outline-none focus:ring-2 focus:ring-focus"
                                    value={filterType}
                                    onChange={(e) => setFilterType(e.target.value)}
                                >
                                    <option value="">All</option>
                                    <option value="this_month">This Month</option>
                                    <option value="next_month">Next Month</option>
                                    <option value="last_month">Last Month</option>
                                    <option value="previous_month">Last Month - 1</option>
                                    <option value="custom">Custom Range</option>
                                </select>
                            </div>
                            {filterType === "custom" && (
                                <div className='flex flex-row gap-2'>
                                    <input type="date" value={customFrom} onChange={(e) => setCustomFrom(e.target.value)}
                                        className="w-full md:w-45 px-4 py-2.5 rounded-xl bg-white dark:bg-zinc-900 border border-gray-200 dark:border-white/10 text-gray-800 dark:text-white shadow-sm focus:outline-none focus:ring-2 focus:ring-focus" />
                                    <input type="date" value={customTo} onChange={(e) => setCustomTo(e.target.value)}
                                        className="w-full md:w-45 px-4 py-2.5 rounded-xl bg-white dark:bg-zinc-900 border border-gray-200 dark:border-white/10 text-gray-800 dark:text-white shadow-sm focus:outline-none focus:ring-2 focus:ring-focus" />
                                </div>
                            )}
                        </div>
                    </div>
                </div>

                {/* Table — with in-place loading overlay */}
                <div className="relative">
                    {tableLoading && (
                        <div className="absolute inset-0 z-10 flex items-center justify-center rounded-2xl bg-white/60 dark:bg-black/40 backdrop-blur-sm">
                            <span className="loading loading-spinner w-7 text-neutral-400 dark:text-neutral-500" />
                        </div>
                    )}

                    {events.length === 0 && !tableLoading ? (
                        <p className="grid place-items-center h-40 text-gray-400">No Data to Display</p>
                    ) : (
                        <div className={`rounded-2xl overflow-x-auto border border-gray-200 bg-white shadow-sm dark:border-white/10 dark:bg-[#16181A]/60 dark:backdrop-blur-xl transition-opacity duration-200 mb-4 ${tableLoading ? "opacity-50" : "opacity-100"}`}>
                            <table className="table w-full text-center capitalize">
                                <thead className="border-b border-gray-200 bg-gray-50/50 dark:border-white/10 dark:bg-white/5">
                                    <tr className="font-bold uppercase tracking-widest text-gray-500 dark:text-gray-400">
                                        <th>Event Code</th>
                                        <th>Client</th>
                                        <th>Event</th>
                                        <th>Venue</th>
                                        <th>Date</th>
                                        <th>Status</th>
                                        <th>Payment Status</th>
                                        <th className="text-center">Actions</th>
                                    </tr>
                                </thead>
                                <tbody className='divide-y divide-gray-100 dark:divide-white/5'>
                                    {events.map((e) => (
                                        <React.Fragment key={e.id}>
                                            <tr
                                                className={`transition-colors hover:bg-gray-100/50 dark:hover:bg-white/[0.02] cursor-pointer
                                                    ${expandedRow === e.id ? 'bg-base-200' : ''}
                                                    ${e.status === "cancelled" ? "bg-red-500/5 hover:bg-red-500/20 dark:hover:bg-red-500/40" : ""}`}
                                                onClick={() => {
                                                    if (role !== "ADMIN") return;
                                                    if (e.total_amount == 0) return;
                                                    if (expandedRow === e.id) {
                                                        setExpandedRow(null);
                                                        setTransactionData([]);
                                                    } else {
                                                        setExpandedRow(e.id);
                                                        getTransaction(e.payId);
                                                        if (e.total_amount != 0 && e.status === "cancelled") {
                                                            showToast(`Refund the transaction amount to ${e.client_name} and set total amount 0`, "alert-warning");
                                                        }
                                                    }
                                                }}
                                            >
                                                <td className="font-mono text-sm text-core">{e.event_code}</td>
                                                <td onClick={(ev) => { ev.stopPropagation(); navigate(`/clients/${e.client_id}`); }}>
                                                    <div className="font-semibold text-gray-900 dark:text-white truncate tooltip tooltip-info" data-tip={e.client_name}>
                                                        <p className="text-base">
                                                            {e.client_name}
                                                            {/* {e.client_name.length > 12 ? e.client_name.slice(0, 12) + "..." : e.client_name} */}
                                                        </p>
                                                    </div>
                                                    <div className="text-xs text-base-content/40">{e.client_phone}</div>
                                                </td>
                                                <td>{e.photography_type}</td>
                                                <td>{e.location}</td>
                                                <td>
                                                    <div className="flex flex-col">
                                                        <p>{e.event_date}</p>
                                                        <p>{e.event_time.slice(0, 5)}</p>
                                                    </div>
                                                </td>
                                                <td className="max-w-55">
                                                    <ul className="steps w-full">
                                                        {e.status === "cancelled" ? (
                                                            <li className="step step-error" data-content="✕">Cancelled</li>
                                                        ) : (
                                                            statusUi.map((step, idx) => {
                                                                const currentIndex = statusUi.findIndex(s => s.statusSteps === e.status);
                                                                return (
                                                                    <li key={step.statusSteps} className={`step ${idx <= currentIndex ? "step-primary" : ""}`}>
                                                                        <span className="step-icon text-xl">{step.statusIcon}</span>
                                                                        {step.statusvalue}
                                                                    </li>
                                                                );
                                                            })
                                                        )}
                                                    </ul>
                                                </td>
                                                <td>
                                                    {e.status === "cancelled" ? (
                                                        <p className={`inline-block px-3 py-1 rounded-full text-sm font-medium ${e.total_amount > 0 ? "bg-orange-500/90" : "bg-red-600/90"} text-white capitalize`}>{e.total_amount > 0 ? "Refund" : "Cancelled"}</p>
                                                    ) : (
                                                        <p className={`inline-block px-3 py-1 rounded-full text-sm font-medium ${statusStyles[e.pay_status]}`}>
                                                            {e.pay_status.charAt(0).toUpperCase() + e.pay_status.slice(1)}
                                                        </p>
                                                    )}
                                                </td>
                                                <td>
                                                    <div className="flex gap-3 justify-center">
                                                        <button
                                                            className="flex items-center justify-center w-10 h-10 rounded-full transition-all duration-200 bg-gray-100 border border-gray-200 text-lime-600 hover:bg-lime-600 hover:text-white dark:bg-white/5 dark:border-white/10 dark:text-lime-500 dark:hover:bg-lime-600 dark:hover:text-white"
                                                            onClick={(ev) => { ev.stopPropagation(); setShowModelEventDetail(true); setModifyDetail(e); }}>
                                                            <FaEye className="w-5 h-5" />
                                                        </button>
                                                        <button
                                                            className="flex items-center justify-center w-10 h-10 rounded-full transition-all duration-200 bg-gray-100 border border-gray-200 text-yellow-600 hover:bg-yellow-600 hover:text-white dark:bg-white/5 dark:border-white/10 dark:text-yellow-500 dark:hover:bg-yellow-600 dark:hover:text-white"
                                                            onClick={(ev) => { ev.stopPropagation(); setModifyDetail(e); setShowModelModifyEvent(true); }}>
                                                            <MdEdit className="h-5 w-5" />
                                                        </button>
                                                        <button
                                                            className="flex items-center justify-center w-10 h-10 rounded-full transition-all duration-200 bg-gray-100 border border-gray-200 text-rose-600 hover:bg-rose-600 hover:text-white dark:bg-white/5 dark:border-white/10 dark:text-rose-500 dark:hover:bg-rose-600 dark:hover:text-white"
                                                            onClick={(ev) => { ev.stopPropagation(); deleteEvent(e.id); }}>
                                                            <MdDeleteOutline className="w-5 h-5" />
                                                        </button>
                                                    </div>
                                                </td>
                                            </tr>
                                            {expandedRow === e.id && role === "ADMIN" && (
                                                <tr className="bg-base-200">
                                                    <td colSpan="9" className="p-4">
                                                        <TransactionCard
                                                            transactionDataList={transactionData}
                                                            refresh={[fetchEvents, () => getTransaction(e.payId)]}
                                                            paymentDetail={e}
                                                            showToast={showToast}
                                                        />
                                                    </td>
                                                </tr>
                                            )}
                                        </React.Fragment>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    )}
                </div>
                {/* Pagination */}
                {totalPages > 1 && (
                    <div className="flex items-center justify-center mt-8 px-2 select-none">
                        <div className="flex items-center gap-1 p-1.5 bg-white/40 dark:bg-white/[0.08] backdrop-blur-2xl rounded-full border border-white/40 dark:border-white/10 shadow-[0_8px_32px_rgba(0,0,0,0.1)] dark:shadow-[0_16px_48px_rgba(0,0,0,0.4)]">
                            <button
                                onClick={() => setCurrentPage(p => p - 1)}
                                disabled={currentPage <= 1}
                                className="w-9 h-9 flex items-center justify-center rounded-full text-gray-600 dark:text-white/70 hover:bg-gray-200/50 dark:hover:bg-white/10 disabled:opacity-20 transition-all duration-300 active:scale-90"
                            >
                                <span className="text-xl leading-none mb-1">‹</span>
                            </button>
                            <div className="flex items-center gap-1">
                                {getPaginationPages(currentPage, totalPages).map((p, i) =>
                                    p === "..." ? (
                                        <span key={`ellipsis-${i}`} className="w-6 text-center text-gray-400 dark:text-white/30 tracking-tighter">•••</span>
                                    ) : (
                                        <button
                                            key={p}
                                            onClick={() => setCurrentPage(p)}
                                            className={`relative w-9 h-9 flex items-center justify-center rounded-full text-sm font-semibold transition-all duration-300
                                                ${currentPage === p
                                                    ? "text-white scale-105"
                                                    : "text-gray-600 dark:text-white/60 hover:text-gray-900 dark:hover:text-white hover:bg-gray-200/50 dark:hover:bg-white/10"
                                                }`}
                                        >
                                            {currentPage === p && (
                                                <div className="absolute inset-0 bg-core rounded-full -z-10 animate-in zoom-in-75 duration-300" />
                                            )}
                                            {p}
                                        </button>
                                    )
                                )}
                            </div>
                            <button
                                onClick={() => setCurrentPage(p => p + 1)}
                                disabled={!hasNext}
                                className="w-9 h-9 flex items-center justify-center rounded-full text-gray-600 dark:text-white/70 hover:bg-gray-200/50 dark:hover:bg-white/10 disabled:opacity-20 transition-all duration-300 active:scale-90"
                            >
                                <span className="text-xl leading-none mb-1">›</span>
                            </button>
                        </div>
                    </div>
                )}
            </div>
            {showModalEvent && (
                <AddEventModal fetchEvents={[() => fetchEvents(currentPage)]} setShowModalEvent={setShowModalEvent} showToast={showToast} />
            )}
            {showModelModifyEvent && (
                <EditEventModal fetchEvents={() => fetchEvents(currentPage)} ModifyDetail={ModifyDetail} setModifyDetail={setModifyDetail} setShowModelModifyEvent={setShowModelModifyEvent} showToast={showToast} />
            )}
            {showModelEventDetail && (
                <EventDetail viewEventDetail={ModifyDetail} setViewEventDetail={setModifyDetail} setShowEventModel={setShowModelEventDetail} />
            )}
        </>
    );
};

export default ListEvents;