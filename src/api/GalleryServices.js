import API from "./axios";

export const GetGallery = () => {
    return API.get("/gallery/");
}

export const UploadGallery = (formData) => {
    return API.post("/gallery/upload/", formData, {
        headers: { "Content-Type": "multipart/form-data" },
    });
}

export const DeleteGallery = (id) => {
    return API.delete(`/gallery/${id}/`);
}