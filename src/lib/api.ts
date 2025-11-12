
import axios from "axios";

export const api = axios.create({
    baseURL: import.meta.env.VITE_API_BASE,
    headers: { "Content-Type": "application/json" },
});

api.interceptors.request.use((config) => {
    const token = localStorage.getItem("token");
    if (token) config.headers.Authorization = `Bearer ${token}`;
    return config;
});

api.interceptors.response.use(
    (res) => res,
    (err) => {
        const msg =
        err?.response?.data?.message ||
        err?.message ||
        "Terjadi kesalahan jaringan.";
        return Promise.reject(new Error(msg));
    }
);
