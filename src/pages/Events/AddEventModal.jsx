import React, { useState, useEffect, useRef } from 'react'
import { ChooseClient } from '../../api/ClientServices'
import { CreateEvent } from '../../api/EventServices'
import { useLocation } from "react-router-dom";
import ConflictAlert from '../../components/ConflictAlert';

const AddEventModal = ({ setShowModalEvent, fetchEvents, showToast }) => {
  const [eventForm, setEventForm] = useState({
    photography_type: "",
    location: "",
    event_date: "",
    event_time: "" || "08:00",
    address: "",
    description: "",
  });

  const location = useLocation();
  const [sendWhatsapp, setSendWhatsapp] = useState(true);
  const [selectedClient, setSelectedClient] = useState(null);
  const [clients, setClients] = useState([]);
  const [clientSearch, setClientSearch] = useState("");
  const [conflictMsg, setConflictMsg] = useState(null);
  const [pendingPayload, setPendingPayload] = useState(null);
  const [isSaving, setIsSaving] = useState(false);
  const [errors, setErrors] = useState({});
  const searchInputRef = useRef(null);
  const [conflictDate, setConflictDate] = useState(null);

  // Auto-focus the client search input when modal opens
  useEffect(() => {
    if (!selectedClient) {
      setTimeout(() => searchInputRef.current?.focus(), 50);
    }
  }, [selectedClient]);

  const resetModal = () => {
    setShowModalEvent(false);
    setClients([]);
    setSelectedClient(null);
    setClientSearch("");
    setEventForm({});
    setConflictMsg(null);
    setPendingPayload(null);
    setErrors({});
    setIsSaving(false);
  };

  const searchClients = async (value) => {
    setClientSearch(value);
    if (value.length < 2) { setClients([]); return; }
    try {
      const res = await ChooseClient(value);
      setClients(res.data.results);
    } catch (err) {
      console.error(err);
    }
  };

  // Validate required fields (address and description are optional)
  const validate = () => {
    const newErrors = {};
    if (!selectedClient) {
      newErrors.client = "Please select a client.";
    }
    if (!eventForm.photography_type?.trim()) {
      newErrors.photography_type = "Event is required.";
    }
    if (!eventForm.location?.trim()) {
      newErrors.location = "Venue is required.";
    }
    if (!eventForm.event_date) {
      newErrors.event_date = "Date is required.";
    }
    if (!eventForm.event_time) {
      newErrors.event_time = "Time is required.";
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // ── core save — force=true skips conflict check on backend ────────────
  const saveEvent = async (payload, force = false) => {
    setIsSaving(true);
    try {
      await CreateEvent(force ? { ...payload, send_notification: sendWhatsapp, force_save: true } : payload);
      fetchEvents.forEach((fn) => fn());
      showToast(`${eventForm.photography_type} Event Created Successfully`, "alert-success");
      resetModal();
    } catch (err) {
      setIsSaving(false);
      const conflict = err.response?.data?.conflict;
      if (conflict) {
        setPendingPayload(payload);
        const conflictText = Array.isArray(conflict) ? conflict[0] : conflict;
        setConflictMsg(conflictText);
        setConflictDate(eventForm.event_date || null);
      } else {
        console.error(err);
        showToast("Something went wrong", "alert-error")
      }
    }
  };

  const handleSave = () => {
    if (!validate()) return;
    const payload = {
      ...eventForm,
      client: selectedClient.id,
      send_notification: sendWhatsapp,
      event_time: eventForm.event_time ? `${eventForm.event_time}:00` : "",
    };
    saveEvent(payload);
  };

  const fieldError = (key) => errors[key] ? (<span className="text-red-500 text-xs mt-1">{errors[key]}</span>) : null;

  return (
    <>
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-md p-4" >
        <div
          className=" w-full max-w-md max-h-[90vh] overflow-y-auto rounded-3xl bg-white/80 dark:bg-zinc-900/80 backdrop-blur-2xl border border-white/20 shadow-[0_25px_80px_rgba(0,0,0,0.25)] "
          // onClick={(e) => e.stopPropagation()} // 🔥 IMPORTANT FIX
        >
          <div className="px-5 pt-6 pb-5">
            <button
              onClick={resetModal}
              disabled={isSaving}
              className="absolute right-4 top-4 w-8 h-8 rounded-full bg-white/40 dark:bg-white/10 backdrop-blur hover:scale-105 transition hover:text-red-500 "
            >
              ✕
            </button>
            <h1 className="text-xl font-semibold text-center mb-5">
              Add Event
            </h1>

            {!selectedClient && (
              <>
                <p className="text-sm font-medium mb-2">
                  Select Client <span className="text-red-500">*</span>
                </p>
                <input
                  ref={searchInputRef}
                  placeholder="Search by name or phone"
                  value={clientSearch}
                  onChange={(e) => searchClients(e.target.value)}
                  className="w-full px-4 py-2 rounded-xl  bg-white/40 dark:bg-white/10  border border-white/20 focus:ring-2 focus:ring-focus outline-none"
                />

                {fieldError("client")}

                {/* searched result list */}
                {clients.length > 0 && (
                  <div className="mt-3 rounded-2xl overflow-hidden border border-white/20 bg-white/40 dark:bg-white/10 backdrop-blur">
                    {clients.map((c) => (
                      <div
                        key={c.id}
                        onClick={() => {
                          setSelectedClient(c);
                          setClientSearch(`${c.name} (${c.phone}) (${c.place})`);
                          setClients([]);
                          setErrors((prev) => ({ ...prev, client: undefined }));
                        }}
                        className="px-4 py-3 flex justify-between items-center cursor-pointer hover:bg-black/5 dark:hover:bg-white/10 transition"
                      >
                        <p className="font-medium font-base truncate capitalize">
                          {c.name.length > 12 ? <> {c.name.slice(0, 12) + "..."}</> : c.name}
                          <span className="opacity-50 text-xs ml-1">
                            {c.phone}
                          </span>
                        </p>
                        <span className="capitalize text-base font-normal text-place">{c.place}</span>
                      </div>
                    ))}
                  </div>
                )}
              </>
            )}

            {/* SELECTED CLIENT */}
            {selectedClient && (
              <div className="p-4 rounded-2xl mt-3 bg-white/80 dark:bg-white/10 border border-white/20 flex justify-between items-center">
                <div>
                  <p className="font-semibold">{selectedClient.name}</p>
                  <p className="text-xs opacity-60">{selectedClient.phone} - <span className='capitalize'>{selectedClient.place}</span></p>
                </div>
                <button
                  onClick={() => { setSelectedClient(null); setClientSearch(""); }}
                  disabled={isSaving}
                  className="text-sm text-orange-500 hover:opacity-75  font-semibold"
                >
                  Change
                </button>
              </div>
            )}

            {/* FORM */}
            {selectedClient && (
              <>
                <div className="flex items-center my-6">
                  <div className="flex-1 h-[1px] bg-zinc-400/30 dark:bg-zinc-700"></div>
                  <span className="px-3 mb-1 text-xs text-zinc-400 whitespace-nowrap">
                    Event Details
                  </span>
                  <div className="flex-1 h-[1px] bg-zinc-400/30 dark:bg-zinc-700"></div>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                  <div className="form-control">
                    <label className="label">
                      <span className="text-sm text-zinc-500t">
                        Event <span className="text-red-500">*</span>
                      </span>
                    </label>
                    <input
                      className={`w-full mt-1 px-4 py-2 rounded-xl bg-white/60 dark:bg-white/10 border  focus:ring-2  outline-none ${errors.photography_type ? "focus:ring-red-500 border-red-500" : "focus:ring-focus border-white/20"}`}
                      placeholder="e.g. Wedding"
                      value={eventForm.photography_type || ""}
                      onChange={(e) => {
                        setEventForm({ ...eventForm, photography_type: e.target.value });
                        setErrors((prev) => ({ ...prev, photography_type: undefined }));
                      }}
                    />
                    {fieldError("photography_type")}
                  </div>
                  <div className="form-control">
                    <label className="label">
                      <span className="text-sm text-zinc-500">
                        Venue <span className="text-red-500">*</span>
                      </span>
                    </label>
                    <input
                      className={`w-full mt-1 px-4 py-2 rounded-xl bg-white/60 dark:bg-white/10 border focus:ring-2  outline-none ${errors.location ? "focus:ring-red-500 border-red-500" : "focus:ring-focus border-white/20"}`}
                      placeholder="e.g. Mannargudi"
                      value={eventForm.location || ""}
                      onChange={(e) => {
                        setEventForm({ ...eventForm, location: e.target.value });
                        setErrors((prev) => ({ ...prev, location: undefined }));
                      }}
                    />
                    {fieldError("location")}
                  </div>
                  <div className="form-control">
                    <label className="label">
                      <span className="text-sm text-zinc-500">
                        Date <span className="text-red-500">*</span>
                      </span>
                    </label>
                    <input
                      type="date"
                      min={new Date().toISOString().split("T")[0]}
                      className={`w-full mt-1 px-4 py-2 rounded-xl bg-white/60 dark:bg-white/10 border  focus:ring-2  outline-none ${errors.event_date ? "focus:ring-red-500 border-red-500" : "focus:ring-focus border-white/20"}`}
                      value={eventForm.event_date || ""}
                      onChange={(e) => {
                        setEventForm({ ...eventForm, event_date: e.target.value });
                        setErrors((prev) => ({ ...prev, event_date: undefined }));
                      }}
                    />
                    {fieldError("event_date")}
                  </div>
                  <div className="form-control">
                    <label className="label">
                      <span className="text-sm text-zinc-500">
                        Time <span className="text-red-500">*</span>
                      </span>
                    </label>
                    <input
                      type="time"
                      className={`w-full mt-1 px-4 py-2 rounded-xl bg-white/60 dark:bg-white/10 border  focus:ring-2  outline-none ${errors.event_time ? "focus:ring-red-500 border-red-500" : "focus:ring-focus border-white/20"}`}
                      value={eventForm.event_time }
                      onChange={(e) => {
                        setEventForm({ ...eventForm, event_time: e.target.value });
                        setErrors((prev) => ({ ...prev, event_time: undefined }));
                      }}
                    />
                    {fieldError("event_time")}
                  </div>
                </div>

                {/* TEXTAREA */}
                <div className="mt-4 space-y-4">
                  <label className="text-sm text-zinc-500">Address</label>
                  <textarea type="textarea" className="w-full h-24 px-4 py-2 rounded-xl bg-white/60 dark:bg-white/10 border border-white/20 focus:ring-2 focus:ring-focus outline-none"
                    value={eventForm.address} onChange={(e) => { setEventForm({ ...eventForm, address: e.target.value }) }}
                  />
                  <label className="text-sm text-zinc-500">Notes</label>
                  <textarea type="textarea" className="w-full h-24 px-4 py-2 rounded-xl bg-white/60 dark:bg-white/10 border border-white/20 focus:ring-2 focus:ring-focus outline-none"
                    value={eventForm.description} onChange={(e) => { setEventForm({ ...eventForm, description: e.target.value }) }}
                  />
                </div>

                <div className="flex items-center justify-between mt-5">
                  <span className="text-sm">
                    Send WhatsApp message
                  </span>
                  <button
                    type="button"
                    onClick={() => setSendWhatsapp(!sendWhatsapp)}
                    className={` relative w-12 h-7 rounded-full transition ${sendWhatsapp ? "bg-green-500" : "bg-zinc-300 dark:bg-zinc-700"} `}
                  >
                    <span
                      className={` absolute top-1 left-1 w-5 h-5 bg-white rounded-full transition-transform  ${sendWhatsapp ? "translate-x-5" : ""} `}
                    />
                  </button>
                </div>
                <button
                  onClick={handleSave}
                  disabled={isSaving}
                  className={` ${isSaving ? "opacity-60" : ""}  w-full mt-6 py-3 rounded-xl text-white font-medium bg-submit  hover:scale-102 transition disabled:cursor-not-allowed `}
                >
                  {isSaving ? "Saving..." : "Save Event"}
                </button>
              </>
            )}
          </div>
        </div>
      </div>

      {/* ── conflict modal — alert existing event on same date ── */}
      <ConflictAlert
        message={conflictMsg}
        conflictDate={conflictDate}
        onConfirm={() => {
          setConflictMsg(null);
          setConflictDate(null);
          saveEvent(pendingPayload, true);
        }}
        onCancel={() => {
          setConflictMsg(null);
          setConflictDate(null);
          setPendingPayload(null);
          setIsSaving(false);
        }}
      />
    </>
  );
};

export default AddEventModal;