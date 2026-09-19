// api/IntegrationServices.js
import API from "./axios"; // your existing axios instance with JWT interceptor

// ─────────────────────────────────────────────────────────────────────────────
// WhatsApp Service
// ─────────────────────────────────────────────────────────────────────────────

export const getWhatsAppService     = ()           => API.get("/integration/whatsapp/");
export const createWhatsAppService  = (data)       => API.post("/integration/whatsapp/", data);
export const updateWhatsAppService  = (id, data)   => API.patch(`/integration/whatsapp/${id}/`, data);
export const deleteWhatsAppService  = (id)         => API.delete(`/integration/whatsapp/${id}/`);
export const toggleWhatsApp         = (id, enabled) => API.patch(`/integration/whatsapp/${id}/`, { is_enabled: enabled });

// ─────────────────────────────────────────────────────────────────────────────
// Google Sheets Config  (add / delete only — no edit)
// ─────────────────────────────────────────────────────────────────────────────

export const getSheetsConfig    = ()      => API.get("/integration/sheets/");
export const createSheetsConfig = (data)  => API.post("/integration/sheets/", data);
export const deleteSheetsConfig = (id)    => API.delete(`/integration/sheets/${id}/`);

// ─────────────────────────────────────────────────────────────────────────────
// Google Calendar Config  (add / delete only — no edit)
// ─────────────────────────────────────────────────────────────────────────────

export const getCalendarConfig    = ()      => API.get("/integration/calendar/");
export const createCalendarConfig = (data)  => API.post("/integration/calendar/", data);
export const deleteCalendarConfig = (id)    => API.delete(`/integration/calendar/${id}/`);