// // // src/api/mock/mockServer.js
// // // ─────────────────────────────────────────────────────────────────────────────
// // // A tiny in-browser "backend" that plugs into axios as a custom adapter.
// // // All your existing service files (ClientServices, EventServices, …) keep
// // // working unchanged. State lives in memory: add / edit / delete works during a
// // // visit, and a page refresh restores a fresh, date-correct dataset.
// // // ─────────────────────────────────────────────────────────────────────────────
// // import { AxiosError } from "axios";
// // import { createDb, toDateStr, avatarFor, DEMO_PASSWORD } from "./mockData";

// // const LATENCY = [180, 420]; // ms — fake network delay so spinners show

// // let db = null;
// // const getDb = () => {
// //   if (!db) {
// //     db = createDb();
// //     console.info("[demo] Mock backend active — no real API calls are made.");
// //   }
// //   return db;
// // };

// // const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

// // class HttpError extends Error {
// //   constructor(status, data) {
// //     super(`HTTP ${status}`);
// //     this.status = status;
// //     this.data = data;
// //   }
// // }
// // const fail = (status, data) => {
// //   throw new HttpError(status, data);
// // };
// // const ok = (data, status = 200) => ({ status, data });

// // const nowIso = () => new Date().toISOString();
// // const normTime = (t) => (/^\d{2}:\d{2}$/.test(String(t)) ? `${t}:00` : t);
// // const sum = (arr) => arr.reduce((a, b) => a + b, 0);
// // const contains = (fields, s) => fields.some((f) => String(f ?? "").toLowerCase().includes(s));

// // // ── pagination (DRF style) ───────────────────────────────────────────────────
// // const paginate = (list, q, path) => {
// //   const size = Math.max(1, parseInt(q.page_size, 10) || 25);
// //   const page = Math.max(1, parseInt(q.page, 10) || 1);
// //   const start = (page - 1) * size;
// //   return {
// //     count: list.length,
// //     next: start + size < list.length ? `${path}?page=${page + 1}` : null,
// //     previous: page > 1 ? `${path}?page=${page - 1}` : null,
// //     results: list.slice(start, start + size),
// //   };
// // };

// // // ── payment math (always derived from transactions) ──────────────────────────
// // const paymentStats = (p) => {
// //   const paid = sum(getDb().transactions.filter((t) => t.payment === p.id).map((t) => t.amount));
// //   const total = Number(p.total_amount) || 0;
// //   return {
// //     total,
// //     paid,
// //     balance: Math.max(0, total - paid),
// //     status: paid <= 0 ? "pending" : total > 0 && paid >= total ? "paid" : "partial",
// //   };
// // };

// // // ── serializers ──────────────────────────────────────────────────────────────
// // const clientView = (c) => ({ ...c });

// // const userView = (u) => ({
// //   id: u.id,
// //   full_name: u.full_name,
// //   name: u.full_name,
// //   email: u.email,
// //   phone: u.phone,
// //   role: u.role,
// //   picture: u.picture,
// //   is_active: true,
// // });

// // const eventView = (e) => {
// //   const { clients, payments } = getDb();
// //   const c = clients.find((x) => x.id === e.client) || {};
// //   const p = payments.find((x) => x.id === e.payId);
// //   const s = paymentStats(p);
// //   return {
// //     id: e.id,
// //     event_code: e.event_code,
// //     client: e.client,
// //     client_id: e.client,
// //     client_name: c.name,
// //     client_phone: c.phone,
// //     client_place: c.place,
// //     photography_type: e.photography_type,
// //     location: e.location,
// //     event_date: e.event_date,
// //     event_time: e.event_time,
// //     address: e.address,
// //     description: e.description,
// //     status: e.status,
// //     payId: p.id,
// //     total_amount: s.total,
// //     total_paid: s.paid,
// //     balance_amount: s.balance,
// //     pay_status: s.status,
// //     created_by_name: e.created_by_name,
// //     updated_by_name: e.updated_by_name,
// //     created_at: e.created_at,
// //     updated_at: e.updated_at,
// //   };
// // };

// // const paymentView = (p) => {
// //   const { events, clients } = getDb();
// //   const e = events.find((x) => x.id === p.event);
// //   const c = clients.find((x) => x.id === e.client) || {};
// //   const s = paymentStats(p);
// //   return {
// //     id: p.id,
// //     event: e.id,
// //     event_code: e.event_code,
// //     event_status: e.status,
// //     client_id: c.id,
// //     client_name: c.name,
// //     client_phone: c.phone,
// //     client_place: c.place,
// //     photography_type: e.photography_type,
// //     event_date: e.event_date,
// //     event_time: e.event_time,
// //     total_amount: s.total,
// //     total_paid: s.paid,
// //     balance_amount: s.balance,
// //     status: s.status,
// //   };
// // };

// // // ── validation helpers ───────────────────────────────────────────────────────
// // const validateClient = (body, selfId = null) => {
// //   const errs = {};
// //   const name = String(body.name ?? "").trim();
// //   const phone = String(body.phone ?? "").trim();
// //   const email = String(body.email ?? "").trim();
// //   if (!name) errs.name = ["Name is required."];
// //   if (!phone) errs.phone = ["Phone is required."];
// //   else if (!/^\d{10}$/.test(phone)) errs.phone = ["Enter a valid 10-digit phone number."];
// //   else if (getDb().clients.some((c) => c.phone === phone && c.id !== selfId))
// //     errs.phone = ["A client with this phone number already exists."];
// //   if (email && !/^\S+@\S+\.\S+$/.test(email)) errs.email = ["Enter a valid email address."];
// //   if (Object.keys(errs).length) fail(400, errs);
// //   return { name, phone, email, place: body.place ?? "", address: body.address ?? "", notes: body.notes ?? "" };
// // };

// // const conflictFor = (date, excludeId = null) => {
// //   const { events, clients } = getDb();
// //   const clash = events.filter(
// //     (e) => e.event_date === date && e.status !== "cancelled" && e.id !== excludeId
// //   );
// //   if (!clash.length) return null;
// //   const list = clash
// //     .map((e) => {
// //       const c = clients.find((x) => x.id === e.client);
// //       return `${e.photography_type} – ${c?.name} (${e.event_time.slice(0, 5)})`;
// //     })
// //     .join(", ");
// //   return `${clash.length} event${clash.length > 1 ? "s" : ""} already scheduled on ${date}: ${list}`;
// // };

// // const removeEvent = (eventId) => {
// //   const d = getDb();
// //   const ev = d.events.find((e) => e.id === eventId);
// //   if (!ev) return;
// //   d.transactions = d.transactions.filter((t) => t.payment !== ev.payId);
// //   d.payments = d.payments.filter((p) => p.id !== ev.payId);
// //   d.events = d.events.filter((e) => e.id !== eventId);
// // };

// // // ─────────────────────────────────────────────────────────────────────────────
// // // Routes
// // // ─────────────────────────────────────────────────────────────────────────────
// // const routes = [];
// // const on = (method, pattern, handler, { auth = true } = {}) => {
// //   const keys = [];
// //   const re = new RegExp(
// //     "^" + pattern.replace(/:([a-z_]+)/gi, (_, k) => (keys.push(k), "([^/]+)")) + "$"
// //   );
// //   routes.push({ method, re, keys, handler, auth });
// // };

// // const findUserByEmail = (email) =>
// //   getDb().users.find((u) => u.email.toLowerCase() === String(email ?? "").trim().toLowerCase());

// // // ── AUTH ─────────────────────────────────────────────────────────────────────
// // on("POST", "/auth/check-email", ({ body }) => {
// //   if (!findUserByEmail(body.email)) fail(400, { error: "No account found for this email." });
// //   return ok({ login_type: "PASSWORD_LOGIN" });
// // }, { auth: false });

// // on("POST", "/auth/login-password", ({ body }) => {
// //   const u = findUserByEmail(body.email);
// //   if (!u || body.password !== DEMO_PASSWORD) fail(400, { error: "Invalid email or password." });
// //   const stamp = Date.now().toString(36);
// //   return ok({
// //     access: `mock-access-${u.id}-${stamp}`,
// //     refresh: `mock-refresh-${u.id}-${stamp}`,
// //     role: u.role,
// //     Id: u.id,
// //     name: u.full_name,
// //     Gmail: u.email,
// //   });
// // }, { auth: false });

// // const otpDisabled = () => fail(400, { error: "OTP and password reset are disabled in the demo." });
// // on("POST", "/auth/request-otp", otpDisabled, { auth: false });
// // on("POST", "/auth/verify-otp", otpDisabled, { auth: false });
// // on("POST", "/auth/set-password", otpDisabled, { auth: false });
// // on("POST", "/auth/token/refresh", () => fail(401, { detail: "Token invalid." }), { auth: false });
// // on("POST", "/auth/logout", () => ok({ message: "Logged out." }), { auth: false });

// // on("GET", "/auth/employees", () => ok(getDb().users.map(userView)));
// // on("GET", "/auth/employees/:id", ({ params }) => {
// //   const u = getDb().users.find((x) => x.id === Number(params.id));
// //   if (!u) fail(404, { error: "Employee not found." });
// //   return ok(userView(u));
// // });
// // on("GET", "/auth/sessions/:id", () => ok([]));

// // // ── ANALYTICS ────────────────────────────────────────────────────────────────
// // on("GET", "/analytics/kpi", () => {
// //   const d = getDb();
// //   let revenue = 0;
// //   let pending = 0;
// //   d.payments.forEach((p) => {
// //     const s = paymentStats(p);
// //     const ev = d.events.find((e) => e.id === p.event);
// //     revenue += s.paid;
// //     if (ev.status !== "cancelled") pending += s.balance;
// //   });
// //   return ok({
// //     total_clients: d.clients.length,
// //     total_events: d.events.length,
// //     total_revenue: revenue,
// //     pending_amount: pending,
// //   });
// // });

// // // ── CLIENTS ──────────────────────────────────────────────────────────────────
// // on("GET", "/clients", ({ query: q }) => {
// //   let list = getDb().clients.slice();
// //   if (q.search) {
// //     const s = String(q.search).toLowerCase();
// //     list = list.filter((c) => contains([c.name, c.phone, c.email, c.place, c.client_code], s));
// //   }
// //   if (q.created_at_from) list = list.filter((c) => toDateStr(new Date(c.created_at)) >= q.created_at_from);
// //   if (q.created_at_to) list = list.filter((c) => toDateStr(new Date(c.created_at)) <= q.created_at_to);
// //   list.sort((a, b) => b.created_at.localeCompare(a.created_at) || b.id - a.id);
// //   const page = paginate(list, q, "/clients/");
// //   return ok({ ...page, results: page.results.map(clientView) });
// // });

