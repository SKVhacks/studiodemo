import React, { useState } from "react";
import { AddTransaction } from "../../api/PaymentServices";
import { FaUserAlt } from "react-icons/fa";
import { FaPhoneAlt } from "react-icons/fa";
import { IoMdCalendar } from "react-icons/io";
import { IoCamera } from "react-icons/io5";

const AddPayment = ({ paymentId,paymentData, setShowAddModal, fetchPayment, getTransaction, showToast,}) => {
    const[loading, setLoading] = useState(false);
    const [form, setForm] = useState({
        amount: "" || 0,
        payment_date: "",
        payment_method: "cash"
    });

    const handleChange = (e) => {
        const { name, value } = e.target;
        setForm(prev => ({ ...prev, [name]: value }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            setLoading(true)
            await AddTransaction({
                payment: paymentId,
                amount: Number(form.amount),
                payment_date: form.payment_date,
                payment_method: form.payment_method
            });
            showToast(`₹${form.amount} Transaction done`,"alert-success");
            fetchPayment();
            setShowAddModal(false);
            setForm({ amount: "", payment_date: "", payment_method: "cash" });
            getTransaction(paymentId)

        } catch (err) {
            console.error(err);
            showToast(err.response.data.amount[0],"alert-error");
        } finally{
            setLoading(false)
        }
    };

    return (
        <div className="modal modal-open bg-black/40 backdrop-blur-md">
             <div className="modal-box p-0 max-w-md  overflow-hidden rounded-3xl bg-white/70 dark:bg-zinc-900/70 backdrop-blur-2xl border border-white/20 shadow-[0_20px_60px_rgba(0,0,0,0.15)]">
                <div className="pt-6  text-center ">
                    <h3 className="text-xl font-semibold inline-flex items-center justify-center gap-2">
                        Add Payment
                    </h3>
                </div>
                <div className="p-6">
                    <div className="grid grid-cols-2 gap-4 mb-6 p-4 text-sm rounded-2xl bg-white/80 dark:bg-white/10 ">
                        <div className='flex  gap-2 mt-1'>
                            <FaUserAlt className='text-lg' />
                            <p className="font-medium">{paymentData.client_name}</p>
                        </div>
                        <div className='flex  gap-2 mt-1'>
                            <FaPhoneAlt className='text-lg' />
                            <p className="font-medium">{paymentData.client_phone}</p>
                        </div>
                        <div className='flex  gap-2 mt-1'>
                            <IoCamera className='text-xl' />
                            <p className="font-medium">{paymentData.photography_type}</p>
                        </div>
                        <div className='flex  gap-2 mt-1'>
                            <IoMdCalendar className='text-xl' />
                            <p className="font-medium">{paymentData.event_date}</p>
                        </div>
                    </div>

                    <div className="col-span-2 border-b border-zinc-600 dark:border-zinc-600 py-2 flex justify-between items-center">
                        <div className=" font-semibold gap-1">
                            Total: <span className="text-green-500 text-lg font-semibold">₹{paymentData.total_amount}</span>
                        </div>
                        <div className=" font-semibold gap-1">
                            Balance: <span className="text-red-500 text-lg font-semibold">₹{paymentData.balance_amount}</span>
                        </div>
                    </div>

                    <form onSubmit={handleSubmit} className="space-y-4 mt-4">
                        <div className="form-control">
                            <label className='label font-semibold pb-1'>
                                <span className="text-sm text-zinc-600 dark:text-zinc-300">Payment Amount</span>
                            </label>
                            <div className="join w-full border border-auxillary rounded-lg overflow-hidden focus-within:ring-2 focus-within:ring-focus/20">
                                <span className="join-item flex items-center justify-center bg-auxillary text-white px-4 text-xl font-bold border-r border-auxillary">
                                    ₹
                                </span>
                                <input
                                    type="number"
                                    name="amount"
                                    value={form.amount}
                                    onChange={handleChange}
                                    placeholder="Enter amount"
                                    className="bg-white/60 dark:bg-white/10 input join-item w-full text-lg font-semibold focus:outline-none border-none"
                                    required
                                />
                            </div>
                        </div>

                        <div className="grid grid-cols-2 gap-3">
                            <div className="form-control">
                                <label className='label font-semibold pb-1'>
                                    <span className="text-sm text-zinc-600 dark:text-zinc-300">Date</span>
                                </label>
                                <input
                                 max={new Date().toISOString().split("T")[0]}
                                    type="date"
                                    name="payment_date"
                                    value={form.payment_date}
                                    onChange={handleChange}
                                    className="w-full mt-1 px-4 py-2 rounded-xl bg-white/60 dark:bg-white/10 border border-white/20 focus:ring-2 focus:ring-focus outline-none"
                                    required
                                />
                            </div>                         
                            <div className="form-control">
                                <label className='label font-semibold pb-1'>
                                    <span className="text-sm text-zinc-600 dark:text-zinc-300">Method</span>
                                </label>
                                <select
                                    name="payment_method"
                                    value={form.payment_method}
                                    onChange={handleChange}
                                    className="w-full mt-1 px-4 py-2 rounded-xl bg-white/60 dark:bg-white/10 border border-white/20 focus:ring-2 focus:ring-focus outline-none"
                                >
                                    <option value="cash" className="bg-white dark:bg-zinc-900" >💵 Cash</option>
                                    <option value="upi" className="bg-white dark:bg-zinc-900" >📱 UPI</option>
                                    <option value="bank" className="bg-white dark:bg-zinc-900" >🏦 Bank Transfer</option>
                                </select>
                            </div>
                        </div>

                      
                        <div className="flex justify-end gap-3 pt-4 w-full">
                            <button
                                type="button"
                                disabled={loading}
                                className="px-4 py-2 rounded-xl text-sm bg-zinc-200 dark:bg-zinc-700 font-medium disabled:cursor-not-allowed"
                                onClick={() => setShowAddModal(false)}
                            >
                                Cancel
                            </button>
                            <button type="submit" 
                            disabled={loading || form.amount<=0}
                            className={` px-5 py-2 rounded-xl text-sm text-white  bg-submit transition font-medium disabled:cursor-not-allowed   ${loading || form.amount<=0 ? "opacity-75 " : "hover:scale-110"}`}
                            >
                                Add Payment
                            </button>
                        </div>
                    </form>
                </div>
            </div>
            <div className="modal-backdrop bg-black/40"></div>
        </div>
    );
};

export default AddPayment;
