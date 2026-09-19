import API from "./axios";

export const ViewAllClient = (params = {}) => {
    return API.get("/clients/", { params });
}

export const CreateClient = (data) => {
    return API.post("/clients/", data);
}

export const UpdateClient = (id, data) => {
    return API.put(`/clients/${id}/`, data);
}

export const DeleteClient = (id) => {
    return API.delete(`/clients/${id}/`);
}

export const ViewClient = (id) => {
    return API.get(`/clients/${id}/`);
}

export const ChooseClient = (search) => {
    return API.get(`/clients/?search=${search}`);
}