// // on("POST", "/clients", ({ body, user }) => {
// //   const d = getDb();
// //   const data = validateClient(body);
// //   const id = ++d.seq.client;
// //   const c = {
// //     id,
// //     client_code: `CL-${String(id).padStart(4, "0")}`,
// //     ...data,
// //     created_by_name: user.full_name,
// //     updated_by_name: user.full_name,
// //     created_at: nowIso(),
// //     updated_at: nowIso(),
// //   };
// //   d.clients.push(c);
// //   return ok(clientView(c), 201);
// // });

// // on("GET", "/clients/:id", ({ params }) => {
// //   const c = getDb().clients.find((x) => x.id === Number(params.id));
// //   if (!c) fail(404, { error: "Client not found." });
// //   return ok(clientView(c));
// // });

// // const updateClient = ({ params, body, user }) => {
// //   const c = getDb().clients.find((x) => x.id === Number(params.id));
// //   if (!c) fail(404, { error: "Client not found." });
// //   Object.assign(c, validateClient({ ...c, ...body }, c.id), {
// //     updated_by_name: user.full_name,
// //     updated_at: nowIso(),
// //   });
// //   return ok(clientView(c));
// // };
// // on("PUT", "/clients/:id", updateClient);
// // on("PATCH", "/clients/:id", updateClient);

// // on("DELETE", "/clients/:id", ({ params }) => {
// //   const d = getDb();
// //   const c = d.clients.find((x) => x.id === Number(params.id));
// //   if (!c) fail(404, { error: "Client not found." });
// //   d.events.filter((e) => e.client === c.id).forEach((e) => removeEvent(e.id));
// //   d.clients = d.clients.filter((x) => x.id !== c.id);
// //   return ok({ message: `${c.name} deleted successfully` });
// // });

// // // ── EVENTS (specific routes first, /:id last) ────────────────────────────────
// // on("GET", "/events/upcoming", () => {
// //   const today = toDateStr(new Date());
// //   const list = getDb()
// //     .events.filter((e) => e.event_date >= today && !["cancelled", "completed"].includes(e.status))
// //     .sort((a, b) => `${a.event_date} ${a.event_time}`.localeCompare(`${b.event_date} ${b.event_time}`))
// //     .slice(0, 10)
// //     .map(eventView);
// //   return ok({ count: list.length, next: null, previous: null, results: list });
// // });

// // on("GET", "/events/calendar-summary", ({ query: q }) => {
// //   const map = {};
// //   getDb().events.forEach((e) => {
// //     if (q.event_date_from && e.event_date < q.event_date_from) return;
// //     if (q.event_date_to && e.event_date > q.event_date_to) return;
// //     map[e.event_date] = (map[e.event_date] || 0) + 1;
// //   });
// //   return ok(
// //     Object.entries(map)
// //       .map(([event_date, count]) => ({ event_date, count }))
// //       .sort((a, b) => a.event_date.localeCompare(b.event_date))
// //   );
// // });

// // on("GET", "/events", ({ query: q }) => {
// //   let list = getDb().events.slice();
// //   if (q.client) list = list.filter((e) => e.client === Number(q.client));
// //   if (q.status) list = list.filter((e) => e.status === q.status);
// //   if (q.event_date_from) list = list.filter((e) => e.event_date >= q.event_date_from);
// //   if (q.event_date_to) list = list.filter((e) => e.event_date <= q.event_date_to);
// //   if (q.search) {
// //     const s = String(q.search).toLowerCase();
// //     list = list.filter((e) => {
// //       const v = eventView(e);
// //       return contains([v.event_code, v.client_name, v.client_phone, v.photography_type, v.location], s);
// //     });
// //   }
// //   const key = (e) => `${e.event_date} ${e.event_time}`;
// //   const singleDay = q.event_date_from && q.event_date_from === q.event_date_to;
// //   list.sort((a, b) => (singleDay ? key(a).localeCompare(key(b)) : key(b).localeCompare(key(a))));
// //   const page = paginate(list, q, "/events/");
// //   return ok({ ...page, results: page.results.map(eventView) });
// // });

// // on("POST", "/events", ({ body, user }) => {
// //   const d = getDb();
// //   const errs = {};
// //   const client = d.clients.find((c) => c.id === Number(body.client));
// //   if (!client) errs.client = ["Select a valid client."];
// //   ["photography_type", "location", "event_date", "event_time"].forEach((f) => {
// //     if (!String(body[f] ?? "").trim()) errs[f] = ["This field is required."];
// //   });
// //   if (Object.keys(errs).length) fail(400, errs);

// //   if (!body.force_save) {
// //     const msg = conflictFor(body.event_date);
// //     if (msg) fail(400, { conflict: [msg] });
// //   }

// //   const id = ++d.seq.event;
// //   const payId = ++d.seq.payment;
// //   const ev = {
// //     id,
// //     event_code: `EV-${String(id).padStart(4, "0")}`,
// //     client: client.id,
// //     photography_type: body.photography_type.trim(),
// //     location: body.location.trim(),
// //     event_date: body.event_date,
// //     event_time: normTime(body.event_time),
// //     address: body.address ?? "",
// //     description: body.description ?? "",
// //     status: "scheduled",
// //     payId,
// //     created_by_name: user.full_name,
// //     updated_by_name: user.full_name,
// //     created_at: nowIso(),
// //     updated_at: nowIso(),
// //   };
// //   d.events.push(ev);
// //   d.payments.push({ id: payId, event: id, total_amount: 0 });
// //   return ok(eventView(ev), 201);
// // });

// // on("GET", "/events/:id", ({ params }) => {
// //   const e = getDb().events.find((x) => x.id === Number(params.id));
// //   if (!e) fail(404, { error: "Event not found." });
// //   return ok(eventView(e));
// // });

// // on("PATCH", "/events/:id", ({ params, body, user }) => {
// //   const e = getDb().events.find((x) => x.id === Number(params.id));
// //   if (!e) fail(404, { error: "Event not found." });

// //   if (body.event_date && body.event_date !== e.event_date && !body.force_save) {
// //     const msg = conflictFor(body.event_date, e.id);
// //     if (msg) fail(400, { conflict: [msg] });
// //   }
// //   ["photography_type", "location", "event_date", "address", "description", "status"].forEach((f) => {
// //     if (body[f] !== undefined && body[f] !== null) e[f] = body[f];
// //   });
// //   if (body.event_time) e.event_time = normTime(body.event_time);
// //   e.updated_by_name = user.full_name;
// //   e.updated_at = nowIso();
// //   return ok(eventView(e));
// // });

// // on("DELETE", "/events/:id", ({ params }) => {
// //   removeEvent(Number(params.id));
// //   return ok("", 204);
// // });

// // // ── PAYMENTS ─────────────────────────────────────────────────────────────────
// // on("GET", "/payments", ({ query: q }) => {
// //   let list = getDb().payments.map(paymentView);
// //   if (q.status) list = list.filter((p) => p.status === q.status);
// //   if (q.event_date__gte) list = list.filter((p) => p.event_date >= q.event_date__gte);
// //   if (q.event_date__lte) list = list.filter((p) => p.event_date <= q.event_date__lte);
// //   if (q.search) {
// //     const s = String(q.search).toLowerCase();
// //     list = list.filter((p) =>
// //       contains([p.event_code, p.client_name, p.client_phone, p.photography_type], s)
// //     );
// //   }
// //   list.sort((a, b) => b.event_date.localeCompare(a.event_date) || b.id - a.id);
// //   return ok(paginate(list, q, "/payments/"));
// // });

// // on("PATCH", "/payments/:id", ({ params, body }) => {
// //   const p = getDb().payments.find((x) => x.id === Number(params.id));
// //   if (!p) fail(404, { error: "Payment not found." });
// //   const total = Number(body.total_amount);
// //   const { paid } = paymentStats(p);
// //   if (Number.isNaN(total) || total < 0) fail(400, { total_amount: ["Enter a valid amount."] });
// //   if (total === 0 && paid > 0)
// //     fail(400, { total_amount: ["Delete all transactions before resetting the total to 0."] });
// //   if (total > 0 && total < paid)
// //     fail(400, { total_amount: [`Total can't be less than the ₹${paid} already paid.`] });
// //   p.total_amount = total;
// //   return ok(paymentView(p));
// // });

// // // ── TRANSACTIONS ─────────────────────────────────────────────────────────────
// // on("GET", "/transactions", ({ query: q }) => {
// //   let list = getDb().transactions.slice();
// //   if (q.payment) list = list.filter((t) => t.payment === Number(q.payment));
// //   list.sort((a, b) => b.payment_date.localeCompare(a.payment_date) || b.id - a.id);
// //   return ok({ count: list.length, next: null, previous: null, results: list });
// // });

// // on("POST", "/transactions", ({ body }) => {
// //   const d = getDb();
// //   const p = d.payments.find((x) => x.id === Number(body.payment));
// //   if (!p) fail(400, { payment: ["Invalid payment."] });
// //   const amount = Number(body.amount);
// //   const ev = d.events.find((e) => e.id === p.event);
// //   const s = paymentStats(p);
// //   if (!(amount > 0)) fail(400, { amount: ["Enter an amount greater than 0."] });
// //   if (ev.status === "cancelled") fail(400, { amount: ["Can't add a payment to a cancelled event."] });
// //   if (s.total <= 0) fail(400, { amount: ["Set the total amount first."] });
// //   if (amount > s.balance) fail(400, { amount: [`Amount exceeds the balance of ₹${s.balance}.`] });
// //   const t = {
// //     id: ++d.seq.transaction,
// //     payment: p.id,
// //     amount,
// //     payment_date: body.payment_date || toDateStr(new Date()),
// //     payment_method: body.payment_method || "cash",
// //   };
// //   d.transactions.push(t);
// //   return ok(t, 201);
// // });

// // on("DELETE", "/transactions/:id", ({ params }) => {
// //   const d = getDb();
// //   const id = Number(params.id);
// //   if (!d.transactions.some((t) => t.id === id)) fail(404, { error: "Transaction not found." });
// //   d.transactions = d.transactions.filter((t) => t.id !== id);
// //   return ok("", 204);
// // });

// // // ─────────────────────────────────────────────────────────────────────────────
// // // Request plumbing
// // // ─────────────────────────────────────────────────────────────────────────────
// // const parseUrl = (config) => {
// //   let url = config.url || "";
// //   if (config.baseURL && url.startsWith(config.baseURL)) url = url.slice(config.baseURL.length);
// //   url = url.replace(/^https?:\/\/[^/]+/i, "");
// //   const [rawPath, rawQs = ""] = url.split("?");
// //   return {
// //     path: "/" + rawPath.replace(/^\/+|\/+$/g, ""),
// //     query: { ...Object.fromEntries(new URLSearchParams(rawQs)), ...(config.params || {}) },
// //   };
// // };

