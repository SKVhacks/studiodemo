// src/api/mock/mockData.js
// ─────────────────────────────────────────────────────────────────────────────
// Demo seed data. EVERY date is computed from "today" when the app loads, so the
// demo always looks alive: upcoming events in the next ~10 weeks, past events
// going back ~4½ months, clients created recently, payments spread in between.
// ─────────────────────────────────────────────────────────────────────────────

export const DEMO_PASSWORD = "Password@123";

const pad = (n) => String(n).padStart(2, "0");
const pad4 = (n) => String(n).padStart(4, "0");

export const toDateStr = (d) =>
  `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;

const midnight = () => {
  const d = new Date();
  d.setHours(0, 0, 0, 0);
  return d;
};

/** today + n days (local midnight). n can be negative. */
export const addDays = (n) => {
  const d = midnight();
  d.setDate(d.getDate() + n);
  return d;
};

/** "YYYY-MM-DD" for today + n days */
export const dateStr = (n) => toDateStr(addDays(n));

/** ISO timestamp for today + n days at hh:mm — never in the future */
const stamp = (n, h = 10, m = 0) => {
  const d = addDays(n);
  d.setHours(h, m, 0, 0);
  return new Date(Math.min(d.getTime(), Date.now() - 60000)).toISOString();
};

/** Initials avatar as a data-URI (no network, never null) */
export const avatarFor = (name) => {
  const initials = name
    .split(" ")
    .map((w) => w[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();
  const svg =
    `<svg xmlns="http://www.w3.org/2000/svg" width="128" height="128">` +
    `<rect width="128" height="128" fill="#ffb900"/>` +
    `<text x="50%" y="54%" font-family="Arial,sans-serif" font-size="52" font-weight="700" ` +
    `fill="#ffffff" text-anchor="middle" dominant-baseline="middle">${initials}</text></svg>`;
  return `data:image/svg+xml;utf8,${encodeURIComponent(svg)}`;
};

// ── Demo logins ──────────────────────────────────────────────────────────────
const USERS = [
  { id: 1, email: "admin@gadgetvishwa.in", password: DEMO_PASSWORD, role: "ADMIN", full_name: "Admin Demo", phone: "9876500001" ,profile_picture:"https://media.gadgetvishwa.in/images/profile.png"},
  { id: 2, email: "staff@gadgetvishwa.in", password: DEMO_PASSWORD, role: "STAFF", full_name: "Staff Demo", phone: "9876500002" ,profile_picture:"https://pub-dc9a9c6ac2a64ba48bce426ced0ac56a.r2.dev/idols/Jennie/profile.png?v=1787760451545"},
];

// ── Clients ──────────────────────────────────────────────────────────────────
// `ago` = created N days ago. Only set for clients whose events are all in the
// future (so "created" never comes after their events). Others are derived
// from their first event automatically.
const CLIENT_SEEDS = [
  { name: "Karthik Raja",       place: "Chennai",     email: "karthik.raja@example.com",   notes: "Prefers WhatsApp for all updates." },
  { name: "Priya Dharshini",    place: "Coimbatore",  email: "priya.d@example.com",        notes: "Referred by Vignesh." },
  { name: "Arun Kumar",         place: "Madurai",     email: "arun.kumar@example.com",     notes: "" },
  { name: "Divya Bharathi",     place: "Salem",       email: "divya.b@example.com",        notes: "Call after 6 PM." },
  { name: "Vignesh Subramani",  place: "Trichy",      email: "vignesh.s@example.com",      notes: "Repeat client. Loves candid shots." },
  { name: "Meena Lakshmi",      place: "Tirunelveli", email: "meena.l@example.com",        notes: "Family of 40+ at events." },
  { name: "Babu",        place: "Erode",       email: "",                           notes: "Repeat client." },
  { name: "Priya",      place: "Thanjavur",   email: "priya.devi@example.com",  notes: "" },
  { name: "Ramesh Chandran",    place: "Vellore",     email: "ramesh.c@example.com",       notes: "Wants a same-day teaser reel." },
  { name: "Darshan Frank",   place: "Mylapore",  email: "darshan.g@example.com",      notes: "Traditional attire shoots only." },
  { name: "Harish",   place: "Pollachi",    email: "harish.n@example.com",       notes: "" },
  { name: "Ajay Kumar",      place: "Tiruvannamalai",    email: "ajay.d@example.com",                           notes: "Album: 40 sheets + 2 wall frames." },
  { name: "Buvan", place: "Kanniyakumari",       email: "buvan.ca@example.com",      notes: "New enquiry via Instagram.",     ago: 4 },
  { name: "Jennie",     place: "Korea",  email: "jennie.m@example.com",       notes: "Advance to be paid next week.",  ago: 11 },
  { name: "Balamurugan",      place: "Paramakudi",    email: "balamurugan.m@example.com",       notes: "",                               ago: 17 },
  { name: "Dharshan",       place: "Salam",    email: "dharshan.nk@example.com",      notes: "Repeat client." },
  { name: "Dharshini",       place: "Tanjore",       email: "dharshini.p@example.com",        notes: "Drone coverage requested.",      ago: 24 },
  { name: "Aishwarya",   place: "Tirunelveli",   email: "aishu.m@example.com",    notes: "Walk-in today.",                 ago: 0 },
];

const STREETS = ["Gandhi Street", "Nehru Road", "Anna Salai", "Bharathi Nagar 2nd Cross", "Temple Street", "KK Nagar Main Road"];

// ── Events ───────────────────────────────────────────────────────────────────
// [dayOffsetFromToday, clientSeedIndex, type, venue, "HH:MM", total, paidFraction, opts]
//   dayOffset  >0 future · 0 today · <0 past
//   paidFraction 0..1 of `total`. total 0 = amount not set yet.
//   opts.cancel = true → cancelled
const EVENT_SEEDS = [
  // ── upcoming ──
  [0,   1, "Pre-Wedding",          "Marudhamalai Hills, Coimbatore",   "16:00", 26000, 0.3],
  [2,   0, "Engagement",           "Sri Murugan Mahal, Chennai",       "10:30", 35000, 0.3],
  [4,   4, "Birthday",             "Hotel Aroma, Trichy",              "18:30", 14000, 0.5],
  [6,   2, "Baby Naming Ceremony", "Residence, Madurai",               "10:00", 9000,  0.5],
  [8,  16, "Birthday",             "Karur",                            "17:00", 0,     0,   { cancel: true }],
  [9,   7, "Product Launch",  "Raja Mahal, Thanjavur",            "09:00", 24000, 0.4],
  [12,  5, "Wedding",              "Vasantha Mahal, Tirunelveli",      "07:30", 95000, 0.3],
  [12,  9, "House Warming",        "Kumbakonam",                       "10:00", 9000,  0],
  [15,  3, "Maternity Shoot",      "Yercaud Gardens, Salem",           "08:00", 11000, 0.5],
  [18, 10, "Corporate Event",      "Pollachi",                         "14:00", 30000, 0],
  [21, 12, "Engagement",           "Kalyana Mandapam, Hosur",          "11:00", 38000, 0.3],
  [25,  8, "Wedding",              "Sri Lakshmi Mahal, Vellore",       "06:30", 110000, 0.3],
  [25,  8, "Reception",            "Hotel Grand Regency, Vellore",     "19:00", 45000, 0.3],
  [29, 13, "Wedding",              "Mannargudi",                       "07:30", 80000, 0.3],
  [34,  6, "Anniversary",          "Erode",                            "19:30", 16000, 0.5],
  [40, 14, "Wedding",              "Tiruppur",                         "07:00", 85000, 0.3],
  [47, 15, "Birthday",             "Dindigul",                         "17:30", 12000, 0],
  [55, 16, "Pre-Wedding",          "Karur Cauvery Bank",               "06:15", 26000, 0],
  [63, 17, "Birthday Shoot",           "Chennai",                        "10:00", 0,     0],
  [70, 11, "Baby Shoot",           "Namakkal",                         "10:00", 0,     0],

  // ── past ──
  [-1,   6, "Birthday",            "Erode",                            "18:00", 13000, 0.5],
  [-3,   9, "Baby Shoot",          "Kumbakonam",                       "10:00", 8500,  1],
  [-6,   3, "Wedding",             "Sri Vari Mahal, Salem",            "07:00", 90000, 0.7],
  [-9,   5, "Engagement",          "Tirunelveli",                      "10:00", 30000, 0.6],
  [-13,  1, "Engagement",          "Coimbatore",                       "11:00", 32000, 0.7],
  [-18,  4, "Wedding",             "Kalyana Mahal, Trichy",            "07:30", 100000, 1],
  [-18,  4, "Reception",           "Hotel Sangam, Trichy",             "19:00", 40000, 1],
  [-20,  9, "Wedding",             "Kumbakonam",                       "07:00", 70000, 0.15, { cancel: true }],
  [-23,  0, "Birthday",            "Chennai",                          "17:00", 15000, 1],
  [-28,  7, "Maternity Shoot",     "Thanjavur",                        "09:00", 10000, 1],
  [-33,  2, "House Warming",       "Madurai",                          "08:30", 9000,  0.6],
  [-38, 10, "Engagement",          "Pollachi",                         "10:30", 34000, 1],
  [-44,  5, "Pre-Wedding",         "Courtallam Falls",                 "06:00", 24000, 1],
  [-51, 15, "Wedding",             "Dindigul",                         "06:30", 88000, 1],
  [-58,  9, "Birthday",            "Kumbakonam",                       "18:00", 11000, 1],
  [-66,  8, "Engagement",          "Vellore",                          "11:00", 33000, 1],
  [-75, 11, "Wedding",             "Namakkal",                         "07:00", 78000, 0.9],
  [-84,  2, "Anniversary",         "Madurai",                          "19:00", 15000, 1],
  [-95, 10, "Baby Shoot",          "Pollachi",                         "10:00", 9000,  1],
  [-107, 7, "Birthday",            "Thanjavur",                        "18:00", 12000, 1],
  [-120, 3, "Engagement",          "Salem",                            "10:00", 35000, 1],
  [-135, 6, "Wedding",             "Erode",                            "07:30", 92000, 1],
];

const NOTES = [
  "Candid + traditional photography.",
  "Drone coverage required.",
  "Album: 40 sheets + 2 frames.",
  "Outdoor location — carry reflectors.",
  "Client wants a same-day teaser reel.",
  "",
];

const statusFor = (off, cancel) => {
  if (cancel) return "cancelled";
  if (off >= 0) return "scheduled";
  if (off >= -3) return "shouted";
  if (off >= -14) return "processing";
  return "completed";
};

const roundTo500 = (v) => Math.round(v / 500) * 500;

/** Split a paid amount into 1–3 installments (advance → mid → final) */
const splitPaid = (paid, total) => {
  if (paid <= 0) return [];
  const adv = Math.min(paid, roundTo500(total * 0.3));
  const parts = [adv];
  let rest = paid - adv;
  if (rest > 0) {
    if (rest > total * 0.4) {
      const half = roundTo500(rest / 2);
      parts.push(half);
      rest -= half;
    }
    if (rest > 0) parts.push(rest);
  }
  return parts;
};


// ── Website booking requests (pending) ──────────────────────────────────────
// `clientIdx` → a RETURNING client (phone matches an existing client, so the
//   "Returning Client / System Record" panel shows). Otherwise a NEW client.
// off = event date offset in days from today · ago = request received N days ago
const BOOKING_SEEDS = [
  { name: "Arvind Krishnan", phone: "9876599101", type: "Wedding",             location: "Sri Devi Mahal, Chennai",  off: 38, ago: 0 },
  { name: "Harini Sekar",    phone: "9876599102", type: "Baby Shoot",          location: "Coimbatore",               off: 16, ago: 1 },
  { name: "Vignesh S",       clientIdx: 4,         type: "Birthday",           location: "Hotel Aroma, Trichy",      off: 52, ago: 1 },
  { name: "Gopinath Raman",  phone: "9876599103", type: "Engagement",          location: "Madurai",                  off: 27, ago: 2 },
  { name: "Darshan",       clientIdx: 9,         type: "Anniversary",        location: "Kumbakonam",               off: 44, ago: 3 },
  { name: "Thenmozhi Arasu", phone: "9876599104", type: "Half Saree Function", location: "Thanjavur",                off: 61, ago: 4 },
  { name: "Priya D",         clientIdx: 1,         type: "Maternity Shoot",    location: "Coimbatore",               off: 73, ago: 5 },
];

// ── Gallery (Unsplash — free to use under the Unsplash License) ─────────────
// `id` is the image's CDN id (images.unsplash.com/photo-<id>). `by` = photographer.
const UNSPLASH = (id) => `https://images.unsplash.com/photo-${id}?auto=format&fit=crop&w=1000&q=75`;
const GALLERY_SEEDS = [
  { id: "1711968558560-62e6cff25ff6", title: "Wedding – Beach Walk",       file: "wedding-beach-walk.jpg",       by: "ISKRA Photography" },
  { id: "1670577628542-e5ab31abe30b", title: "Baby Shoot – Smile",   file: "baby-first-smile.jpg",         by: "Wesley Tingey" },
  { id: "1693074446713-aad8855c20d7", title: "Bridal Bouquet Portrait",    file: "bridal-bouquet-portrait.jpg",  by: "Brayden Prato" },
  { id: "1640439505734-3851b53e5035", title: "Bride & Groom – Window Light", file: "bride-groom-window.jpg",     by: "Q A Trần" },
  { id: "1678286454871-e040a233cc3d", title: "Ring Details",               file: "ring-details.jpg",             by: "Oskar Hagberg" },
  { id: "1721635513009-4bd5d277c437", title: "Wedding – Country Road",     file: "wedding-country-road.jpg",     by: "Jaakko Perälä" },
  { id: "1574706472790-f24ebe0510ba", title: "Newborn – Mother & Baby",    file: "newborn-mother-baby.jpg",      by: "Jonathan Borba" },
  { id: "1565661834013-d196ca46e14e", title: "Reception – Wedding Cake",   file: "reception-wedding-cake.jpg",   by: "Melissa Walker Horn" },
  { id: "1599942307891-2d061dc6d9f0", title: "Black & White Couple",       file: "bw-couple-bouquet.jpg",        by: "Natalia Sobolivska" },
  { id: "1562861198-faab3eca2aca",    title: "Pre-Wedding – Shoreline",    file: "prewedding-shoreline.jpg",     by: "Jonathan Borba" },
  { id: "1715285977649-4a83c0820399?", title: "Romantic Portrait – Garden",   file: "bridal-portrait-garden.jpg",   by: "Keefikus" },
  { id: "1665805042483-e4d69d4656b3", title: "Couple Portrait",            file: "couple-portrait.jpg",          by: "Ksenia Gord" },
  { id: "1539572442282-b62812d2422f", title: "Pre-Wedding – Desert Dunes", file: "prewedding-dunes.jpg",         by: "ian dooley" },
  { id: "1550784718-990c6de52adf",    title: "Bride & Groom",              file: "bride-and-groom.jpg",          by: "Ulyana Tim" },
  { id: "1563808601095-5b2e2e91a269", title: "Pre-Wedding – Lakeside",     file: "prewedding-lakeside.jpg",      by: "Jonathan Borba" },
  { id: "1523975545000-30bd4e5833d5", title: "Wedding Bouquet",            file: "wedding-bouquet.jpg",          by: "The HK Photo Company" },
  { id: "1617376431454-8195cf1fd668", title: "Sunset Beach",             file: "bridal-details.jpg",           by: "Oksana Zub" },
  { id: "1550715262-ece4c8bc4ce2",    title: "Engagement Moment",          file: "engagement-moment.jpg",        by: "Jonathan Borba" },
  { id: "1551876382-298ca1c96d5e",    title: "Floral Portrait",            file: "floral-portrait.jpg",          by: "Juan Gomez" },
  { id: "1492176861288-6b481cfad893", title: "Wedding Rings",              file: "wedding-rings.jpg",            by: "Petr Ovralov" },
  { id: "1666811089318-906d0ab8565c", title: "Field Portrait",             file: "field-portrait.jpg",           by: "Noelle Rebekah" },
];

