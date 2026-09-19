import React, { useState, useEffect } from 'react'
import { UpdatePayment } from '../../api/PaymentServices'
import { FaUserAlt } from "react-icons/fa";
import { FaPhoneAlt } from "react-icons/fa";
import { IoMdCalendar } from "react-icons/io";
import { IoCamera , IoWarningOutline } from "react-icons/io5";
const AddTotalPayment = ({ fetchPayment, Data, payId, totalAmount, setShowModelEditPayment, getTransaction, cancelStatus, showToast }) => {
    const [loading , setLoading ] = useState(false);
    const [form, setForm] = useState({
        total_amount: "",
    });

    // When editData changes, update form
    useEffect(() => {
        if (payId) {
            setForm({
                total_amount: totalAmount || "",
            });
        }
    }, [payId]);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setForm(prev => ({
            ...prev,
            [name]: value
        }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            setLoading(true);
            await UpdatePayment(payId, {
                total_amount: Number(form.total_amount)
            });
            showToast(`₹${form.total_amount} Added Done`, "alert-success");
            setShowModelEditPayment(false);
            getTransaction(payId)
        } catch (err) {
            const errorMsg = err.response?.data?.total_amount?.[0] || "Something went wrong";
            console.log(errorMsg);

            showToast(errorMsg, "alert-error");
        }finally{
        setLoading(false);    
        fetchPayment();
        }
    };

    return (
        <>
            <div className="modal modal-open bg-black/40 backdrop-blur-md">
                <div className="modal-box p-0 max-w-md booverflow-hidden rounded-3xl bg-white/70 dark:bg-zinc-900/70 backdrop-blur-2xl border border-white/20 shadow-[0_20px_60px_rgba(0,0,0,0.15)]">
                    <div className="p-3  text-center">
                        <h3 className="text-xl font-bold inline-flex items-center justify-center gap-2">
                            Total Amount
                        </h3>
                    </div>
                    <div className="p-6">
                        <div className="grid grid-cols-2 gap-4 mb-6 p-4 bg-white/80 dark:bg-white/10 rounded-xl text-sm">
                            <div className='flex  gap-2 mt-1'>
                                <FaUserAlt className='text-lg opacity-60' />
                                <p className="font-medium">{Data.client_name}</p>
                            </div>
                            <div className='flex  gap-2 mt-1'>
                                <FaPhoneAlt className='text-lg opacity-60' />
                                <p className="font-medium">{Data.client_phone}</p>
                            </div>
                            <div className='flex  gap-2 mt-1'>
                                <IoCamera className='text-xl  opacity-60' />
                                <p className="font-medium">{Data.photography_type}</p>
                            </div>
                            <div className='flex  gap-2 mt-1'>
                                <IoMdCalendar className='text-xl opacity-60' />
                                <p className="font-medium">{Data.event_date}</p>
                            </div>
                        </div>
                        <form onSubmit={handleSubmit} className="space-y-4">
                            <div className="form-control">
                                <label className='label font-semibold pb-1'>
                                    <span className="label-text text-md text-base-content/80">Total Amount</span>
                                </label>
                                <div className={`join w-full border  focus-within:ring-2  ${cancelStatus ? "border-red-500 focus-within:ring-red-500" : "border-focus focus-within:ring-focus"} rounded-lg overflow-hidden `}>
                                    <span className={`join-item flex items-center justify-center  text-white px-4 text-xl font-bold border-r ${cancelStatus ? "border-red-500 bg-red-500" : " bg-auxillary border-auxillary"}`}>
                                        ₹
                                    </span>
                                    <input
                                        type="number"
                                        name="total_amount"
                                        value={form.total_amount}
                                        onChange={handleChange}
                                        className="bg-white/60 dark:bg-white/10 input join-item w-full text-lg font-semibold focus:outline-none border-none"
                                        placeholder="0.00"
                                    />
                                </div>
                            </div>
                            {cancelStatus &&
                                <div className="flex items-start gap-3 p-3 rounded-2xl bg-amber-50/70 backdrop-blur-md  border border-amber-200/50 shadow-sm">
                                    <div className="text-amber-500 dark:text-amber-700 text-2xl mt-[2px]">
                                        <IoWarningOutline />
                                    </div>
                                    <p className="text-[13px] text-amber-900 leading-relaxed">
                                        <span className="font-semibold">Warning:</span>{" "}
                                        Delete all transactions linked to{" "}
                                        <span className="font-semibold text-amber-600">
                                            {Data.photography_type}
                                        </span>{" "}
                                        before resetting the total amount to 0. Otherwise, you can’t set the total amount to 0.
                                    </p>
                                </div>
                            }
                            <div className="flex justify-end items-center gap-3 pt-4 w-full ">
                                <button
                                    type="button"
                                    disabled={loading}
                                    className="px-4 py-2 rounded-xl text-sm bg-zinc-200 dark:bg-zinc-700 font-medium disabled:cursor-not-allowed"
                                    onClick={() => setShowModelEditPayment(false)}
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    disabled={loading}
                                    className={` px-5 py-2 rounded-xl text-sm text-white  ${cancelStatus ? "bg-red-500" :"bg-submit"} disabled:cursor-not-allowed  ${loading ? "opacity-75" : "hover:scale-105"}  transition font-medium`}
                                >
                                    {cancelStatus ? "Delete Amount" : `${form.total_amount > 0 ? "Edit" : "Add"} Amount`}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
                <div className="modal-backdrop bg-black/40" ></div>
            </div>
        </>
    );
};

export default AddTotalPayment;