// // const parseBody = (data) => {
// //   if (!data) return {};
// //   if (typeof data === "string") {
// //     try {
// //       return JSON.parse(data);
// //     } catch {
// //       return {};
// //     }
// //   }
// //   return typeof data === "object" && !(data instanceof FormData) ? data : {};
// // };

// // const userFromConfig = (config) => {
// //   const h = config.headers;
// //   const raw = (typeof h?.get === "function" ? h.get("Authorization") : h?.Authorization) || "";
// //   const m = /^Bearer mock-access-(\d+)-/.exec(raw);
// //   return m ? getDb().users.find((u) => u.id === Number(m[1])) : null;
// // };

// // const dispatch = (method, path, query, body, config) => {
// //   for (const r of routes) {
// //     if (r.method !== method) continue;
// //     const m = r.re.exec(path);
// //     if (!m) continue;
// //     const params = Object.fromEntries(r.keys.map((k, i) => [k, decodeURIComponent(m[i + 1])]));
// //     const user = userFromConfig(config);
// //     if (r.auth && !user) fail(401, { detail: "Authentication credentials were not provided." });
// //     return r.handler({ params, query, body, user });
// //   }
// //   // Not implemented by the demo (Gallery, Bookings, Integrations, …)
// //   console.warn(`[demo] no mock handler for ${method} ${path}`);
// //   if (method === "GET") return ok({ count: 0, next: null, previous: null, results: [] });
// //   return fail(403, { error: "This action is disabled in the demo." });
// // };

// // /** axios adapter — plug into axios.create({ adapter: mockAdapter }) */
// // export async function mockAdapter(config) {
// //   await sleep(LATENCY[0] + Math.random() * (LATENCY[1] - LATENCY[0]));

// //   const method = (config.method || "get").toUpperCase();
// //   const { path, query } = parseUrl(config);
// //   const body = parseBody(config.data);

// //   let result;
// //   try {
// //     result = dispatch(method, path, query, body, config);
// //   } catch (e) {
// //     if (e instanceof HttpError) result = { status: e.status, data: e.data };
// //     else {
// //       console.error("[demo] mock handler crashed:", e);
// //       result = { status: 500, data: { error: "Demo server error." } };
// //     }
// //   }

// //   const response = {
// //     data: result.data,
// //     status: result.status,
// //     statusText: String(result.status),
// //     headers: {},
// //     config,
// //     request: {},
// //   };

// //   if (result.status >= 400) {
// //     throw new AxiosError(
// //       `Request failed with status code ${result.status}`,
// //       result.status >= 500 ? AxiosError.ERR_BAD_RESPONSE : AxiosError.ERR_BAD_REQUEST,
// //       config,
// //       null,
// //       response
// //     );
// //   }
// //   return response;
// // }

// // // re-export for convenience
// // export { avatarFor };









// // src/api/mock/mockServer.js
// // ─────────────────────────────────────────────────────────────────────────────
// // A tiny in-browser "backend" that plugs into axios as a custom adapter.
// // All your existing service files (ClientServices, EventServices, …) keep
// // working unchanged. State lives in memory: add / edit / delete works during a
// // visit, and a page refresh restores a fresh, date-correct dataset.
// // ─────────────────────────────────────────────────────────────────────────────
// import { AxiosError } from "axios";
// import { createDb, toDateStr, avatarFor, DEMO_PASSWORD } from "./mockData";

// const LATENCY = [180, 420]; // ms — fake network delay so spinners show

// let db = null;
// const getDb = () => {
//   if (!db) {
//     db = createDb();
//     console.info("[demo] Mock backend active — no real API calls are made.");
//   }
//   return db;
// };

// const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

// class HttpError extends Error {
//   constructor(status, data) {
//     super(`HTTP ${status}`);
//     this.status = status;
//     this.data = data;
//   }
// }
// const fail = (status, data) => {
//   throw new HttpError(status, data);
// };
// const ok = (data, status = 200) => ({ status, data });

// const nowIso = () => new Date().toISOString();
// const normTime = (t) => (/^\d{2}:\d{2}$/.test(String(t)) ? `${t}:00` : t);
// const sum = (arr) => arr.reduce((a, b) => a + b, 0);
// const contains = (fields, s) => fields.some((f) => String(f ?? "").toLowerCase().includes(s));

// // ── pagination (DRF style) ───────────────────────────────────────────────────
// const paginate = (list, q, path) => {
//   const size = Math.max(1, parseInt(q.page_size, 10) || 25);
//   const page = Math.max(1, parseInt(q.page, 10) || 1);
//   const start = (page - 1) * size;
//   return {
//     count: list.length,
//     next: start + size < list.length ? `${path}?page=${page + 1}` : null,
//     previous: page > 1 ? `${path}?page=${page - 1}` : null,
//     results: list.slice(start, start + size),
//   };
// };

// // ── payment math (always derived from transactions) ──────────────────────────
// const paymentStats = (p) => {
//   const paid = sum(getDb().transactions.filter((t) => t.payment === p.id).map((t) => t.amount));
//   const total = Number(p.total_amount) || 0;
//   return {
//     total,
//     paid,
//     balance: Math.max(0, total - paid),
//     status: paid <= 0 ? "pending" : total > 0 && paid >= total ? "paid" : "partial",
//   };
// };

// // ── serializers ──────────────────────────────────────────────────────────────
// const clientView = (c) => ({ ...c });

// const userView = (u) => ({
//   id: u.id,
//   full_name: u.full_name,
//   name: u.full_name,
//   email: u.email,
//   phone: u.phone,
//   role: u.role,
//   picture: u.picture,
//   is_active: true,
// });

// const eventView = (e) => {
//   const { clients, payments } = getDb();
//   const c = clients.find((x) => x.id === e.client) || {};
//   const p = payments.find((x) => x.id === e.payId);
//   const s = paymentStats(p);
//   return {
//     id: e.id,
//     event_code: e.event_code,
//     client: e.client,
//     client_id: e.client,
//     client_name: c.name,
//     client_phone: c.phone,
//     client_place: c.place,
//     photography_type: e.photography_type,
//     location: e.location,
//     event_date: e.event_date,
//     event_time: e.event_time,
//     address: e.address,
//     description: e.description,
//     status: e.status,
//     payId: p.id,
//     total_amount: s.total,
//     total_paid: s.paid,
//     balance_amount: s.balance,
//     pay_status: s.status,
//     created_by_name: e.created_by_name,
//     updated_by_name: e.updated_by_name,
//     created_at: e.created_at,
//     updated_at: e.updated_at,
//   };
// };

// const paymentView = (p) => {
//   const { events, clients } = getDb();
//   const e = events.find((x) => x.id === p.event);
//   const c = clients.find((x) => x.id === e.client) || {};
//   const s = paymentStats(p);
//   return {
//     id: p.id,
//     event: e.id,
//     event_code: e.event_code,
//     event_status: e.status,
//     client_id: c.id,
//     client_name: c.name,
//     client_phone: c.phone,
//     client_place: c.place,
//     photography_type: e.photography_type,
//     event_date: e.event_date,
//     event_time: e.event_time,
//     total_amount: s.total,
//     total_paid: s.paid,
//     balance_amount: s.balance,
//     status: s.status,
//   };
// };

// // ── validation helpers ───────────────────────────────────────────────────────
// const validateClient = (body, selfId = null) => {
//   const errs = {};
//   const name = String(body.name ?? "").trim();
//   const phone = String(body.phone ?? "").trim();
//   const email = String(body.email ?? "").trim();
//   if (!name) errs.name = ["Name is required."];
//   if (!phone) errs.phone = ["Phone is required."];
//   else if (!/^\d{10}$/.test(phone)) errs.phone = ["Enter a valid 10-digit phone number."];
//   else if (getDb().clients.some((c) => c.phone === phone && c.id !== selfId))
//     errs.phone = ["A client with this phone number already exists."];
//   if (email && !/^\S+@\S+\.\S+$/.test(email)) errs.email = ["Enter a valid email address."];
//   if (Object.keys(errs).length) fail(400, errs);
//   return { name, phone, email, place: body.place ?? "", address: body.address ?? "", notes: body.notes ?? "" };
// };

// const conflictFor = (date, excludeId = null) => {
//   const { events, clients } = getDb();
//   const clash = events.filter(
//     (e) => e.event_date === date && e.status !== "cancelled" && e.id !== excludeId
//   );
//   if (!clash.length) return null;
//   const list = clash
//     .map((e) => {
//       const c = clients.find((x) => x.id === e.client);
//       return `${e.photography_type} – ${c?.name} (${e.event_time.slice(0, 5)})`;
//     })
//     .join(", ");
//   return `${clash.length} event${clash.length > 1 ? "s" : ""} already scheduled on ${date}: ${list}`;
// };

// const createClientRecord = (user, data) => {
//   const d = getDb();
//   const id = ++d.seq.client;
//   const c = {
//     id,
//     client_code: `CL-${String(id).padStart(4, "0")}`,
//     ...data,
//     created_by_name: user.full_name,
//     updated_by_name: user.full_name,
//     created_at: nowIso(),
//     updated_at: nowIso(),
//   };
//   d.clients.push(c);
//   return c;
// };

// const createEventRecord = (user, clientId, f) => {
//   const d = getDb();
//   const id = ++d.seq.event;
//   const payId = ++d.seq.payment;
//   const ev = {
//     id,
//     event_code: `EV-${String(id).padStart(4, "0")}`,
//     client: clientId,
//     photography_type: String(f.photography_type).trim(),
//     location: String(f.location ?? "").trim(),
//     event_date: f.event_date,
//     event_time: normTime(f.event_time),
//     address: f.address ?? "",
//     description: f.description ?? "",
//     status: "scheduled",
//     payId,
//     created_by_name: user.full_name,
//     updated_by_name: user.full_name,
//     created_at: nowIso(),
//     updated_at: nowIso(),
//   };
//   d.events.push(ev);
//   d.payments.push({ id: payId, event: id, total_amount: 0 });
//   return ev;
// };

// const removeEvent = (eventId) => {
//   const d = getDb();
//   const ev = d.events.find((e) => e.id === eventId);
//   if (!ev) return;
//   d.transactions = d.transactions.filter((t) => t.payment !== ev.payId);
//   d.payments = d.payments.filter((p) => p.id !== ev.payId);
//   d.events = d.events.filter((e) => e.id !== eventId);
// };