// ─────────────────────────────────────────────────────────────────────────────
export function createDb() {
  const users = USERS.map((u) => ({ ...u, picture: u.profile_picture || avatarFor(u.full_name) }));
  const byIdx = (i) => (i % 3 === 0 ? "Staff Demo" : "Admin Demo");

  // ── first event date per client (to derive sensible "created" dates) ──
  const firstEv = {};
  EVENT_SEEDS.forEach(([off, ci]) => {
    firstEv[ci] = Math.min(firstEv[ci] ?? Infinity, off);
  });

  const clientCreatedOff = CLIENT_SEEDS.map((c, i) =>
    c.ago != null ? -c.ago : firstEv[i] - (12 + ((i * 5) % 20))
  );

  // ids ascend with creation date
  const order = CLIENT_SEEDS.map((_, i) => i).sort(
    (a, b) => clientCreatedOff[a] - clientCreatedOff[b] || a - b
  );
  const clientId = {};
  order.forEach((seedIdx, pos) => (clientId[seedIdx] = pos + 1));

  const clients = order.map((seedIdx, pos) => {
    const c = CLIENT_SEEDS[seedIdx];
    const id = pos + 1;
    const off = clientCreatedOff[seedIdx];
    return {
      id,
      client_code: `CL-${pad4(id)}`,
      name: c.name,
      phone: String(9876543000 + seedIdx * 137),
      email: c.email,
      place: c.place,
      address: `No. ${12 + seedIdx * 3}, ${STREETS[seedIdx % STREETS.length]}, ${c.place}, Tamil Nadu`,
      notes: c.notes,
      created_by_name: byIdx(seedIdx),
      updated_by_name: byIdx(seedIdx + 1),
      created_at: stamp(off, 9 + (seedIdx % 6), (seedIdx * 7) % 60),
      updated_at: stamp(Math.min(0, off + 1 + (seedIdx % 4)), 15, (seedIdx * 11) % 60),
    };
  });

  // ── events ──
  const rawEvents = EVENT_SEEDS.map((s, k) => {
    const [off, ci, type, venue, time, total, pct, opts = {}] = s;
    const cc = clientCreatedOff[ci];
    const lead = 7 + ((k * 3) % 18);
    const createdOff = Math.min(0, Math.max(cc, off > 0 ? cc + 1 + (k % 3) : off - lead));
    return { k, off, ci, type, venue, time, total, pct, cancel: !!opts.cancel, createdOff };
  }).sort((a, b) => a.createdOff - b.createdOff || a.off - b.off || a.k - b.k);

  const events = [];
  const payments = [];
  const transactions = [];
  let txId = 0;

  rawEvents.forEach((r, pos) => {
    const id = pos + 1;
    const status = statusFor(r.off, r.cancel);
    const updatedOff = Math.min(
      0,
      Math.max(r.createdOff, status === "completed" ? r.off + 3 : r.createdOff + 1 + (id % 4))
    );

    events.push({
      id,
      event_code: `EV-${pad4(id)}`,
      client: clientId[r.ci],
      photography_type: r.type,
      location: r.venue,
      event_date: dateStr(r.off),
      event_time: `${r.time}:00`,
      address: `${r.venue}, Tamil Nadu`,
      description: NOTES[id % NOTES.length],
      status,
      payId: id,
      created_by_name: byIdx(id),
      updated_by_name: byIdx(id + 1),
      created_at: stamp(r.createdOff, 10 + (id % 7), (id * 13) % 60),
      updated_at: stamp(updatedOff, 16, (id * 17) % 60),
    });

    payments.push({ id, event: id, total_amount: r.total });

    // ── transactions (never dated in the future) ──
    const paid = r.pct >= 1 ? r.total : roundTo500(r.total * r.pct);
    const parts = splitPaid(paid, r.total);
    let prev = r.createdOff;
    parts.forEach((amount, i) => {
      const isLast = i === parts.length - 1;
      let x =
        i === 0
          ? Math.min(-1, r.off - 21)
          : isLast && r.off < 0
          ? r.off + 2
          : r.off - 7;
      x = Math.min(0, Math.max(prev, r.createdOff, x));
      prev = x;
      transactions.push({
        id: ++txId,
        payment: id,
        amount,
        payment_date: dateStr(x),
        payment_method: ["upi", "cash", "bank"][(txId + i) % 3],
      });
    });
  });

  // ── bookings (pending website requests) ──
  const clientPhone = (seedIdx) => String(9876543000 + seedIdx * 137);
  const bookings = BOOKING_SEEDS.map((b, i) => ({
    id: i + 1,
    name: b.name,
    phone: b.clientIdx != null ? clientPhone(b.clientIdx) : b.phone,
    event_type: b.type,
    event_date: dateStr(b.off),
    location: b.location,
    status: "pending",
    created_at: stamp(-b.ago, 8 + ((i * 5) % 12), (i * 23) % 60),
  }));

  // ── gallery (newest first = seed order) ──
  const gallery = GALLERY_SEEDS.map((g, i) => ({
    id: i + 1,
    title: g.title,
    category: "image",
    original_filename: g.file,
    file_size: (180 + ((i * 173) % 1900)) * 1024,
    signed_url: UNSPLASH(g.id),
    credit: g.by,
    created_at: stamp(-(i * 7 + 1), 11, (i * 9) % 60),
    uploaded_by_name: byIdx(i),
  }));

  return {
    users,
    clients,
    events,
    payments,
    transactions,
    bookings,
    gallery,
    seq: {
      client: clients.length,
      event: events.length,
      payment: payments.length,
      transaction: txId,
      booking: bookings.length,
      gallery: gallery.length,
    },
  };
}