import React, { useEffect, useState, useRef } from 'react'
import { FetchPayments, FetchTransaction } from '../../api/PaymentServices';
import AddTotalPayment from './AddTotalPayment';
import './Payment.css'
import AddTransaction from './AddTransaction';
import { useNavigate } from 'react-router-dom';
import TransactionCard from './TransactionCard';
import Toast from '../../components/Toast';
import SearchBox from "../../components/SearchBox"
import Button from "../../components/Button"
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

const PaymentList = () => {
    const navigate = useNavigate();
    const inputRef = useRef(null);
    const [toast, setToast] = useState(null);
    const [search, setSearch] = useState("");
    const [status, setStatus] = useState("");
    const [fromDate, setFromDate] = useState("");
    const [toDate, setToDate] = useState("");
    const [monthFilter, setMonthFilter] = useState("");
    const [payments, setPayments] = useState([]);
    const [totalCount, setTotalCount] = useState(0);
    const [hasNext, setHasNext] = useState(false);
    const [page, setPage] = useState(1);
    const [expandedRow, setExpandedRow] = useState(null);
    const [transactionData, setTransactionData] = useState([]);
    const [showModelEditPayment, setShowModelEditPayment] = useState(false);
    const [editData, setEditData] = useState(null);
    const [showAddModal, setShowAddModal] = useState(false);
    const [selectedPayment, setSelectedPayment] = useState(null);
    const [cancelStatus, setCancelStatus] = useState("");
    const [tableLoading, setTableLoading] = useState(false);
    const [transactionLoading , setTransactionLoading] = useState(false);
    const totalPages = totalCount > 0 ? Math.ceil(totalCount / PAGE_SIZE) : 1;
    const showToast = (msg, color) => {
        setToast({ msg, color });
        setTimeout(() => setToast(null), 5000);
    };

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

    const getMonthRange = (type) => {
        const now = new Date();
        let start, end;
        switch (type) {
            case "this":
                start = new Date(now.getFullYear(), now.getMonth(), 1);
                end = new Date(now.getFullYear(), now.getMonth() + 1, 0);
                break;

            case "last":
                start = new Date(now.getFullYear(), now.getMonth() - 1, 1);
                end = new Date(now.getFullYear(), now.getMonth(), 0);
                break;

            case "last2": // two months ago
                start = new Date(now.getFullYear(), now.getMonth() - 2, 1);
                end = new Date(now.getFullYear(), now.getMonth() - 1, 0);
                break;

            case "next":
                start = new Date(now.getFullYear(), now.getMonth() + 1, 1);
                end = new Date(now.getFullYear(), now.getMonth() + 2, 0);
                break;

            default:
                return null;
        }

        return {
            start: start.toISOString().split("T")[0],
            end: end.toISOString().split("T")[0],
        };
    };

    const getTransaction = async (id) => {
        try {
            setTransactionLoading(true);
            const res = await FetchTransaction(id);
            setTransactionData(res.data.results || res.data);
        } catch (err) {
            console.error("Error fetching transactions:", err);
            showToast(err, "alert-error");
        }
        finally{
            setTransactionLoading(false);
        }
    };

    const fetchPayment = async (p = page) => {
        try {
            setTableLoading(true);
            const params = { page: p, page_size: PAGE_SIZE };
            if (search) params.search = search;
            if (status) params.status = status;
            if (monthFilter === "custom" && fromDate && toDate) {
                params.event_date__gte = fromDate;
                params.event_date__lte = toDate;
            } else if (monthFilter === "this" || monthFilter === "last" || monthFilter === "last2" || monthFilter === "next") {
                const range = getMonthRange(monthFilter);
                params.event_date__gte = range.start;
                params.event_date__lte = range.end;
            }
            const res = await FetchPayments(params);
            if (res.data.results !== undefined) {
                setPayments(res.data.results);
                setTotalCount(res.data.count || 0);
                setHasNext(!!res.data.next);
            } else {
                setPayments(res.data);
                setTotalCount(res.data.length);
                setHasNext(false);
            }
        } catch (err) {
            console.error("Error fetching payments:", err);
            showToast(err, "alert-error");
        } finally {
            setTableLoading(false);
        }
    };

    useEffect(() => {
        setPage(1);
        fetchPayment(1);
    }, [search, status, monthFilter, fromDate, toDate]);

    // Page changes (skip when page was just reset to 1 by filter change)
    const prevPage = useRef(1);
    useEffect(() => {
        if (page === prevPage.current) return;
        prevPage.current = page;
        fetchPayment(page);
    }, [page]);

    const statusStyles = {
        partial: "bg-yellow-500/20 text-yellow-400",
        pending: "bg-red-400/20 text-red-600",
        paid: "bg-green-300/20 text-green-600",
    };

    return (
        <>
            {toast && <Toast msg={toast.msg} color={toast.color} />}
            <div className="mx-auto bg-gray-50 dark:bg-[#0B0C0E] shadow-xl p-3 py-0 min-h-screen">
                <div className="breadcrumbs text-xs font-normal">
                    <ul>
                        <li><a onClick={() => navigate('/')} className='no-underline hover:no-underline hover:text-bread'>Home</a></li>
                        <li><a className='text-bread no-underline hover:no-underline'>Payments</a></li>
                    </ul>
                </div>
                <div className="my-1 mb-4 flex flex-col gap-1">
                    <div className='flex flex-row justify-between'>
                        <h1 className="text-3xl md:text-4xl font-semibold text-neutral-900 dark:text-white tracking-tight">Payments</h1>
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
                        <div className='flex flex-col md:flex-row gap-0 w-full justify-end'>
                            <div className='flex flex-row gap-2'>
                                <select
                                    className="w-full md:w-35 px-4 py-2.5 rounded-xl bg-white dark:bg-zinc-900 border border-gray-200 dark:border-white/10 text-gray-800 dark:text-white shadow-sm appearance-none focus:outline-none focus:ring-2 focus:ring-focus"
                                    value={status}
                                    onChange={(e) => setStatus(e.target.value)}
                                >
                                    <option value="">All Status</option>
                                    <option value="paid">Paid</option>
                                    <option value="partial">Partial</option>
                                    <option value="pending">Pending</option>

                                </select>
                                <select
                                    className="w-full md:w-35 px-4 py-2.5 rounded-xl bg-white dark:bg-zinc-900 border border-gray-200 dark:border-white/10 text-gray-800 dark:text-white shadow-sm appearance-none focus:outline-none focus:ring-2 focus:ring-focus"
                                    value={monthFilter}
                                    onChange={(e) => {
                                        setMonthFilter(e.target.value);
                                        setFromDate("");
                                        setToDate("");
                                    }}
                                >
                                    <option value="">All Time</option>
                                    <option value="this">This Month</option>
                                    <option value="next">Next Month</option>
                                    <option value="last">Last Month</option>
                                    <option value="last2">Last Month - 1</option>
                                    <option value="custom">Custom Range</option>
                                </select>
                            </div>

                            {monthFilter === "custom" && (
                                <div className='flex flex-row gap-2'>
                                    <input type="date" value={fromDate} onChange={(e) => setFromDate(e.target.value)}
                                        className="ml-0 lg:ml-2 w-full md:w-45 px-4 py-2.5 rounded-xl bg-white dark:bg-zinc-900 border border-gray-200 dark:border-white/10 text-gray-800 dark:text-white shadow-sm appearance-none focus:outline-none focus:ring-2 focus:ring-focus" />
                                    <input type="date" value={toDate} onChange={(e) => setToDate(e.target.value)}
                                        className="w-full md:w-45 px-4 py-2.5 rounded-xl bg-white dark:bg-zinc-900 border border-gray-200 dark:border-white/10 text-gray-800 dark:text-white shadow-sm appearance-none focus:outline-none focus:ring-2 focus:ring-focus" />
                                </div>
                            )}
                        </div>
                    </div>
                </div>

                {/* Table — with in-place loading overlay */}
                <div className="relative">
                    {tableLoading && (
                        <div className="absolute inset-0 z-10 flex items-center justify-center rounded-2xl bg-white/60 dark:bg-black/40 backdrop-blur-sm">
                            <span className="loading loading-spinner w-7 text-core" />
                        </div>
                    )}

                    {payments.length === 0 && !tableLoading ? (
                        <p className="text-center text-gray-400 py-10">No Data to Display</p>
                    ) : (
                        <div className={`mb-4 rounded-2xl overflow-x-auto border border-gray-200 bg-white shadow-sm dark:border-white/10 dark:bg-[#16181A]/60 dark:backdrop-blur-xl transition-opacity duration-200 ${tableLoading ? "opacity-50" : "opacity-100"}`}>
                            <table className="table w-full text-center capitalize">
                                <thead className="border-b border-gray-200 bg-gray-50/50 dark:border-white/10 dark:bg-white/5">
                                    <tr className="font-bold uppercase tracking-widest text-gray-500 dark:text-gray-400">
                                        <th>Event Code</th>
                                        <th>Client Details</th>
                                        <th>Event Info</th>
                                        <th>Total</th>
                                        <th>Remaining</th>
                                        <th>Paid</th>
                                        <th>Payment Status</th>
                                        <th className='w-20'>Payment Action</th>
                                    </tr>
                                </thead>
                                <tbody className='divide-y divide-gray-100 dark:divide-white/5'>
                                    {payments.map((p) => (
                                        <React.Fragment key={p.id}>
                                            <tr
                                                className={`transition-colors cursor-pointer
                                                    ${expandedRow === p.id ? 'bg-base-200' : ''}
                                                    ${p.event_status === "cancelled" ? 'bg-red-200/40 dark:bg-red-900/40 hover:bg-red-200 dark:hover:bg-red-950' : 'hover:bg-gray-100/50 dark:hover:bg-white/[0.02]'}`}
                                                onClick={() => {
                                                    if (p.total_amount == 0) return;
                                                    if (expandedRow === p.id) {
                                                        setExpandedRow(null);
                                                        setTransactionData([]);
                                                    } else {
                                                        if (p.total_amount != 0 && p.event_status === "cancelled") {
                                                            showToast(`Refund the transaction amount to ${p.client_name} and set total amount 0`, "alert-warning");
                                                        }
                                                        setExpandedRow(p.id);
                                                        getTransaction(p.id);
                                                    }
                                                }}
                                            >
                                                <td className="font-mono text-sm text-core">{p.event_code}</td>
                                                <td onClick={(e) => { e.stopPropagation(); navigate(`/clients/${p.client_id}`); }}>
                                                    <p className="text-md font-semibold text-gray-900 dark:text-white">
                                                        {/* {p.client_name.length > 12 ? p.client_name.slice(0, 12) + "..." : p.client_name} */}
                                                    {p.client_name}
                                                    </p>
                                                    <div className="text-sm opacity-70 text-secondary2">{p.client_phone}</div>
                                                </td>
                                                <td>
                                                    <div className="capitalize">{p.photography_type}</div>
                                                    <div className="text-sm opacity-90 text-blue-400">{p.event_date}</div>
                                                </td>
                                                <td className='font-bold'>₹{p.total_amount}</td>
                                                <td className='text-red-500 font-bold'>₹{p.balance_amount}</td>
                                                <td className='text-green-500 font-bold'>₹{p.total_paid}</td>
                                                <td>
                                                    {p.event_status === "cancelled" ? (
                                                        <p className={`inline-block px-3 py-1 rounded-full text-sm font-medium ${p.total_amount > 0 ? "bg-orange-500/90" : "bg-red-600/90"} text-white capitalize`}>{p.total_amount > 0 ? "Refund" : "Cancelled"}</p>
                                                    ) : (
                                                        <p className={`inline-block px-3 py-1 rounded-full text-sm font-medium ${statusStyles[p.status]} capitalize`}>
                                                            {p.status}
                                                        </p>
                                                    )}
                                                </td>
                                                <td>
                                                    <div className="flex flex-col gap-2">
                                                        {!((p.total_amount == p.total_paid) > p.balance_amount) && (
                                                           
                                                            <Button
                                                                text="Add Amount"
                                                                bg="bg-lime-500"
                                                                hoverBg="hover:bg-lime-600"
                                                                hidden={p.event_status === "cancelled"}
                                                                disabled={p.total_amount == p.total_paid || p.event_status === "cancelled"}
                                                                onClick={(e) => {
                                                                    e.stopPropagation();
                                                                    setSelectedPayment(p);
                                                                    setShowAddModal(true);
                                                                }}
                                                            />
                                                        )}
                                                        
                                                        <Button
                                                            logo={
                                                                p.event_status === "cancelled" ? null : Number(p.total_amount) > 0 && Number(p.total_amount) === Number(p.total_paid) && Number(p.balance_amount) === 0
                                                                        ? null
                                                                        // <IoMdCheckmark />
                                                                        : Number(p.total_amount) > 0
                                                                            ?  
                                                                            null
                                                                            // <MdEdit />
                                                                            : null
                                                                            // <FaPlus/>
                                                            }
                                                            text={p.event_status === "cancelled" ? "Refund Amount" : Number(p.total_amount) > 0 && Number(p.total_amount) === Number(p.total_paid) && Number(p.balance_amount) === 0 ? "Payment Done" : Number(p.total_amount) > 0 ? "Modify Payment" : "Set Payment"}
                                                            bg={p.event_status === "cancelled" ? "bg-orange-500" : Number(p.total_amount) > 0 && Number(p.total_amount) === Number(p.total_paid) && Number(p.balance_amount) === 0 ? "bg-green-500" : Number(p.total_amount) > 0 ? "bg-amber-500" : "bg-rose-500"}
                                                            hoverBg={p.event_status === "cancelled" ? "hover:bg-red-600": Number(p.total_amount) > 0 && Number(p.total_amount) === Number(p.total_paid) && Number(p.balance_amount) === 0 ? "hover:bg-green-600": Number(p.total_amount) > 0 ? "hover:bg-amber-600": "hover:bg-rose-600"}
                                                            hidden={p.event_status === "cancelled" && (p.total_paid == 0 && p.total_amount == 0 && p.balance_amount == 0)}
                                                            onClick={(e) => { e.stopPropagation(); setEditData(p); setShowModelEditPayment(true); setCancelStatus(p.event_status === "cancelled"); }}
                                                        />
                                                    </div>
                                                </td>
                                            </tr>

                                            {expandedRow === p.id && (
                                                <tr className="bg-base-200">
                                                    <td colSpan="9" className="p-4">
                                                        <TransactionCard
                                                            transactionDataList={transactionData}
                                                            refresh={[fetchPayment, () => getTransaction(p.id)]}
                                                            paymentDetail={p}
                                                            showToast={showToast}
                                                            transactionLoading={transactionLoading}
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
                    <div className="flex items-center justify-center mt-8 px-2">
                        <div className="flex items-center gap-1 p-1.5 bg-white/40 dark:bg-white/[0.08] backdrop-blur-2xl rounded-full border border-white/40 dark:border-white/10 shadow-[0_8px_32px_rgba(0,0,0,0.1)] dark:shadow-[0_16px_48px_rgba(0,0,0,0.4)]">
                            <button
                                onClick={() => setPage(p => p - 1)}
                                disabled={page <= 1}
                                className="w-9 h-9 flex items-center justify-center rounded-full text-gray-600 dark:text-white/70 hover:bg-gray-200/50 dark:hover:bg-white/10 disabled:opacity-20 transition-all duration-300 active:scale-90"
                            >
                                <span className="text-xl leading-none mb-1">‹</span>
                            </button>

                            <div className="flex items-center gap-1">
                                {getPaginationPages(page, totalPages).map((p, i) =>
                                    p === "..." ? (
                                        <span key={`ellipsis-${i}`} className="w-8 text-center text-gray-400 dark:text-white/30 text-xs">•••</span>
                                    ) : (
                                        <button
                                            key={p}
                                            onClick={() => setPage(p)}
                                            className={`relative w-9 h-9 flex items-center justify-center rounded-full text-sm font-semibold transition-all duration-500
                                                ${page === p
                                                    ? "text-white scale-110"
                                                    : "text-gray-600 dark:text-white/60 hover:text-gray-900 dark:hover:text-white hover:bg-gray-200/50 dark:hover:bg-white/10"
                                                }`}
                                        >
                                            {page === p && (
                                                <div className="absolute inset-0 bg-core rounded-full -z-10 animate-in zoom-in duration-300" />
                                            )}
                                            {p}
                                        </button>
                                    )
                                )}
                            </div>

                            <button
                                onClick={() => setPage(p => p + 1)}
                                disabled={!hasNext}
                                className="w-9 h-9 flex items-center justify-center rounded-full text-gray-600 dark:text-white/70 hover:bg-gray-200/50 dark:hover:bg-white/10 disabled:opacity-20 transition-all duration-300 active:scale-90"
                            >
                                <span className="text-xl leading-none mb-1">›</span>
                            </button>
                        </div>
                    </div>
                )}
            </div>

            {showModelEditPayment && (
                <AddTotalPayment
                    fetchPayment={fetchPayment}
                    Data={editData}
                    payId={editData.id}
                    totalAmount={editData.total_amount}
                    setShowModelEditPayment={setShowModelEditPayment}
                    getTransaction={getTransaction}
                    cancelStatus={cancelStatus}
                    showToast={showToast}
                />
            )}

            {showAddModal && (
                <AddTransaction
                    paymentId={selectedPayment.id}
                    paymentData={selectedPayment}
                    setShowAddModal={setShowAddModal}
                    fetchPayment={fetchPayment}
                    getTransaction={getTransaction}
                    showToast={showToast}
                />
            )}
        </>
    );
};

export default PaymentList;