// // ─────────────────────────────────────────────────────────────────────────────
// // Routes
// // ─────────────────────────────────────────────────────────────────────────────
// const routes = [];
// const on = (method, pattern, handler, { auth = true } = {}) => {
//   const keys = [];
//   const re = new RegExp(
//     "^" + pattern.replace(/:([a-z_]+)/gi, (_, k) => (keys.push(k), "([^/]+)")) + "$"
//   );
//   routes.push({ method, re, keys, handler, auth });
// };

// const findUserByEmail = (email) =>
//   getDb().users.find((u) => u.email.toLowerCase() === String(email ?? "").trim().toLowerCase());

// // ── AUTH ─────────────────────────────────────────────────────────────────────
// on("POST", "/auth/check-email", ({ body }) => {
//   if (!findUserByEmail(body.email)) fail(400, { error: "No account found for this email." });
//   return ok({ login_type: "PASSWORD_LOGIN" });
// }, { auth: false });

// on("POST", "/auth/login-password", ({ body }) => {
//   const u = findUserByEmail(body.email);
//   if (!u || body.password !== DEMO_PASSWORD) fail(400, { error: "Invalid email or password." });
//   const stamp = Date.now().toString(36);
//   return ok({
//     access: `mock-access-${u.id}-${stamp}`,
//     refresh: `mock-refresh-${u.id}-${stamp}`,
//     role: u.role,
//     Id: u.id,
//     name: u.full_name,
//     Gmail: u.email,
//   });
// }, { auth: false });

// const otpDisabled = () => fail(400, { error: "OTP and password reset are disabled in the demo." });
// on("POST", "/auth/request-otp", otpDisabled, { auth: false });
// on("POST", "/auth/verify-otp", otpDisabled, { auth: false });
// on("POST", "/auth/set-password", otpDisabled, { auth: false });
// on("POST", "/auth/token/refresh", () => fail(401, { detail: "Token invalid." }), { auth: false });
// on("POST", "/auth/logout", () => ok({ message: "Logged out." }), { auth: false });

// on("GET", "/auth/employees", () => ok(getDb().users.map(userView)));
// on("GET", "/auth/employees/:id", ({ params }) => {
//   const u = getDb().users.find((x) => x.id === Number(params.id));
//   if (!u) fail(404, { error: "Employee not found." });
//   return ok(userView(u));
// });
// on("GET", "/auth/sessions/:id", () => ok([]));

// // ── ANALYTICS ────────────────────────────────────────────────────────────────
// on("GET", "/analytics/kpi", () => {
//   const d = getDb();
//   let revenue = 0;
//   let pending = 0;
//   d.payments.forEach((p) => {
//     const s = paymentStats(p);
//     const ev = d.events.find((e) => e.id === p.event);
//     revenue += s.paid;
//     if (ev.status !== "cancelled") pending += s.balance;
//   });
//   return ok({
//     total_clients: d.clients.length,
//     total_events: d.events.length,
//     total_revenue: revenue,
//     pending_amount: pending,
//   });
// });

// // ── CLIENTS ──────────────────────────────────────────────────────────────────
// on("GET", "/clients", ({ query: q }) => {
//   let list = getDb().clients.slice();
//   if (q.search) {
//     const s = String(q.search).toLowerCase();
//     list = list.filter((c) => contains([c.name, c.phone, c.email, c.place, c.client_code], s));
//   }
//   if (q.created_at_from) list = list.filter((c) => toDateStr(new Date(c.created_at)) >= q.created_at_from);
//   if (q.created_at_to) list = list.filter((c) => toDateStr(new Date(c.created_at)) <= q.created_at_to);
//   list.sort((a, b) => b.created_at.localeCompare(a.created_at) || b.id - a.id);
//   const page = paginate(list, q, "/clients/");
//   return ok({ ...page, results: page.results.map(clientView) });
// });

// on("POST", "/clients", ({ body, user }) => {
//   const c = createClientRecord(user, validateClient(body));
//   return ok(clientView(c), 201);
// });

// on("GET", "/clients/:id", ({ params }) => {
//   const c = getDb().clients.find((x) => x.id === Number(params.id));
//   if (!c) fail(404, { error: "Client not found." });
//   return ok(clientView(c));
// });

// const updateClient = ({ params, body, user }) => {
//   const c = getDb().clients.find((x) => x.id === Number(params.id));
//   if (!c) fail(404, { error: "Client not found." });
//   Object.assign(c, validateClient({ ...c, ...body }, c.id), {
//     updated_by_name: user.full_name,
//     updated_at: nowIso(),
//   });
//   return ok(clientView(c));
// };
// on("PUT", "/clients/:id", updateClient);
// on("PATCH", "/clients/:id", updateClient);

// on("DELETE", "/clients/:id", ({ params }) => {
//   const d = getDb();
//   const c = d.clients.find((x) => x.id === Number(params.id));
//   if (!c) fail(404, { error: "Client not found." });
//   d.events.filter((e) => e.client === c.id).forEach((e) => removeEvent(e.id));
//   d.clients = d.clients.filter((x) => x.id !== c.id);
//   return ok({ message: `${c.name} deleted successfully` });
// });

// // ── EVENTS (specific routes first, /:id last) ────────────────────────────────
// on("GET", "/events/upcoming", () => {
//   const today = toDateStr(new Date());
//   const list = getDb()
//     .events.filter((e) => e.event_date >= today && !["cancelled", "completed"].includes(e.status))
//     .sort((a, b) => `${a.event_date} ${a.event_time}`.localeCompare(`${b.event_date} ${b.event_time}`))
//     .slice(0, 10)
//     .map(eventView);
//   return ok({ count: list.length, next: null, previous: null, results: list });
// });

// on("GET", "/events/calendar-summary", ({ query: q }) => {
//   const map = {};
//   getDb().events.forEach((e) => {
//     if (q.event_date_from && e.event_date < q.event_date_from) return;
//     if (q.event_date_to && e.event_date > q.event_date_to) return;
//     map[e.event_date] = (map[e.event_date] || 0) + 1;
//   });
//   return ok(
//     Object.entries(map)
//       .map(([event_date, count]) => ({ event_date, count }))
//       .sort((a, b) => a.event_date.localeCompare(b.event_date))
//   );
// });

// on("GET", "/events", ({ query: q }) => {
//   let list = getDb().events.slice();
//   if (q.client) list = list.filter((e) => e.client === Number(q.client));
//   if (q.status) list = list.filter((e) => e.status === q.status);
//   if (q.event_date_from) list = list.filter((e) => e.event_date >= q.event_date_from);
//   if (q.event_date_to) list = list.filter((e) => e.event_date <= q.event_date_to);
//   if (q.search) {
//     const s = String(q.search).toLowerCase();
//     list = list.filter((e) => {
//       const v = eventView(e);
//       return contains([v.event_code, v.client_name, v.client_phone, v.photography_type, v.location], s);
//     });
//   }
//   const key = (e) => `${e.event_date} ${e.event_time}`;
//   const singleDay = q.event_date_from && q.event_date_from === q.event_date_to;
//   list.sort((a, b) => (singleDay ? key(a).localeCompare(key(b)) : key(b).localeCompare(key(a))));
//   const page = paginate(list, q, "/events/");
//   return ok({ ...page, results: page.results.map(eventView) });
// });

// on("POST", "/events", ({ body, user }) => {
//   const d = getDb();
//   const errs = {};
//   const client = d.clients.find((c) => c.id === Number(body.client));
//   if (!client) errs.client = ["Select a valid client."];
//   ["photography_type", "location", "event_date", "event_time"].forEach((f) => {
//     if (!String(body[f] ?? "").trim()) errs[f] = ["This field is required."];
//   });
//   if (Object.keys(errs).length) fail(400, errs);

//   if (!body.force_save) {
//     const msg = conflictFor(body.event_date);
//     if (msg) fail(400, { conflict: [msg] });
//   }

//   const ev = createEventRecord(user, client.id, body);
//   return ok(eventView(ev), 201);
// });

// on("GET", "/events/:id", ({ params }) => {
//   const e = getDb().events.find((x) => x.id === Number(params.id));
//   if (!e) fail(404, { error: "Event not found." });
//   return ok(eventView(e));
// });

// on("PATCH", "/events/:id", ({ params, body, user }) => {
//   const e = getDb().events.find((x) => x.id === Number(params.id));
//   if (!e) fail(404, { error: "Event not found." });

//   if (body.event_date && body.event_date !== e.event_date && !body.force_save) {
//     const msg = conflictFor(body.event_date, e.id);
//     if (msg) fail(400, { conflict: [msg] });
//   }
//   ["photography_type", "location", "event_date", "address", "description", "status"].forEach((f) => {
//     if (body[f] !== undefined && body[f] !== null) e[f] = body[f];
//   });
//   if (body.event_time) e.event_time = normTime(body.event_time);
//   e.updated_by_name = user.full_name;
//   e.updated_at = nowIso();
//   return ok(eventView(e));
// });

// on("DELETE", "/events/:id", ({ params }) => {
//   removeEvent(Number(params.id));
//   return ok("", 204);
// });

// // ── PAYMENTS ─────────────────────────────────────────────────────────────────
// on("GET", "/payments", ({ query: q }) => {
//   let list = getDb().payments.map(paymentView);
//   if (q.status) list = list.filter((p) => p.status === q.status);
//   if (q.event_date__gte) list = list.filter((p) => p.event_date >= q.event_date__gte);
//   if (q.event_date__lte) list = list.filter((p) => p.event_date <= q.event_date__lte);
//   if (q.search) {
//     const s = String(q.search).toLowerCase();
//     list = list.filter((p) =>
//       contains([p.event_code, p.client_name, p.client_phone, p.photography_type], s)
//     );
//   }
//   list.sort((a, b) => b.event_date.localeCompare(a.event_date) || b.id - a.id);
//   return ok(paginate(list, q, "/payments/"));
// });

// on("PATCH", "/payments/:id", ({ params, body }) => {
//   const p = getDb().payments.find((x) => x.id === Number(params.id));
//   if (!p) fail(404, { error: "Payment not found." });
//   const total = Number(body.total_amount);
//   const { paid } = paymentStats(p);
//   if (Number.isNaN(total) || total < 0) fail(400, { total_amount: ["Enter a valid amount."] });
//   if (total === 0 && paid > 0)
//     fail(400, { total_amount: ["Delete all transactions before resetting the total to 0."] });
//   if (total > 0 && total < paid)
//     fail(400, { total_amount: [`Total can't be less than the ₹${paid} already paid.`] });
//   p.total_amount = total;
//   return ok(paymentView(p));
// });

