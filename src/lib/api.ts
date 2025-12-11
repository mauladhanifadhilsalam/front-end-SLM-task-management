import axios, {
  AxiosHeaders,
  type AxiosError,
  type AxiosInstance,
  type InternalAxiosRequestConfig,
  type AxiosRequestHeaders,
} from "axios";
import { queryClient } from "./query-client";

const API_BASE = import.meta.env.VITE_API_BASE as string;

type RetriableConfig = InternalAxiosRequestConfig & { _retry?: boolean };
type AnyHeaders = AxiosRequestHeaders | undefined;

const refreshClient = axios.create({
  baseURL: API_BASE,
  withCredentials: true,
});

let refreshRequest: Promise<string | null> | null = null;

const clearStoredAuth = () => {
  localStorage.removeItem("token");
  localStorage.removeItem("role");
  localStorage.removeItem("email");
  queryClient.clear();
};

const persistAuthFromResponse = (data: any) => {
  const nextToken: string | undefined =
    data?.accessToken ?? data?.token ?? data?.data?.token;

  const normalizeRole = (r: unknown): string | undefined => {
    const s = String(r ?? "")
      .trim()
      .toLowerCase()
      .replace(/\s+/g, "_");
    return s ? s : undefined;
  };

  const nextRole: string | undefined = normalizeRole(
    data?.role ?? data?.user?.role ?? data?.data?.role,
  );

  if (nextToken) localStorage.setItem("token", nextToken);
  if (nextRole) localStorage.setItem("role", nextRole);

  return nextToken ?? null;
};

const refreshAccessToken = async (): Promise<string | null> => {
  if (!refreshRequest) {
    refreshRequest = refreshClient
      .post("/auth/refresh")
      .then((res) => persistAuthFromResponse(res?.data))
      .catch((error) => {
        clearStoredAuth();
        throw error;
      })
      .finally(() => {
        refreshRequest = null;
      });
  }

  return refreshRequest;
};

const toAxiosHeaders = (headers: AnyHeaders): AxiosHeaders =>
  headers instanceof AxiosHeaders
    ? headers
    : AxiosHeaders.from(headers ?? {});

const attachAuthHeader = (config: InternalAxiosRequestConfig) => {
  const token = localStorage.getItem("token");

  if (token) {
    const headers = toAxiosHeaders(config.headers);

    headers.set("Authorization", `Bearer ${token}`);

    config.headers = headers;
  }

  return config;
};

const handleResponseError =
  (client: AxiosInstance) =>
  async (err: AxiosError): Promise<any> => {
    const originalRequest = err.config as RetriableConfig | undefined;
    const status = err?.response?.status;
    const isAuthFlow =
      originalRequest?.url?.includes("/auth/login") ||
      originalRequest?.url?.includes("/auth/refresh");

    const shouldAttemptRefresh =
      (status === 401 || status === 403) &&
      originalRequest &&
      !originalRequest._retry &&
      !isAuthFlow;

    if (shouldAttemptRefresh) {
      originalRequest._retry = true;

      try {
        const newToken = await refreshAccessToken();

        if (newToken) {
          const headers = toAxiosHeaders(originalRequest.headers);
          headers.set("Authorization", `Bearer ${newToken}`);
          originalRequest.headers = headers;

          return client(originalRequest);
        }
      } catch (refreshError) {
        const message =
          (refreshError as any)?.response?.data?.message ||
          "Sesi Anda telah berakhir. Silakan login kembali.";

        clearStoredAuth();
        if (typeof window !== "undefined") {
          window.location.href = "/";
        }

        return Promise.reject(new Error(message));
      }

      return Promise.reject(
        new Error("Sesi Anda telah berakhir. Silakan login kembali."),
      );
    }

    const message =
      (err?.response?.data as any)?.message ||
      err?.message ||
      "Terjadi kesalahan jaringan.";

    return Promise.reject(new Error(message));
  };

const setupInterceptors = (client: AxiosInstance) => {
  client.interceptors.request.use(attachAuthHeader);
  client.interceptors.response.use(
    (res) => res,
    handleResponseError(client),
  );
};

export const api = axios.create({
  baseURL: API_BASE,
  headers: { "Content-Type": "application/json" },
  withCredentials: true,
});

axios.defaults.withCredentials = true;
axios.defaults.baseURL = API_BASE;
setupInterceptors(api);
setupInterceptors(axios);
