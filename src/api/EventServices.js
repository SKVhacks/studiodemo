import API from "./axios";

export const ClientEvent = (id) => {
    return API.get(`events/?client=${id}`);
}

export const DeleteEvent = (id) => {
    return API.delete(`/events/${id}/`);
}
export const CreateEvent = (data) => {
    return API.post("/events/", data);
}
export const UpdateEvent = (id, data) => {
    return API.patch(`/events/${id}/`, data);
}

export const CalendarSummary = (from, to) => {
    return API.get(`/events/calendar-summary/`, {
        params: { event_date_from: from, event_date_to: to }
    });
};

export const EventsByDate = (date) => {
    return API.get(`/events/`, {
        params: { event_date_from: date, event_date_to: date }
    });
};

export const ListEvent = (params = {}) => {
    return API.get("/events/", { params });
};

export const UpcomingEvents = () => {
    return API.get("/events/upcoming/");
};