// // ── TRANSACTIONS ─────────────────────────────────────────────────────────────
// on("GET", "/transactions", ({ query: q }) => {
//   let list = getDb().transactions.slice();
//   if (q.payment) list = list.filter((t) => t.payment === Number(q.payment));
//   list.sort((a, b) => b.payment_date.localeCompare(a.payment_date) || b.id - a.id);
//   return ok({ count: list.length, next: null, previous: null, results: list });
// });

// on("POST", "/transactions", ({ body }) => {
//   const d = getDb();
//   const p = d.payments.find((x) => x.id === Number(body.payment));
//   if (!p) fail(400, { payment: ["Invalid payment."] });
//   const amount = Number(body.amount);
//   const ev = d.events.find((e) => e.id === p.event);
//   const s = paymentStats(p);
//   if (!(amount > 0)) fail(400, { amount: ["Enter an amount greater than 0."] });
//   if (ev.status === "cancelled") fail(400, { amount: ["Can't add a payment to a cancelled event."] });
//   if (s.total <= 0) fail(400, { amount: ["Set the total amount first."] });
//   if (amount > s.balance) fail(400, { amount: [`Amount exceeds the balance of ₹${s.balance}.`] });
//   const t = {
//     id: ++d.seq.transaction,
//     payment: p.id,
//     amount,
//     payment_date: body.payment_date || toDateStr(new Date()),
//     payment_method: body.payment_method || "cash",
//   };
//   d.transactions.push(t);
//   return ok(t, 201);
// });

// on("DELETE", "/transactions/:id", ({ params }) => {
//   const d = getDb();
//   const id = Number(params.id);
//   if (!d.transactions.some((t) => t.id === id)) fail(404, { error: "Transaction not found." });
//   d.transactions = d.transactions.filter((t) => t.id !== id);
//   return ok("", 204);
// });

// // ── BOOKINGS (requests from the public website) ─────────────────────────────
// const bookingView = (b) => {
//   const c = getDb().clients.find((x) => x.phone === b.phone);
//   return {
//     id: b.id,
//     name: b.name,
//     phone: b.phone,
//     event_type: b.event_type,
//     event_date: b.event_date,
//     location: b.location,
//     status: b.status,
//     created_at: b.created_at,
//     is_returning: !!c,
//     existing_client: c
//       ? {
//           id: c.id,
//           client_code: c.client_code,
//           name: c.name,
//           phone: c.phone,
//           email: c.email || "",
//           place: c.place || "",
//           address: c.address || "",
//         }
//       : null,
//   };
// };

// on("GET", "/bookings", ({ query: q }) => {
//   let list = getDb().bookings.slice();
//   if (q.status) list = list.filter((b) => b.status === q.status);
//   list.sort((a, b) => b.created_at.localeCompare(a.created_at));
//   return ok(list.map(bookingView)); // plain array, like the real API
// });

// on("POST", "/bookings/:id/accept", ({ params, body, user }) => {
//   const d = getDb();
//   const b = d.bookings.find((x) => x.id === Number(params.id) && x.status === "pending");
//   if (!b) fail(404, { error: "Booking not found or already processed." });

//   const errs = {};
//   const name = String(body.name ?? "").trim();
//   const phone = String(body.phone ?? "").trim();
//   if (!name) errs.name = ["Name is required."];
//   if (!/^\d{10}$/.test(phone)) errs.phone = ["Enter a valid 10-digit phone number."];
//   ["event_type", "event_date", "event_time"].forEach((f) => {
//     if (!String(body[f] ?? "").trim()) errs[f] = ["This field is required."];
//   });
//   const email = String(body.email ?? "").trim();
//   if (email && !/^\S+@\S+\.\S+$/.test(email)) errs.email = ["Enter a valid email address."];
//   if (Object.keys(errs).length) fail(400, { ...errs, error: "Please fix the highlighted fields." });

//   if (!body.force_save) {
//     const msg = conflictFor(body.event_date);
//     if (msg) fail(409, { conflict: msg });
//   }

//   // returning client (matched by phone) → update it, otherwise create a new one
//   let client = d.clients.find((c) => c.phone === phone);
//   const fields = {
//     name,
//     email,
//     place: body.place ?? "",
//     address: body.address ?? "",
//     notes: body.notes || client?.notes || "",
//   };
//   if (client) {
//     Object.assign(client, fields, { updated_by_name: user.full_name, updated_at: nowIso() });
//   } else {
//     client = createClientRecord(user, { ...fields, phone });
//   }

//   const ev = createEventRecord(user, client.id, {
//     photography_type: body.event_type,
//     location: body.location,
//     event_date: body.event_date,
//     event_time: body.event_time,
//     description: body.description,
//     address: body.location,
//   });
//   b.status = "accepted";
//   return ok({ message: "Booking accepted.", client: client.id, event: ev.id }, 201);
// });

// on("POST", "/bookings/:id/decline", ({ params }) => {
//   const b = getDb().bookings.find((x) => x.id === Number(params.id) && x.status === "pending");
//   if (!b) fail(404, { error: "Booking not found or already processed." });
//   b.status = "declined";
//   return ok({ message: "Booking declined." });
// });

// // ── GALLERY ──────────────────────────────────────────────────────────────────
// const IMAGE_MAX_MB = 10;
// const VIDEO_MAX_MB = 200;

// on("GET", "/gallery", () => {
//   const list = getDb().gallery.slice().sort((a, b) => b.created_at.localeCompare(a.created_at));
//   return ok(list); // plain array, like the real API
// });

// on("POST", "/gallery/upload", ({ body, user }) => {
//   const f = body.file;
//   if (!f || typeof f === "string" || typeof f.size !== "number")
//     fail(400, { file: ["No file was submitted."] });

//   const type = f.type || "";
//   const category = type.startsWith("video/") ? "video" : type.startsWith("image/") ? "image" : null;
//   if (!category) fail(400, { file: ["Only image or video files are allowed."] });
//   const maxMB = category === "image" ? IMAGE_MAX_MB : VIDEO_MAX_MB;
//   if (f.size > maxMB * 1024 * 1024) fail(400, { file: [`File must be ≤ ${maxMB} MB.`] });

//   const d = getDb();
//   const item = {
//     id: ++d.seq.gallery,
//     title: String(body.title ?? "").trim(),
//     category,
//     original_filename: f.name || "upload",
//     file_size: f.size,
//     // blob: URL — the upload shows up instantly and lives until the page reloads
//     signed_url: URL.createObjectURL(f),
//     created_at: nowIso(),
//     uploaded_by_name: user.full_name,
//   };
//   d.gallery.push(item);
//   return ok(item, 201);
// });

// on("DELETE", "/gallery/:id", ({ params }) => {
//   const d = getDb();
//   const item = d.gallery.find((g) => g.id === Number(params.id));
//   if (!item) fail(404, { error: "Item not found." });
//   if (item.signed_url.startsWith("blob:")) URL.revokeObjectURL(item.signed_url);
//   d.gallery = d.gallery.filter((g) => g.id !== item.id);
//   return ok("", 204);
// });

// // ─────────────────────────────────────────────────────────────────────────────
// // Request plumbing
// // ─────────────────────────────────────────────────────────────────────────────
// const parseUrl = (config) => {
//   let url = config.url || "";
//   if (config.baseURL && url.startsWith(config.baseURL)) url = url.slice(config.baseURL.length);
//   url = url.replace(/^https?:\/\/[^/]+/i, "");
//   const [rawPath, rawQs = ""] = url.split("?");
//   return {
//     path: "/" + rawPath.replace(/^\/+|\/+$/g, ""),
//     query: { ...Object.fromEntries(new URLSearchParams(rawQs)), ...(config.params || {}) },
//   };
// };

// const parseBody = (data) => {
//   if (!data) return {};
//   if (typeof data === "string") {
//     try {
//       return JSON.parse(data);
//     } catch {
//       return {};
//     }
//   }
//   if (typeof FormData !== "undefined" && data instanceof FormData) return Object.fromEntries(data.entries());
//   return typeof data === "object" ? data : {};
// };

// const userFromConfig = (config) => {
//   const h = config.headers;
//   const raw = (typeof h?.get === "function" ? h.get("Authorization") : h?.Authorization) || "";
//   const m = /^Bearer mock-access-(\d+)-/.exec(raw);
//   return m ? getDb().users.find((u) => u.id === Number(m[1])) : null;
// };

// const dispatch = (method, path, query, body, config) => {
//   for (const r of routes) {
//     if (r.method !== method) continue;
//     const m = r.re.exec(path);
//     if (!m) continue;
//     const params = Object.fromEntries(r.keys.map((k, i) => [k, decodeURIComponent(m[i + 1])]));
//     const user = userFromConfig(config);
//     if (r.auth && !user) fail(401, { detail: "Authentication credentials were not provided." });
//     return r.handler({ params, query, body, user });
//   }
//   // Not implemented by the demo (Employees write actions, Integrations, …)
//   console.warn(`[demo] no mock handler for ${method} ${path}`);
//   if (method === "GET") return ok({ count: 0, next: null, previous: null, results: [] });
//   return fail(403, { error: "This action is disabled in the demo." });
// };

// /** axios adapter — plug into axios.create({ adapter: mockAdapter }) */
// export async function mockAdapter(config) {
//   await sleep(LATENCY[0] + Math.random() * (LATENCY[1] - LATENCY[0]));

//   const method = (config.method || "get").toUpperCase();
//   const { path, query } = parseUrl(config);
//   const body = parseBody(config.data);

//   let result;
//   try {
//     result = dispatch(method, path, query, body, config);
//   } catch (e) {
//     if (e instanceof HttpError) result = { status: e.status, data: e.data };
//     else {
//       console.error("[demo] mock handler crashed:", e);
//       result = { status: 500, data: { error: "Demo server error." } };
//     }
//   }

//   const response = {
//     data: result.data,
//     status: result.status,
//     statusText: String(result.status),
//     headers: {},
//     config,
//     request: {},
//   };

//   if (result.status >= 400) {
//     throw new AxiosError(
//       `Request failed with status code ${result.status}`,
//       result.status >= 500 ? AxiosError.ERR_BAD_RESPONSE : AxiosError.ERR_BAD_REQUEST,
//       config,
//       null,
//       response
//     );
//   }
//   return response;
// }

// // re-export for convenience
// export { avatarFor };



// src/api/mock/mockServer.js
// ─────────────────────────────────────────────────────────────────────────────
// A tiny in-browser "backend" that plugs into axios as a custom adapter.
// All your existing service files (ClientServices, EventServices, …) keep
// working unchanged. State lives in memory: add / edit / delete works during a
// visit, and a page refresh restores a fresh, date-correct dataset.
// ─────────────────────────────────────────────────────────────────────────────
import { AxiosError } from "axios";
import { createDb, toDateStr, avatarFor, DEMO_PASSWORD } from "./mockData";

