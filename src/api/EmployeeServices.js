import API from "./axios";

export const AddEmployee = (params = {}) => {
    return API.post("/auth/employees/create/", params)
}

export const FetchEmployee = () => {
    return API.get("/auth/employees/");
}

export const UpdateEmployee = (id, params = {}) => {
    return API.put(`/auth/employees/${id}/update/`, params);
}

export const DeleteEmployee = (id) => {
    return API.delete(`/auth/employees/${id}/delete/`);
}

export const ForceLogout = (id) => {
    return API.post(`/auth/employees/${id}/force-logout/`)
}

export const RequestUnblock = (id) => {
    return API.post(`/auth/employees/${id}/request-unblock/`);
};

export const ConfirmUnblock = (id, otp) => {
    return API.post(`/auth/employees/${id}/confirm-unblock/`, { otp });
};

export const GetEmployee = (userID) => {
    return API.get(`/auth/employees/${userID}/`)
}

export const UpdateProfilePicture = (formData) => {
    return API.patch("/auth/profile/picture/", formData);
}

export const DeviceList = (userID) => {
    return API.get(`/auth/sessions/${userID}/`);
}

export const DeleteDevice = (sessionID) => {
    return API.delete(`/auth/sessions/${sessionID}/revoke/`);
}

