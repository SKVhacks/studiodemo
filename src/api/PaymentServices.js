import API from "./axios";

export const FetchPayments = (params = {}) => {
    return API.get("payments/", { params });
};

export const UpdatePayment = (id, data) => {
    return API.patch(`payments/${id}/`, data);
}

export const AddTransaction = (data) => {
    return API.post("transactions/", data);
};

export const FetchTransaction = (id) => {
    return API.get(`transactions/?payment=${id}`)
}

export const DeleteTransaction = (id) => {
    return API.delete(`transactions/${id}/`);
};