const LATENCY = [180, 420]; // ms — fake network delay so spinners show

let db = null;
const getDb = () => {
  if (!db) {
    db = createDb();
    console.info("[demo] Mock backend active — no real API calls are made.");
  }
  return db;
};

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

class HttpError extends Error {
  constructor(status, data) {
    super(`HTTP ${status}`);
    this.status = status;
    this.data = data;
  }
}
const fail = (status, data) => {
  throw new HttpError(status, data);
};
const ok = (data, status = 200) => ({ status, data });

const nowIso = () => new Date().toISOString();
const normTime = (t) => (/^\d{2}:\d{2}$/.test(String(t)) ? `${t}:00` : t);
const sum = (arr) => arr.reduce((a, b) => a + b, 0);
const contains = (fields, s) => fields.some((f) => String(f ?? "").toLowerCase().includes(s));

// ── pagination (DRF style) ───────────────────────────────────────────────────
const paginate = (list, q, path) => {
  const size = Math.max(1, parseInt(q.page_size, 10) || 25);
  const page = Math.max(1, parseInt(q.page, 10) || 1);
  const start = (page - 1) * size;
  return {
    count: list.length,
    next: start + size < list.length ? `${path}?page=${page + 1}` : null,
    previous: page > 1 ? `${path}?page=${page - 1}` : null,
    results: list.slice(start, start + size),
  };
};

// ── payment math (always derived from transactions) ──────────────────────────
const paymentStats = (p) => {
  const paid = sum(getDb().transactions.filter((t) => t.payment === p.id).map((t) => t.amount));
  const total = Number(p.total_amount) || 0;
  return {
    total,
    paid,
    balance: Math.max(0, total - paid),
    status: paid <= 0 ? "pending" : total > 0 && paid >= total ? "paid" : "partial",
  };
};

// ── serializers ──────────────────────────────────────────────────────────────
const clientView = (c) => ({ ...c });

const userView = (u) => ({
  id: u.id,
  full_name: u.full_name,
  name: u.full_name,
  email: u.email,
  phone: u.phone,
  role: u.role,
  picture: u.picture,
  is_active: true,
});

const eventView = (e) => {
  const { clients, payments } = getDb();
  const c = clients.find((x) => x.id === e.client) || {};
  const p = payments.find((x) => x.id === e.payId);
  const s = paymentStats(p);
  return {
    id: e.id,
    event_code: e.event_code,
    client: e.client,
    client_id: e.client,
    client_name: c.name,
    client_phone: c.phone,
    client_place: c.place,
    photography_type: e.photography_type,
    location: e.location,
    event_date: e.event_date,
    event_time: e.event_time,
    address: e.address,
    description: e.description,
    status: e.status,
    payId: p.id,
    total_amount: s.total,
    total_paid: s.paid,
    balance_amount: s.balance,
    pay_status: s.status,
    created_by_name: e.created_by_name,
    updated_by_name: e.updated_by_name,
    created_at: e.created_at,
    updated_at: e.updated_at,
  };
};

const paymentView = (p) => {
  const { events, clients } = getDb();
  const e = events.find((x) => x.id === p.event);
  const c = clients.find((x) => x.id === e.client) || {};
  const s = paymentStats(p);
  return {
    id: p.id,
    event: e.id,
    event_code: e.event_code,
    event_status: e.status,
    client_id: c.id,
    client_name: c.name,
    client_phone: c.phone,
    client_place: c.place,
    photography_type: e.photography_type,
    event_date: e.event_date,
    event_time: e.event_time,
    total_amount: s.total,
    total_paid: s.paid,
    balance_amount: s.balance,
    status: s.status,
  };
};

// ── validation helpers ───────────────────────────────────────────────────────
const validateClient = (body, selfId = null) => {
  const errs = {};
  const name = String(body.name ?? "").trim();
  const phone = String(body.phone ?? "").trim();
  const email = String(body.email ?? "").trim();
  if (!name) errs.name = ["Name is required."];
  if (!phone) errs.phone = ["Phone is required."];
  else if (!/^\d{10}$/.test(phone)) errs.phone = ["Enter a valid 10-digit phone number."];
  else if (getDb().clients.some((c) => c.phone === phone && c.id !== selfId))
    errs.phone = ["A client with this phone number already exists."];
  if (email && !/^\S+@\S+\.\S+$/.test(email)) errs.email = ["Enter a valid email address."];
  if (Object.keys(errs).length) fail(400, errs);
  return { name, phone, email, place: body.place ?? "", address: body.address ?? "", notes: body.notes ?? "" };
};

const conflictFor = (date, excludeId = null) => {
  const { events, clients } = getDb();
  const clash = events.filter(
    (e) => e.event_date === date && e.status !== "cancelled" && e.id !== excludeId
  );
  if (!clash.length) return null;
  const list = clash
    .map((e) => {
      const c = clients.find((x) => x.id === e.client);
      return `${e.photography_type} – ${c?.name} (${e.event_time.slice(0, 5)})`;
    })
    .join(", ");
  return `${clash.length} event${clash.length > 1 ? "s" : ""} already scheduled on ${date}: ${list}`;
};

const createClientRecord = (user, data) => {
  const d = getDb();
  const id = ++d.seq.client;
  const c = {
    id,
    client_code: `CL-${String(id).padStart(4, "0")}`,
    ...data,
    created_by_name: user.full_name,
    updated_by_name: user.full_name,
    created_at: nowIso(),
    updated_at: nowIso(),
  };
  d.clients.push(c);
  return c;
};

const createEventRecord = (user, clientId, f) => {
  const d = getDb();
  const id = ++d.seq.event;
  const payId = ++d.seq.payment;
  const ev = {
    id,
    event_code: `EV-${String(id).padStart(4, "0")}`,
    client: clientId,
    photography_type: String(f.photography_type).trim(),
    location: String(f.location ?? "").trim(),
    event_date: f.event_date,
    event_time: normTime(f.event_time),
    address: f.address ?? "",
    description: f.description ?? "",
    status: "scheduled",
    payId,
    created_by_name: user.full_name,
    updated_by_name: user.full_name,
    created_at: nowIso(),
    updated_at: nowIso(),
  };
  d.events.push(ev);
  d.payments.push({ id: payId, event: id, total_amount: 0 });
  return ev;
};

const removeEvent = (eventId) => {
  const d = getDb();
  const ev = d.events.find((e) => e.id === eventId);
  if (!ev) return;
  d.transactions = d.transactions.filter((t) => t.payment !== ev.payId);
  d.payments = d.payments.filter((p) => p.id !== ev.payId);
  d.events = d.events.filter((e) => e.id !== eventId);
};

// ─────────────────────────────────────────────────────────────────────────────
// Routes
// ─────────────────────────────────────────────────────────────────────────────
const routes = [];
const on = (method, pattern, handler, { auth = true } = {}) => {
  const keys = [];
  const re = new RegExp(
    "^" + pattern.replace(/:([a-z_]+)/gi, (_, k) => (keys.push(k), "([^/]+)")) + "$"
  );
  routes.push({ method, re, keys, handler, auth });
};

const findUserByEmail = (email) =>
  getDb().users.find((u) => u.email.toLowerCase() === String(email ?? "").trim().toLowerCase());

// ── AUTH ─────────────────────────────────────────────────────────────────────
on("POST", "/auth/check-email", ({ body }) => {
  if (!findUserByEmail(body.email)) fail(400, { error: "No account found for this email." });
  return ok({ login_type: "PASSWORD_LOGIN" });
}, { auth: false });

on("POST", "/auth/login-password", ({ body }) => {
  const u = findUserByEmail(body.email);
  if (!u || body.password !== DEMO_PASSWORD) fail(400, { error: "Invalid email or password." });
  const stamp = Date.now().toString(36);
  return ok({
    access: `mock-access-${u.id}-${stamp}`,
    refresh: `mock-refresh-${u.id}-${stamp}`,
    role: u.role,
    Id: u.id,
    name: u.full_name,
    Gmail: u.email,
  });
}, { auth: false });

const otpDisabled = () => fail(400, { error: "OTP and password reset are disabled in the demo." });
on("POST", "/auth/request-otp", otpDisabled, { auth: false });
on("POST", "/auth/verify-otp", otpDisabled, { auth: false });
on("POST", "/auth/set-password", otpDisabled, { auth: false });
on("POST", "/auth/token/refresh", () => fail(401, { detail: "Token invalid." }), { auth: false });
on("POST", "/auth/logout", () => ok({ message: "Logged out." }), { auth: false });

on("GET", "/auth/employees", () => ok(getDb().users.map(userView)));
on("GET", "/auth/employees/:id", ({ params }) => {
  const u = getDb().users.find((x) => x.id === Number(params.id));
  if (!u) fail(404, { error: "Employee not found." });
  return ok(userView(u));
});
on("GET", "/auth/sessions/:id", () => ok([]));

// ── ANALYTICS (AdminDashboard) ───────────────────────────────────────────────
// Everything is computed live from clients / events / payments, so the charts
// always agree with the other pages and follow "today" automatically.
const MONTH_NAMES = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
const EVENT_STATUSES = ["scheduled", "shouted", "processing", "completed", "cancelled"];
const PAY_STATUSES = ["paid", "partial", "pending"];
const cap = (w) => w.charAt(0).toUpperCase() + w.slice(1);
const ymOf = (dateStr) => ({ y: Number(dateStr.slice(0, 4)), m: Number(dateStr.slice(5, 7)) });

const analyticsRows = () => {
  const d = getDb();
  return {
    events: d.events.map((e) => {
      const s = paymentStats(d.payments.find((p) => p.id === e.payId));
      const cancelled = e.status === "cancelled";
      return { ...ymOf(e.event_date), status: e.status, paid: s.paid, balance: cancelled ? 0 : s.balance, payStatus: s.status, cancelled };
    }),
    clients: d.clients.map((c) => ymOf(toDateStr(new Date(c.created_at)))),
    txns: d.transactions.map((t) => ({ ...ymOf(t.payment_date), amount: t.amount })),
  };
};

const monthItem = (m, extra) => ({ month: m, month_name: MONTH_NAMES[m - 1], label: MONTH_NAMES[m - 1], ...extra });

