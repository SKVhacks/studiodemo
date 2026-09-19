import API from "./axios";

export const checkmail = (email) => {
    return API.post("/auth/check-email/", { email });
}

export const loginWithPass = (email, password) => {
    return API.post("/auth/login-password/", { email, password });
}

export const verifyotp = (email, otp) => {
    return API.post("/auth/verify-otp/", { email, otp });
}

export const requestOtpForgot = (email) => {
    return API.post("/auth/request-otp/", { email });
}

export const verifyOtpForgot = (email, otp) => {
    return API.post("/auth/verify-otp/", { email, otp });
}

export const setPasswordAPI = (password, otpSessionToken) => {
    return API.post(
        "/auth/set-password/",
        { password },
        { headers: { Authorization: `Bearer ${otpSessionToken}` } }
    );
} 
