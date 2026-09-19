import React, { useState } from 'react';
import { DeleteTransaction } from '../../api/PaymentServices';
import { GiCancel } from "react-icons/gi";

const TransactionCard = ({ transactionDataList, refresh, paymentDetail, showToast , transactionLoading}) => {
    const [deletingId, setDeletingId] = useState(null);

    const totalCollected = transactionDataList
        ? transactionDataList.reduce((acc, curr) => acc + Number(curr.amount), 0)
        : 0;

    const handleDelete = async (id) => {
        if (!window.confirm("Are you sure to delete this transaction? You won't be able to recover it.")) return;
        setDeletingId(id);
        try {
            await DeleteTransaction(id);
            showToast("Transaction Deleted Successfully", "alert-success");
            refresh.forEach(fn => fn());
        } catch (err) {
            showToast(err?.response?.data?.error || "Failed to delete transaction", "alert-error");
        } finally {
            setDeletingId(null);
        }
    };

    return (
        <div className="mx-auto max-w-xl overflow-hidden transition-all duration-500
            bg-white/70 border border-slate-200 shadow-[0_8px_30px_rgb(0,0,0,0.04)]
            dark:bg-[#1c1c1e]/80 dark:border-white/10 dark:shadow-none
            backdrop-blur-3xl rounded-[24px]">

            {/* Header */}
            <div className="flex flex-row items-start sm:items-center justify-between px-8 py-6 gap-4 border-b border-black/[0.03] dark:border-white/[0.03]">
                <div>
                    <h3 className="text-[17px] font-semibold tracking-tight text-slate-900 dark:text-white">
                        Transaction History
                    </h3>
                    <p className="text-[12px] font-medium text-slate-400 dark:text-slate-500">
                        {transactionDataList?.length || "No "} Records Found
                    </p>
                </div>

                <div className="flex gap-6 sm:text-right">
                    <div className="space-y-0.5">
                        <p className="text-[10px] uppercase tracking-wider font-bold text-slate-400">Total</p>
                        <p className="text-[15px] font-semibold tabular-nums text-slate-900 dark:text-white">₹{paymentDetail.total_amount}</p>
                    </div>
                    <div className="h-8 w-[1px] bg-slate-200 dark:bg-white/10 self-center" />
                    <div className="space-y-0.5">
                        <p className="text-[10px] uppercase tracking-wider font-bold text-slate-400">Balance</p>
                        <p className="text-[15px] font-semibold tabular-nums text-red-500 dark:text-red-400">
                            ₹{paymentDetail.balance_amount ?? '0.00'}
                        </p>
                    </div>
                </div>
            </div>

            {/* Table */}
            <div className="overflow-x-auto">
                {transactionLoading ? <div className=' flex items-center justify-center h-15'><span className="loading loading-spinner w-7 text-core" /></div> :
                transactionDataList && transactionDataList.length > 0 && !transactionLoading ? (
                    <table className="w-full table-fixed">
                        <thead>
                            <tr className="border-b border-white/5">
                                <th className="w-[32%] px-8 py-3 text-left text-[11px] font-bold text-slate-400 uppercase tracking-widest">Date</th>
                                <th className="w-[25%] px-8 py-3 text-center text-[11px] font-bold text-slate-400 uppercase tracking-widest">Method</th>
                                <th className="w-[30%] px-8 py-3 text-right text-[11px] font-bold text-slate-400 uppercase tracking-widest">Amount</th>
                                <th className="w-[13%] px-2 py-3" />
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-white/5">
                            {transactionDataList.map((t) => (
                                <tr key={t.id} className="hover:bg-white/[0.02] transition-colors">
                                    <td className="px-8 py-4 text-[14px] dark:text-slate-300 text-zinc-400 tabular-nums text-left">
                                        {t.payment_date}
                                    </td>
                                    <td className="px-8 py-4 text-center">
                                        <span className="inline-flex items-center justify-center min-w-[60px] px-2.5 py-1 rounded-md text-[11px] font-bold bg-gray-200/50 dark:bg-white/5 text-slate-400 ring-1 ring-inset ring-white/10">
                                            {t.payment_method}
                                        </span>
                                    </td>
                                    <td className="px-8 py-4 text-right text-[14px] font-semibold dark:text-white text-black tabular-nums">
                                        ₹{Number(t.amount).toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                                    </td>
                                    <td className="px-2 py-4 text-center">
                                        <button
                                            onClick={() => handleDelete(t.id)}
                                            disabled={deletingId === t.id}
                                            className="inline-flex items-center justify-center w-7 h-7 rounded-full hover:bg-red-500/10 transition-all duration-150 disabled:opacity-40"
                                        >
                                            {deletingId === t.id
                                                ? <span className="loading loading-spinner loading-xs text-red-500" />
                                                : <GiCancel className='text-red-500 text-lg md:hover:scale-110 transition-transform' />
                                            }
                                        </button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                ) : (
                    <div className="py-20 text-center">
                        <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-slate-50 dark:bg-white/5 mb-4">
                            <span className="text-xl opacity-50 text-slate-900 dark:text-white">🧾</span>
                        </div>
                        <p className="text-[14px] text-slate-400">No transactions recorded</p>
                    </div>
                )}
            </div>

            {/* Footer */}
            {transactionDataList?.length > 0 && (
                <div className="px-8 py-5 bg-slate-50/50 dark:bg-white/[0.02] border-t border-black/[0.03] dark:border-white/[0.03] flex justify-between items-center">
                    <span className="text-[11px] font-bold text-slate-400 uppercase tracking-[0.1em]">
                        Total Collected
                    </span>
                    <span className="text-[20px] font-bold text-green-600 dark:text-green-400 tabular-nums tracking-tight">
                        ₹{totalCollected.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                    </span>
                </div>
            )}
        </div>
    );
};

export default TransactionCard;