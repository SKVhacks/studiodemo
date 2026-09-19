
import axios from "axios";

// ── DEMO MODE ────────────────────────────────────────────────────────────────
// Set VITE_USE_MOCK=true in .env to run the whole app on in-browser fake data
// (no backend needed). Remove it / set to false to talk to the real API again.
const USE_MOCK  = true;

const API = axios.create({
  baseURL: import.meta.env.VITE_BACKEND_URL,
  withCredentials: true,
  // lazy-loaded so the mock code is never fetched when the real API is used
  ...(USE_MOCK && {
    adapter: (config) => import("./mock/mockServer").then((m) => m.mockAdapter(config)),
  }),
});

let isRefreshing = false;
let refreshSubscribers = [];

const subscribeTokenRefresh = (cb) => refreshSubscribers.push(cb);
const onRefreshed = (newToken) => {
  refreshSubscribers.forEach(cb => cb(newToken));
  refreshSubscribers = [];
};

// ✅ Request interceptor — attach access token
API.interceptors.request.use((config) => {
  const token = localStorage.getItem("access");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// ✅ Response interceptor — handle errors + auto refresh on 401
API.interceptors.response.use(
  (response) => response,
  async (error) => {
    const original = error.config;

    console.error(
      "API Error:",
      error.config?.url,
      error.response?.status,
      error.response?.data
    );

    if (error.response?.status === 401 && !original._retry) {
      original._retry = true;

      const refresh = localStorage.getItem("refresh");
      if (!refresh) return Promise.reject(error);

      // ✅ If already refreshing, queue this request and wait
      if (isRefreshing) {
        return new Promise((resolve) => {
          subscribeTokenRefresh((newToken) => {
            original.headers.Authorization = `Bearer ${newToken}`;
            resolve(API(original));
          });
        });
      }

      isRefreshing = true;  // ✅ lock

      try {
        const res = await axios.post(
          `${import.meta.env.VITE_BACKEND_URL}/auth/token/refresh/`,
          { refresh }
        );

        const newAccess = res.data.access;
        localStorage.setItem("access", newAccess);
        onRefreshed(newAccess);                     // ✅ notify all queued requests
        original.headers.Authorization = `Bearer ${newAccess}`;
        return API(original);
      } catch {
        localStorage.clear();
        window.location.href = "/login";
      } finally {
        isRefreshing = false;                       // ✅ always release lock
      }
    }

    return Promise.reject(error);
  }
);

export default API;