on("GET", "/analytics/kpi", () => {
  const { events, clients } = analyticsRows();
  const now = new Date();
  const cy = now.getFullYear();
  const cm = now.getMonth() + 1;

  // last 12 months, oldest → newest (the last value is the current month)
  const months = Array.from({ length: 12 }, (_, i) => {
    const dt = new Date(cy, cm - 1 - (11 - i), 1);
    return { y: dt.getFullYear(), m: dt.getMonth() + 1 };
  });
  const at = (rows, mo) => rows.filter((r) => r.y === mo.y && r.m === mo.m);
  const thisMonth = { y: cy, m: cm };
  const evNow = at(events, thisMonth);

  return ok({
    total_clients: clients.length,
    total_events: events.length,
    total_revenue: sum(events.map((e) => e.paid)),
    pending_amount: sum(events.map((e) => e.balance)),

    clients_monthwise: months.map((mo) => at(clients, mo).length),
    events_monthwise: months.map((mo) => at(events, mo).length),
    revenue_monthwise: months.map((mo) => sum(at(events, mo).map((e) => e.paid))),
    pending_monthwise: months.map((mo) => sum(at(events, mo).map((e) => e.balance))),

    total_clients_current_month: at(clients, thisMonth).length,
    events_this_month_total: evNow.length,
    current_month_revenue: sum(evNow.map((e) => e.paid)),
    current_month_pending: sum(evNow.map((e) => e.balance)),
    events_status: Object.fromEntries(
      EVENT_STATUSES.map((st) => [st, evNow.filter((e) => e.status === st).length])
    ),
  });
});

on("GET", "/analytics/:kind", ({ params, query: q }) => {
  const { events, clients, txns } = analyticsRows();
  const curYear = new Date().getFullYear();
  const curMonth = new Date().getMonth() + 1;

  // years that have any data (+ the current year)
  const allYears = [...events, ...clients, ...txns].map((r) => r.y).concat(curYear);
  const minYear = Math.min(...allYears);
  const maxYear = Math.max(...allYears);
  const available_years = Array.from({ length: maxYear - minYear + 1 }, (_, i) => minYear + i);

  const year = Number(q.year) || curYear;
  const month = Number(q.month) || 0; // 0 = whole year

  // latest month that has data in the selected year (ceiling for the month picker)
  const monthsWithData = [...events, ...clients, ...txns].filter((r) => r.y === year).map((r) => r.m);
  let max_month = monthsWithData.length ? Math.max(...monthsWithData) : 12;
  if (year === curYear) max_month = Math.max(max_month, curMonth);

  const inYear = (r) => r.y === year;
  const inPeriod = (r) => r.y === year && (!month || r.m === month);
  const months12 = Array.from({ length: 12 }, (_, i) => i + 1);
  const base = { year, month, available_years, min_year: minYear, max_year: maxYear, max_month };

  switch (params.kind) {
    case "clients":
      return ok({
        ...base,
        bar_data: months12.map((m) => monthItem(m, { clients: clients.filter((r) => inYear(r) && r.m === m).length })),
        // running total of all clients up to the end of each month
        line_data: months12.map((m) =>
          monthItem(m, {
            clients: clients.filter((r) => inYear(r) && r.m === m).length,
            total: clients.filter((r) => r.y < year || (r.y === year && r.m <= m)).length,
          })
        ),
      });

    case "events":
      return ok({
        ...base,
        bar_data: months12.map((m) => monthItem(m, { events: events.filter((r) => inYear(r) && r.m === m).length })),
        pie_data: EVENT_STATUSES.map((st) => ({
          status: st,
          name: cap(st),
          value: events.filter((r) => inPeriod(r) && r.status === st).length,
        })).filter((x) => x.value > 0),
      });

    case "revenue": {
      const inP = events.filter(inPeriod);
      return ok({
        ...base,
        line_data: months12.map((m) => {
          const ev = events.filter((r) => inYear(r) && r.m === m);
          return monthItem(m, { revenue: sum(ev.map((e) => e.paid)), balance: sum(ev.map((e) => e.balance)) });
        }),
        donut_data: [
          { name: "Paid", value: sum(inP.map((e) => e.paid)) },
          { name: "Pending", value: sum(inP.map((e) => e.balance)) },
        ],
      });
    }

    case "payments":
      return ok({
        ...base,
        pie_data: PAY_STATUSES.map((st) => ({
          status: st,
          name: cap(st),
          value: events.filter((r) => inPeriod(r) && !r.cancelled && r.payStatus === st).length,
        })).filter((x) => x.value > 0),
        trend_data: months12.map((m) =>
          monthItem(m, { collected: sum(txns.filter((t) => inYear(t) && t.m === m).map((t) => t.amount)) })
        ),
      });

    default:
      return fail(404, { error: "Unknown analytics endpoint." });
  }
});

// ── CLIENTS ──────────────────────────────────────────────────────────────────
on("GET", "/clients", ({ query: q }) => {
  let list = getDb().clients.slice();
  if (q.search) {
    const s = String(q.search).toLowerCase();
    list = list.filter((c) => contains([c.name, c.phone, c.email, c.place, c.client_code], s));
  }
  if (q.created_at_from) list = list.filter((c) => toDateStr(new Date(c.created_at)) >= q.created_at_from);
  if (q.created_at_to) list = list.filter((c) => toDateStr(new Date(c.created_at)) <= q.created_at_to);
  list.sort((a, b) => b.created_at.localeCompare(a.created_at) || b.id - a.id);
  const page = paginate(list, q, "/clients/");
  return ok({ ...page, results: page.results.map(clientView) });
});

on("POST", "/clients", ({ body, user }) => {
  const c = createClientRecord(user, validateClient(body));
  return ok(clientView(c), 201);
});

on("GET", "/clients/:id", ({ params }) => {
  const c = getDb().clients.find((x) => x.id === Number(params.id));
  if (!c) fail(404, { error: "Client not found." });
  return ok(clientView(c));
});

const updateClient = ({ params, body, user }) => {
  const c = getDb().clients.find((x) => x.id === Number(params.id));
  if (!c) fail(404, { error: "Client not found." });
  Object.assign(c, validateClient({ ...c, ...body }, c.id), {
    updated_by_name: user.full_name,
    updated_at: nowIso(),
  });
  return ok(clientView(c));
};
on("PUT", "/clients/:id", updateClient);
on("PATCH", "/clients/:id", updateClient);

on("DELETE", "/clients/:id", ({ params }) => {
  const d = getDb();
  const c = d.clients.find((x) => x.id === Number(params.id));
  if (!c) fail(404, { error: "Client not found." });
  d.events.filter((e) => e.client === c.id).forEach((e) => removeEvent(e.id));
  d.clients = d.clients.filter((x) => x.id !== c.id);
  return ok({ message: `${c.name} deleted successfully` });
});

// ── EVENTS (specific routes first, /:id last) ────────────────────────────────
on("GET", "/events/upcoming", () => {
  const today = toDateStr(new Date());
  const list = getDb()
    .events.filter((e) => e.event_date >= today && !["cancelled", "completed"].includes(e.status))
    .sort((a, b) => `${a.event_date} ${a.event_time}`.localeCompare(`${b.event_date} ${b.event_time}`))
    .slice(0, 10)
    .map(eventView);
  return ok({ count: list.length, next: null, previous: null, results: list });
});

on("GET", "/events/calendar-summary", ({ query: q }) => {
  const map = {};
  getDb().events.forEach((e) => {
    if (q.event_date_from && e.event_date < q.event_date_from) return;
    if (q.event_date_to && e.event_date > q.event_date_to) return;
    map[e.event_date] = (map[e.event_date] || 0) + 1;
  });
  return ok(
    Object.entries(map)
      .map(([event_date, count]) => ({ event_date, count }))
      .sort((a, b) => a.event_date.localeCompare(b.event_date))
  );
});

on("GET", "/events", ({ query: q }) => {
  let list = getDb().events.slice();
  if (q.client) list = list.filter((e) => e.client === Number(q.client));
  if (q.status) list = list.filter((e) => e.status === q.status);
  if (q.event_date_from) list = list.filter((e) => e.event_date >= q.event_date_from);
  if (q.event_date_to) list = list.filter((e) => e.event_date <= q.event_date_to);
  if (q.search) {
    const s = String(q.search).toLowerCase();
    list = list.filter((e) => {
      const v = eventView(e);
      return contains([v.event_code, v.client_name, v.client_phone, v.photography_type, v.location], s);
    });
  }
  const key = (e) => `${e.event_date} ${e.event_time}`;
  const singleDay = q.event_date_from && q.event_date_from === q.event_date_to;
  list.sort((a, b) => (singleDay ? key(a).localeCompare(key(b)) : key(b).localeCompare(key(a))));
  const page = paginate(list, q, "/events/");
  return ok({ ...page, results: page.results.map(eventView) });
});

on("POST", "/events", ({ body, user }) => {
  const d = getDb();
  const errs = {};
  const client = d.clients.find((c) => c.id === Number(body.client));
  if (!client) errs.client = ["Select a valid client."];
  ["photography_type", "location", "event_date", "event_time"].forEach((f) => {
    if (!String(body[f] ?? "").trim()) errs[f] = ["This field is required."];
  });
  if (Object.keys(errs).length) fail(400, errs);

  if (!body.force_save) {
    const msg = conflictFor(body.event_date);
    if (msg) fail(400, { conflict: [msg] });
  }

  const ev = createEventRecord(user, client.id, body);
  return ok(eventView(ev), 201);
});

on("GET", "/events/:id", ({ params }) => {
  const e = getDb().events.find((x) => x.id === Number(params.id));
  if (!e) fail(404, { error: "Event not found." });
  return ok(eventView(e));
});

on("PATCH", "/events/:id", ({ params, body, user }) => {
  const e = getDb().events.find((x) => x.id === Number(params.id));
  if (!e) fail(404, { error: "Event not found." });

  if (body.event_date && body.event_date !== e.event_date && !body.force_save) {
    const msg = conflictFor(body.event_date, e.id);
    if (msg) fail(400, { conflict: [msg] });
  }
  ["photography_type", "location", "event_date", "address", "description", "status"].forEach((f) => {
    if (body[f] !== undefined && body[f] !== null) e[f] = body[f];
  });
  if (body.event_time) e.event_time = normTime(body.event_time);
  e.updated_by_name = user.full_name;
  e.updated_at = nowIso();
  return ok(eventView(e));
});

on("DELETE", "/events/:id", ({ params }) => {
  removeEvent(Number(params.id));
  return ok("", 204);
});

// ── PAYMENTS ─────────────────────────────────────────────────────────────────
on("GET", "/payments", ({ query: q }) => {
  let list = getDb().payments.map(paymentView);
  if (q.status) list = list.filter((p) => p.status === q.status);
  if (q.event_date__gte) list = list.filter((p) => p.event_date >= q.event_date__gte);
  if (q.event_date__lte) list = list.filter((p) => p.event_date <= q.event_date__lte);
  if (q.search) {
    const s = String(q.search).toLowerCase();
    list = list.filter((p) =>
      contains([p.event_code, p.client_name, p.client_phone, p.photography_type], s)
    );
  }
  list.sort((a, b) => b.event_date.localeCompare(a.event_date) || b.id - a.id);
  return ok(paginate(list, q, "/payments/"));
});

