import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { ViewClient } from "../../api/ClientServices";
import { ClientEvent } from "../../api/EventServices";
import EditEventModal from "../Events/EditEventModal";
import ClientForm from './ClientForm';
import AddTotalPayment from "../Payments/AddTotalPayment";
import EventDetail from "../Events/EventDetail";
import AddTransaction from '../Payments/AddTransaction';
import TransactionCard from "../Payments/TransactionCard";
import { FetchTransaction } from "../../api/PaymentServices";
import { AiOutlineSchedule } from "react-icons/ai";
import { TbCapture } from "react-icons/tb";
import { RiComputerFill } from "react-icons/ri";
import { TiTick } from "react-icons/ti";
import { PiIdentificationCard } from "react-icons/pi";
import { IoMailUnread } from "react-icons/io5";
import { FaLocationDot, FaMobileRetro, FaPhoneVolume} from "react-icons/fa6";
import { ImWhatsapp } from "react-icons/im";
import { MdEdit} from "react-icons/md";
import { useAuth } from "../../context/AuthContext";
import Toast from "../../components/Toast";
import Button from "../../components/Button"

const ClientDetail = () => {
    const { role } = useAuth();
    const navigate = useNavigate();
    const { id } = useParams();

    const [toast, setToast] = useState(null);
    const [client, setClient] = useState(null);
    const [events, setEvents] = useState([]);

    // Full-screen spinner on first load only
    const [initialLoading, setInitialLoading] = useState(true);

    const [showModelModifyEvent, setShowModelModifyEvent] = useState(false);
    const [editClientModal, setEditClientModal] = useState(false);
    const [ModifyDetail, setModifyDetail] = useState(null);
    const [showEventModel, setShowEventModel] = useState(false);
    const [viewEventDetail, setViewEventDetail] = useState([]);
    const [target, setTarget] = useState(null);
    const [showAddTotalModal, setShowAddTotalModal] = useState(false);
    const [showAddTransactionModal, setShowAddTransactionModal] = useState(false);
    const [expandedRow, setExpandedRow] = useState(null);
    const [cancelStatus, setCancelStatus] = useState("");
    const [transactionData, setTransactionData] = useState([]);
    const [transactionLoading , setTransactionLoading] = useState(false);
    const showToast = (msg, color) => {
        setToast({ msg, color });
        setTimeout(() => setToast(null), 5000);
    };

    const statusSteps = ["scheduled", "shouted", "processing", "completed"];
    const statusValue = ["scheduled", "shouted", "processing", "done"];
    const statusIcon = [<AiOutlineSchedule />, <TbCapture />, <RiComputerFill />, <TiTick />];

    const statusStyles = {
        partial: "bg-yellow-500/20 text-yellow-400",
        pending: "bg-red-400/20 text-red-600",
        paid: "bg-green-300/20 text-green-600",
    };

    const fetchData = async (isFirstLoad = false) => {
        if (isFirstLoad) setInitialLoading(true);
        try {
            const [clientRes, eventRes] = await Promise.all([
                ViewClient(id),
                ClientEvent(id),
            ]);
            setClient(clientRes.data);
            setEvents(eventRes.data.results);
        } catch (err) {
            console.error(err);
            showToast("Failed to load client data", "alert-error");
        } finally {
            setInitialLoading(false);
        }
    };

    useEffect(() => {
        fetchData(true);
    }, [id]);

    const getTransaction = async (payId) => {
        try {
            setTransactionLoading(true);
            const res = await FetchTransaction(payId);
            setTransactionData(res.data.results || res.data);
        } catch (err) {
            console.error("Error fetching transactions:", err);
        }finally{
            setTransactionLoading(false);
        }
    };

    const formatDateTime = (dateString) => {
        const d = new Date(dateString);
        const year = d.getFullYear();
        const month = String(d.getMonth() + 1).padStart(2, "0");
        const day = String(d.getDate()).padStart(2, "0");
        const hours = String(d.getHours()).padStart(2, "0");
        const minutes = String(d.getMinutes()).padStart(2, "0");
        return `${year}-${month}-${day} ${hours}:${minutes}`;
    };

    // Full-screen spinner — first load only
    if (initialLoading) return (
        <div className="flex items-center justify-center min-h-screen bg-[#F5F5F7] dark:bg-[#000000]">
            <span className="loading loading-spinner w-8 lg:w-10 text-core" />
        </div>
    );

    return (
        <>
            {toast && <Toast msg={toast.msg} color={toast.color} />}

            <div className="mx-auto bg-gray-50 dark:bg-[#0B0C0E] shadow-xl p-3 py-0  min-h-screen">
                <div className="breadcrumbs text-sm mb-4">
                    <ul>
                        <li><a onClick={() => navigate('/')} className="no-underline hover:no-underline hover:text-bread">Home</a></li>
                        <li><a onClick={() => navigate('/clients')} className="no-underline hover:no-underline hover:text-bread">Manage Clients</a></li>
                        <li><a className="capitalize text-bread no-underline hover:no-underline">{client.client_code}</a></li>
                    </ul>
                </div>

                {/* Client card */}
                <div className="flex flex-col gap-8 p-4 md:p-6 border border-gray-200 bg-gray-100/20 shadow-lg rounded-2xl dark:border-white/10 dark:bg-[#16181A]/60">
                    {/* Header row */}
                    <div className="flex flex-col md:flex-row justify-between items-center gap-4 pb-6 border-b border-base-300">
                        <div className="flex items-center gap-4">
                            <div className="avatar placeholder">
                                <div className="bg-core text-white rounded-full w-16 flex items-center justify-center text-4xl font-bold leading-none pb-1 capitalize">
                                    {client.name.slice(0, 2)}
                                </div>
                            </div>
                            <div className="relative">
                                <h1 className="text-2xl font-bold text-base-content uppercase">{client.name}</h1>
                                <div className="flex gap-3">
                                    <div className="flex items-center gap-2 opacity-60">
                                        <PiIdentificationCard className="text-lg" />
                                        <span className="text-sm font-medium tracking-wide uppercase">{client.client_code}</span>
                                    </div>
                                    <div className="cursor-pointer hover:opacity-70 pt-1" onClick={() => setEditClientModal(true)}>
                                        <button className="text-amber-500 text-lg rounded-xs"><MdEdit /></button>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div className="flex flex-row gap-2">
                            <div className="px-3 py-3 border-none bg-auxillary text-white gap-2 rounded-full hover:scale-105">
                                <a href={`tel:+91${client.phone}`} target="_blank" rel="noreferrer">
                                    <FaPhoneVolume className="text-2xl" />
                                </a>
                            </div>
                            <div className="px-3 py-3 border-none bg-lime-500 text-white gap-2 rounded-full hover:scale-105">
                                <a href={`https://wa.me/91${client.phone}`} target="_blank" rel="noreferrer">
                                    <ImWhatsapp className="text-2xl" />
                                </a>
                            </div>
                            <div className="px-3 py-3 border-none bg-indigo-500 text-white rounded-full hover:scale-105">
                                <a href={`mailto:${client.email}`} target="_blank" rel="noreferrer">
                                    <IoMailUnread className="text-2xl" />
                                </a>
                            </div>
                        </div>
                    </div>

                    {/* Details grid */}
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                        <div className="space-y-6">
                            <h3 className="text-xs font-bold uppercase tracking-widest text-base-content/50">Details</h3>
                            <div className="space-y-4">
                                <div className="flex items-start gap-4">
                                    <div className="p-2 bg-base-200 rounded-lg"><FaMobileRetro className="text-auxillary/50" /></div>
                                    <div>
                                        <span className="block text-xs font-bold opacity-50 uppercase">Phone</span>
                                        <p className="font-medium">{client.phone}</p>
                                    </div>
                                </div>
                                <div className="flex items-start gap-4">
                                    <div className="p-2 bg-base-200 rounded-lg"><FaLocationDot className="text-auxillary/50" /></div>
                                    <div>
                                        <span className="block text-xs font-bold opacity-50 uppercase">Location</span>
                                        <p className="font-medium">{client.place}</p>
                                    </div>
                                </div>
                                <div className="flex items-start gap-4">
                                    <div className="p-2 bg-base-200 rounded-lg"><IoMailUnread className="text-auxillary/50" /></div>
                                    <div className="overflow-hidden">
                                        <span className="block text-xs font-bold opacity-50 uppercase">Email Address</span>
                                        <p className="font-medium truncate">{client.email}</p>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div className="lg:col-span-2 grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="bg-base-200/50 p-5 rounded-xl border border-base-300">
                                <span className="text-xs font-bold uppercase opacity-50 block mb-2">Address</span>
                                <p className={`text-sm leading-relaxed whitespace-pre-wrap ${!client.address ? "text-base-content/50" : "text-base-content"}`}>{client.address || "No address provided"}</p>
                            </div>
                            <div className="bg-base-200/50 p-5 rounded-xl border border-base-300">
                                <span className="text-xs font-bold uppercase opacity-50 block mb-2">Notes</span>
                                <p className={`text-sm leading-relaxed whitespace-pre-wrap ${!client.notes ? "text-base-content/50" : "text-base-content"}`}>{client.notes || "No additional notes"}</p>
                            </div>
                        </div>
                    </div>

                    {/* Footer meta */}
                    <div className="flex flex-row justify-between w-full gap-4 mt-6 pt-4 border-t border-base-300/50">
                        <div className="text-xs">
                            <span className="opacity-50 block uppercase font-bold tracking-tighter">Created By</span>
                            <span className="font-semibold text-primary">{client.created_by_name || "Admin"}</span>
                            <br />
                            <span className="opacity-60">{formatDateTime(client.created_at)}</span>
                        </div>
                        <div className="text-xs text-right">
                            <span className="opacity-50 block uppercase font-bold tracking-tighter">Updated By</span>
                            <span className="font-semibold text-auxillary">{client.updated_by_name || "Admin"}</span>
                            <br />
                            <span className="opacity-60">{formatDateTime(client.updated_at)}</span>
                        </div>
                    </div>
                </div>

                {/* Events section */}
                <div className="mt-10">
                    <div className="flex flex-row justify-between mb-3 px-2">
                        <div className="text-xl font-semibold">Total Events</div>
                        <div className="text-xl font-bold text-core">{events?.length || 0}</div>
                    </div>

                    {events.length > 0 ? (
                        <div className="mb-5 rounded-2xl overflow-x-auto border border-gray-200 bg-white shadow-sm dark:border-white/10 dark:bg-[#16181A]/60 dark:backdrop-blur-xl">
                            <table className="table w-full text-center capitalize">
                                <thead className="border-b border-gray-200 bg-gray-50/50 dark:border-white/10 dark:bg-white/5">
                                    <tr className="font-bold uppercase tracking-widest text-gray-500 dark:text-gray-400">
                                        <th>Event Code</th>
                                        <th>Event</th>
                                        <th>Date</th>
                                        <th>Time</th>
                                        <th>Venue</th>
                                        <th className="min-w-85">Status</th>
                                        {role === "ADMIN" && <th>Payment Details</th>}
                                        <th>Payment Status</th>
                                        <th className="text-center min-w-43  w-40">Action</th>
                                    </tr>
                                </thead>
                                <tbody className='divide-y divide-gray-100 dark:divide-white/5'>
                                    {events.map((event) => (
                                        <React.Fragment key={event.id}>
                                            <tr className={`transition-colors cursor-pointer
                                                    ${expandedRow === event.id ? 'bg-base-200' : ''}
                                                    ${event.status === "cancelled" ? "bg-red-200/40 dark:bg-red-900/40 hover:bg-red-200 dark:hover:bg-red-950" : "hover:bg-gray-100/50 dark:hover:bg-white/[0.02]"}`}
                                                
                                                onClick={ role === "ADMIN" ? () => {
                                                    if (event.total_amount == 0) return;
                                                    if (expandedRow === event.id) {
                                                        setExpandedRow(null);
                                                        setTransactionData([]);
                                                    } else {
                                                        if (event.total_amount != 0 && event.status === "cancelled") {
                                                            showToast(`Refund the transaction amount to ${event.client_name} and set total amount 0`, "alert-warning");
                                                        }
                                                        setExpandedRow(event.id);
                                                        getTransaction(event.payId);
                                                    }
                                                } : undefined }
                                            >
                                                <td className="font-mono text-sm text-core">{event.event_code}</td>
                                                <td className="font-semibold text-gray-900 dark:text-white truncate">{event.photography_type}</td>
                                                <td>{event.event_date}</td>
                                                <td>{event.event_time.slice(0, -3)}</td>
                                                <td>{event.location}</td>
                                                <td className="w-50">
                                                    <ul className="steps w-full">
                                                        {event.status === "cancelled" ? (
                                                            <li className="step step-error" data-content="✕">Cancelled</li>
                                                        ) : (
                                                            statusSteps.map((step, index) => {
                                                                const currentIndex = statusSteps.indexOf(event.status);
                                                                return (
                                                                    <li key={step} className={`step ${index <= currentIndex ? "step-primary" : ""}`}>
                                                                        <span className="step-icon text-xl">{statusIcon[index]}</span>
                                                                        {statusValue[index]}
                                                                    </li>
                                                                );
                                                            })
                                                        )}
                                                    </ul>
                                                </td>

                                                {role === "ADMIN" && (
                                                    <td>
                                                      
                                                        {event.total_amount > 0 || event.total_paid > 0 ? (
                                                            <div className="text-sm space-y-1">
                                                                <div className="flex justify-between">
                                                                    <span>Total</span>
                                                                    <span className="text-blue-400 font-semibold">₹{event.total_amount}</span>
                                                                </div>
                                                                <div className="flex justify-between">
                                                                    <span>Paid</span>
                                                                    <span className="text-green-400 font-semibold">₹{event.total_paid}</span>
                                                                </div>
                                                                <div className="flex justify-between">
                                                                    <span>Balance</span>
                                                                    <span className="text-red-500 font-semibold">₹{event.balance_amount}</span>
                                                                </div>
                                                            </div>
                                                        ) : (
                                                            <p className="text-gray-400">
                                                                {event.status === "cancelled" ? (
                                                                    ""
                                                                ) : (
                                                                    <>
                                                                        No Transaction yet..!
                                                                        <br />
                                                                        Add total Amount
                                                                    </>
                                                                )}
                                                            </p>
                                                        )
                                                        }
                                                    </td>
                                                )}
                                                <td>
                                                    {event.status === "cancelled"
                                                        ? <p className={`inline-block px-3 py-1 rounded-full text-sm font-medium ${event.total_amount > 0 ? "bg-orange-500/90" : "bg-red-600/90"} text-white capitalize`}>{event.total_amount > 0 ? "Refund" : "Cancelled"}</p>

                                                        : <p className={`inline-block px-3 py-1 rounded-full text-sm font-medium ${statusStyles[event.pay_status]}`}>{event.pay_status}</p>
                                                    }
                                                </td>
                                                <td className="z-50 ">
                                                    <div className="flex flex-col gap-2 ">
                                                        <Button  text="Modify Event" bg={"bg-amber-500"} hoverBg={"hover:bg-amber-600"}  onClick={(e) => { e.stopPropagation(); setShowModelModifyEvent(true); setModifyDetail(event); }}/>

                                                        <Button  text="View Event" bg={"bg-lime-500"} hoverBg={"hover:bg-lime-600"}/>

                                                        {!((event.total_amount == event.total_paid) > event.balance_amount) && role === "ADMIN" && (   
                                                        <Button  text="Add Payment" bg={"bg-green-500"} disabled={event.total_amount == event.total_paid || event.status === "cancelled"} hidden={event.total_amount == event.total_paid || event.status === "cancelled"} onClick={(e) => { e.stopPropagation(); setTarget(event); setShowAddTransactionModal(true); }}/>
                                                        )}
                                                        {role === "ADMIN" && (
                                                           
                                                            <Button 
                                                            onClick={(e) => { e.stopPropagation(); setTarget(event); setShowAddTotalModal(true); setCancelStatus(event.status === "cancelled"); }}
                                                            text={event.status === "cancelled" ? "Refund Amount"
                                                                : Number(event.total_amount) > 0 && Number(event.total_amount) === Number(event.total_paid) && Number(event.balance_amount) === 0
                                                                    ? "Payment Done" : Number(event.total_amount) > 0 ? "Modify Amount" : "Set Amount"}
                                                            bg={event.status === "cancelled" ? "bg-orange-500"
                                                                : Number(event.total_amount) > 0 && Number(event.total_amount) === Number(event.total_paid) && Number(event.balance_amount) === 0
                                                                    ? "bg-green-500" : Number(event.total_amount) > 0 ? "bg-rose-500" : "bg-rose-500"} 
                                                            
                                                            hoverBg={event.status === "cancelled" ? "hover:bg-orange-600"
                                                                : Number(event.total_amount) > 0 && Number(event.total_amount) === Number(event.total_paid) && Number(event.balance_amount) === 0
                                                                    ? "hover:bg-green-600" : Number(event.total_amount) > 0 ? "hover:bg-rose-600" : "hover:bg-rose-600"}
                                                            hidden={event.status === "cancelled" && event.total_paid == 0 && event.total_amount == 0 && event.balance_amount == 0}      
                                                            />
                                                        )}
                                                    </div>
                                                </td>
                                            </tr>

                                            {expandedRow === event.id && role === "ADMIN" && (
                                                <tr className="bg-base-200">
                                                    <td colSpan="9" className="p-4">
                                                        <TransactionCard
                                                            transactionDataList={transactionData}
                                                            refresh={[() => fetchData(false), () => getTransaction(event.payId)]}
                                                            paymentDetail={event}
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
                    ) : (
                        <div className="text-center py-10 text-gray-500">
                            <span>No events found for {client.name}</span>
                        </div>
                    )}
                </div>
            </div>

            {editClientModal && (
                <ClientForm
                    client={client}
                    onClose={() => { setEditClientModal(false) }}
                    refresh={[fetchData]}
                    showToast={showToast}
                />
            )}

            {showEventModel && viewEventDetail && (
                <EventDetail setShowEventModel={setShowEventModel} viewEventDetail={viewEventDetail} setViewEventDetail={setViewEventDetail} />
            )}

            {showModelModifyEvent && (
                <EditEventModal fetchEvents={() => fetchData(false)} ModifyDetail={ModifyDetail} setModifyDetail={setModifyDetail} setShowModelModifyEvent={setShowModelModifyEvent} showToast={showToast} />
            )}

            {showAddTotalModal && (
                <AddTotalPayment
                    fetchPayment={() => fetchData(false)}
                    Data={target} payId={target.payId} totalAmount={target.total_amount}
                    setShowModelEditPayment={setShowAddTotalModal}
                    getTransaction={getTransaction} cancelStatus={cancelStatus} showToast={showToast}
                />
            )}
            
            {showAddTransactionModal && (
                <AddTransaction
                    paymentId={target.payId} paymentData={target}
                    setShowAddModal={setShowAddTransactionModal}
                    fetchPayment={() => fetchData(false)}
                    getTransaction={getTransaction} cancelStatus={cancelStatus} showToast={showToast}
                />
            )}
        </>
    );
};

export default ClientDetail;