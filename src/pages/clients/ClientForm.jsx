import ReactDOM from "react-dom";
import React, { useState, useEffect } from "react";
import { CreateClient, UpdateClient } from "../../api/ClientServices";
const ClientForm = ({ client, onClose, refresh, showToast }) => {
    const isEditing = Boolean(client);
    const [formData, setFormData] = useState({
        name: client?.name || "",
        phone: "",
        email: "",
        place: "",
        address: "",
        notes: "",
    });
    const [sendWhatsapp, setSendWhatsapp] = useState(true);
    const [loading, setLoading] = useState(false);
    const [errors, setErrors] = useState({});

    useEffect(() => {
        if (client) {
            setFormData({
                name: client.name || "",
                phone: client.phone || "",
                email: client.email || "",
                place: client.place || "",
                address: client.address || "",
                notes: client.notes || "",
            });
            // Default checkbox to false on edit —  should consciously tick it
            setSendWhatsapp(false);
        }
    }, [client]);


    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
        setErrors({ ...errors, [e.target.name]: "" });
    };

    const handleSubmit = async () => {
        setLoading(true);
        setErrors({});
        try {
            const payload = {
                ...formData,
                send_notification: sendWhatsapp,
            };

            if (isEditing) {
                await UpdateClient(client.id, payload);
                showToast(`${formData.name} Updates successfully`, "alert-success");
            } else {
                const temp = await CreateClient(payload);
                console.log(temp);

                showToast(`${formData.name} Added successfully`, "alert-success");
            }
            refresh.forEach((fn) => fn());
            onClose();

        } catch (error) {
            const data = error.response?.data;
            if (data && typeof data === "object") {
                setErrors(data);
                if (data.phone) {
                    showToast(data.phone, "alert-error");
                }
                if (data.email) {
                    showToast(data.email, "alert-error");
                }
                if (data.name) {
                    showToast(data.name, "alert-error");
                }
            }
            else {
                setErrors({ non_field: "Something went wrong. Please try again." });
                showToast("Something went wrong. Please try again.", "alert-error");
            }
        } finally {
            setLoading(false);
        }
    };

    return (
        <>
            <div className="fixed inset-0 flex items-center justify-center bg-black/40 backdrop-blur-md p-4 z-50">
                <div className=" w-full max-w-lg max-h-[90vh] overflow-y-auto rounded-3xl p-6 bg-white/70 dark:bg-zinc-900/70 backdrop-blur-2xl  border border-white/20 shadow-[0_20px_60px_rgba(0,0,0,0.15)]">
                    <h3 className="text-2xl font-semibold text-center mb-6">
                        {isEditing ? "Edit Client" : "Add Client"}
                    </h3>
                    <div className="space-y-5">
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                            <div>
                                <label className="text-sm text-zinc-500">
                                    Name<span className="text-red-500">*</span>
                                </label>
                                <input
                                    type="text"
                                    name="name"
                                    placeholder="e.g. Tony Stark"
                                    className={`w-full mt-1 px-4 py-2 rounded-xl bg-white/60 dark:bg-white/10 border ${errors.name ? "border-red-500 border-2" : "border-white/20"} focus:ring-2 ${errors.name ? "focus:ring-red-400/40" : "focus:ring-focus"} outline-none`}
                                    value={formData.name}
                                    onChange={handleChange}
                                />
                                {errors.name && (<p className="text-red-500 text-xs mt-1">{errors.name}</p>)}
                            </div>
                            <div>
                                <label className="text-sm text-zinc-500">
                                    Phone<span className="text-red-500">*</span>
                                </label>
                                <input
                                    type="text"
                                    name="phone"
                                    placeholder="e.g. 9080706050"
                                    className={`w-full mt-1 px-4 py-2 rounded-xl bg-white/60 dark:bg-white/10 border ${errors.phone ? "border-red-500 border-2" : "border-white/20"} focus:ring-2 ${errors.phone ? "focus:ring-red-400/40" : "focus:ring-focus"} outline-none`}
                                    value={formData.phone}
                                    onChange={handleChange}
                                />
                                {errors.phone && (<p className="text-red-500 text-xs mt-1">{errors.phone}</p>)}
                            </div>
                            <div>
                                <label className="text-sm text-zinc-500">Email</label>

                                <input
                                    type="email"
                                    name="email"
                                    placeholder="e.g. abc@domain.com"
                                    className={`w-full mt-1 px-4 py-2 rounded-xl bg-white/60 dark:bg-white/10 border ${errors.email ? "border-red-500 border-2" : "border-white/20"} focus:ring-2 ${errors.email ? "focus:ring-red-400/40" : "focus:ring-focus"} outline-none`}
                                    value={formData.email}
                                    onChange={handleChange}
                                />
                                {errors.email && (<p className="text-red-500 text-xs mt-1">{errors.email}</p>)}
                            </div>
                            <div>
                                <label className="text-sm text-zinc-500">Location</label>
                                <input
                                    type="text"
                                    name="place"
                                    placeholder="e.g. Kumapatti"
                                    className="w-full mt-1 px-4 py-2 rounded-xl focus:ring-2 focus:ring-focus outline-none bg-white/60 dark:bg-white/10 border border-white/20"
                                    value={formData.place}
                                    onChange={handleChange}
                                />
                            </div>
                        </div>
                      
                        <div className="flex flex-col justify-between gap-4">
                            <div>
                                <label htmlFor="address" className="text-sm text-zinc-500 pb-1 ">Address</label>
                                <textarea
                                    name="address"
                                    placeholder=". . ."
                                    className="w-full h-24 px-4 py-2 rounded-xl bg-white/60 dark:bg-white/10 border border-white/20 focus:ring-2 focus:ring-focus outline-none"
                                    value={formData.address}
                                    onChange={handleChange}
                                />
                            </div>
                            <div>
                                <label htmlFor="" className="text-sm text-zinc-500 pb-1">Notes</label>
                                <textarea
                                    name="notes"
                                    placeholder=". . ."
                                    className="w-full h-24 px-4 py-2 rounded-xl bg-white/60 dark:bg-white/10 border border-white/20 focus:ring-2 focus:ring-focus outline-none"
                                    value={formData.notes}
                                    onChange={handleChange}
                                />
                            </div>
                        </div>
                        <div className="flex items-center justify-between mt-4">
                            <span className="text-sm text-zinc-600 dark:text-zinc-300">
                                {isEditing ? "Send WhatsApp update to client" : "Send welcome message to WhatsApp"}
                            </span>
                            <button
                                type="button"
                                onClick={() => setSendWhatsapp(!sendWhatsapp)}
                                className={`relative w-12 h-7 rounded-full transition duration-300 ${sendWhatsapp ? "bg-green-500" : "bg-zinc-300 dark:bg-zinc-700"} `}>
                                <span className={`absolute top-1 left-1 w-5 h-5 bg-white rounded-full shadow-md transition-transform duration-300 ${sendWhatsapp ? "translate-x-5" : ""} `} />
                            </button>
                        </div>
                        {errors.non_field && ( <p className="text-error text-sm">{errors.non_field}</p> )}
                    </div>

                    <div className="modal-action">
                        <button
                            className="px-4 py-2 rounded-xl text-sm bg-zinc-200 dark:bg-zinc-700 font-medium  disabled:cursor-not-allowed"
                            onClick={onClose}
                            disabled={loading}
                        >
                            Cancel
                        </button>

                        <button
                            className={` ${loading ? "opacity-60" : ""} px-5 py-2 rounded-xl text-sm text-white  bg-submit  hover:scale-105 transition font-medium disabled:cursor-not-allowed`}
                            onClick={handleSubmit}
                            disabled={loading}
                        >
                            {loading ? <span className="loading loading-spinner loading-sm" /> : isEditing ? "Update" : "Save" }
                        </button>
                    </div>
                </div>
            </div>
        </>
    );
};

export default ClientForm;