on("PATCH", "/payments/:id", ({ params, body }) => {
  const p = getDb().payments.find((x) => x.id === Number(params.id));
  if (!p) fail(404, { error: "Payment not found." });
  const total = Number(body.total_amount);
  const { paid } = paymentStats(p);
  if (Number.isNaN(total) || total < 0) fail(400, { total_amount: ["Enter a valid amount."] });
  if (total === 0 && paid > 0)
    fail(400, { total_amount: ["Delete all transactions before resetting the total to 0."] });
  if (total > 0 && total < paid)
    fail(400, { total_amount: [`Total can't be less than the ₹${paid} already paid.`] });
  p.total_amount = total;
  return ok(paymentView(p));
});

// ── TRANSACTIONS ─────────────────────────────────────────────────────────────
on("GET", "/transactions", ({ query: q }) => {
  let list = getDb().transactions.slice();
  if (q.payment) list = list.filter((t) => t.payment === Number(q.payment));
  list.sort((a, b) => b.payment_date.localeCompare(a.payment_date) || b.id - a.id);
  return ok({ count: list.length, next: null, previous: null, results: list });
});

on("POST", "/transactions", ({ body }) => {
  const d = getDb();
  const p = d.payments.find((x) => x.id === Number(body.payment));
  if (!p) fail(400, { payment: ["Invalid payment."] });
  const amount = Number(body.amount);
  const ev = d.events.find((e) => e.id === p.event);
  const s = paymentStats(p);
  if (!(amount > 0)) fail(400, { amount: ["Enter an amount greater than 0."] });
  if (ev.status === "cancelled") fail(400, { amount: ["Can't add a payment to a cancelled event."] });
  if (s.total <= 0) fail(400, { amount: ["Set the total amount first."] });
  if (amount > s.balance) fail(400, { amount: [`Amount exceeds the balance of ₹${s.balance}.`] });
  const t = {
    id: ++d.seq.transaction,
    payment: p.id,
    amount,
    payment_date: body.payment_date || toDateStr(new Date()),
    payment_method: body.payment_method || "cash",
  };
  d.transactions.push(t);
  return ok(t, 201);
});

on("DELETE", "/transactions/:id", ({ params }) => {
  const d = getDb();
  const id = Number(params.id);
  if (!d.transactions.some((t) => t.id === id)) fail(404, { error: "Transaction not found." });
  d.transactions = d.transactions.filter((t) => t.id !== id);
  return ok("", 204);
});

// ── BOOKINGS (requests from the public website) ─────────────────────────────
const bookingView = (b) => {
  const c = getDb().clients.find((x) => x.phone === b.phone);
  return {
    id: b.id,
    name: b.name,
    phone: b.phone,
    event_type: b.event_type,
    event_date: b.event_date,
    location: b.location,
    status: b.status,
    created_at: b.created_at,
    is_returning: !!c,
    existing_client: c
      ? {
          id: c.id,
          client_code: c.client_code,
          name: c.name,
          phone: c.phone,
          email: c.email || "",
          place: c.place || "",
          address: c.address || "",
        }
      : null,
  };
};

on("GET", "/bookings", ({ query: q }) => {
  let list = getDb().bookings.slice();
  if (q.status) list = list.filter((b) => b.status === q.status);
  list.sort((a, b) => b.created_at.localeCompare(a.created_at));
  return ok(list.map(bookingView)); // plain array, like the real API
});

on("POST", "/bookings/:id/accept", ({ params, body, user }) => {
  const d = getDb();
  const b = d.bookings.find((x) => x.id === Number(params.id) && x.status === "pending");
  if (!b) fail(404, { error: "Booking not found or already processed." });

  const errs = {};
  const name = String(body.name ?? "").trim();
  const phone = String(body.phone ?? "").trim();
  if (!name) errs.name = ["Name is required."];
  if (!/^\d{10}$/.test(phone)) errs.phone = ["Enter a valid 10-digit phone number."];
  ["event_type", "event_date", "event_time"].forEach((f) => {
    if (!String(body[f] ?? "").trim()) errs[f] = ["This field is required."];
  });
  const email = String(body.email ?? "").trim();
  if (email && !/^\S+@\S+\.\S+$/.test(email)) errs.email = ["Enter a valid email address."];
  if (Object.keys(errs).length) fail(400, { ...errs, error: "Please fix the highlighted fields." });

  if (!body.force_save) {
    const msg = conflictFor(body.event_date);
    if (msg) fail(409, { conflict: msg });
  }

  // returning client (matched by phone) → update it, otherwise create a new one
  let client = d.clients.find((c) => c.phone === phone);
  const fields = {
    name,
    email,
    place: body.place ?? "",
    address: body.address ?? "",
    notes: body.notes || client?.notes || "",
  };
  if (client) {
    Object.assign(client, fields, { updated_by_name: user.full_name, updated_at: nowIso() });
  } else {
    client = createClientRecord(user, { ...fields, phone });
  }

  const ev = createEventRecord(user, client.id, {
    photography_type: body.event_type,
    location: body.location,
    event_date: body.event_date,
    event_time: body.event_time,
    description: body.description,
    address: body.location,
  });
  b.status = "accepted";
  return ok({ message: "Booking accepted.", client: client.id, event: ev.id }, 201);
});

on("POST", "/bookings/:id/decline", ({ params }) => {
  const b = getDb().bookings.find((x) => x.id === Number(params.id) && x.status === "pending");
  if (!b) fail(404, { error: "Booking not found or already processed." });
  b.status = "declined";
  return ok({ message: "Booking declined." });
});

// ── GALLERY ──────────────────────────────────────────────────────────────────
const IMAGE_MAX_MB = 10;
const VIDEO_MAX_MB = 200;

on("GET", "/gallery", () => {
  const list = getDb().gallery.slice().sort((a, b) => b.created_at.localeCompare(a.created_at));
  return ok(list); // plain array, like the real API
});

on("POST", "/gallery/upload", ({ body, user }) => {
  const f = body.file;
  if (!f || typeof f === "string" || typeof f.size !== "number")
    fail(400, { file: ["No file was submitted."] });

  const type = f.type || "";
  const category = type.startsWith("video/") ? "video" : type.startsWith("image/") ? "image" : null;
  if (!category) fail(400, { file: ["Only image or video files are allowed."] });
  const maxMB = category === "image" ? IMAGE_MAX_MB : VIDEO_MAX_MB;
  if (f.size > maxMB * 1024 * 1024) fail(400, { file: [`File must be ≤ ${maxMB} MB.`] });

  const d = getDb();
  const item = {
    id: ++d.seq.gallery,
    title: String(body.title ?? "").trim(),
    category,
    original_filename: f.name || "upload",
    file_size: f.size,
    // blob: URL — the upload shows up instantly and lives until the page reloads
    signed_url: URL.createObjectURL(f),
    created_at: nowIso(),
    uploaded_by_name: user.full_name,
  };
  d.gallery.push(item);
  return ok(item, 201);
});

on("DELETE", "/gallery/:id", ({ params }) => {
  const d = getDb();
  const item = d.gallery.find((g) => g.id === Number(params.id));
  if (!item) fail(404, { error: "Item not found." });
  if (item.signed_url.startsWith("blob:")) URL.revokeObjectURL(item.signed_url);
  d.gallery = d.gallery.filter((g) => g.id !== item.id);
  return ok("", 204);
});

// ─────────────────────────────────────────────────────────────────────────────
// Request plumbing
// ─────────────────────────────────────────────────────────────────────────────
const parseUrl = (config) => {
  let url = config.url || "";
  if (config.baseURL && url.startsWith(config.baseURL)) url = url.slice(config.baseURL.length);
  url = url.replace(/^https?:\/\/[^/]+/i, "");
  const [rawPath, rawQs = ""] = url.split("?");
  return {
    path: "/" + rawPath.replace(/^\/+|\/+$/g, ""),
    query: { ...Object.fromEntries(new URLSearchParams(rawQs)), ...(config.params || {}) },
  };
};

const parseBody = (data) => {
  if (!data) return {};
  if (typeof data === "string") {
    try {
      return JSON.parse(data);
    } catch {
      return {};
    }
  }
  if (typeof FormData !== "undefined" && data instanceof FormData) return Object.fromEntries(data.entries());
  return typeof data === "object" ? data : {};
};

const userFromConfig = (config) => {
  const h = config.headers;
  const raw = (typeof h?.get === "function" ? h.get("Authorization") : h?.Authorization) || "";
  const m = /^Bearer mock-access-(\d+)-/.exec(raw);
  return m ? getDb().users.find((u) => u.id === Number(m[1])) : null;
};

const dispatch = (method, path, query, body, config) => {
  for (const r of routes) {
    if (r.method !== method) continue;
    const m = r.re.exec(path);
    if (!m) continue;
    const params = Object.fromEntries(r.keys.map((k, i) => [k, decodeURIComponent(m[i + 1])]));
    const user = userFromConfig(config);
    if (r.auth && !user) fail(401, { detail: "Authentication credentials were not provided." });
    return r.handler({ params, query, body, user });
  }
  // Not implemented by the demo (Employees write actions, Integrations, …)
  console.warn(`[demo] no mock handler for ${method} ${path}`);
  if (method === "GET") return ok({ count: 0, next: null, previous: null, results: [] });
  return fail(403, { error: "This action is disabled in the demo." });
};

/** axios adapter — plug into axios.create({ adapter: mockAdapter }) */
export async function mockAdapter(config) {
  await sleep(LATENCY[0] + Math.random() * (LATENCY[1] - LATENCY[0]));

  const method = (config.method || "get").toUpperCase();
  const { path, query } = parseUrl(config);
  const body = parseBody(config.data);

  let result;
  try {
    result = dispatch(method, path, query, body, config);
  } catch (e) {
    if (e instanceof HttpError) result = { status: e.status, data: e.data };
    else {
      console.error("[demo] mock handler crashed:", e);
      result = { status: 500, data: { error: "Demo server error." } };
    }
  }

  const response = {
    data: result.data,
    status: result.status,
    statusText: String(result.status),
    headers: {},
    config,
    request: {},
  };

  if (result.status >= 400) {
    throw new AxiosError(
      `Request failed with status code ${result.status}`,
      result.status >= 500 ? AxiosError.ERR_BAD_RESPONSE : AxiosError.ERR_BAD_REQUEST,
      config,
      null,
      response
    );
  }
  return response;
}

// re-export for convenience
export { avatarFor };