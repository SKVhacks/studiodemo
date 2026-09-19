import API from "./axios";

export const GetBookings = (params = {}) =>
    API.get("/bookings/", { params });

export const AcceptBooking = (id, data) =>
    API.post(`/bookings/${id}/accept/`, data);

export const DeclineBooking = (id) =>
    API.post(`/bookings/${id}/decline/`);