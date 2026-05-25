import axios, { type AxiosInstance } from "axios";
import AuthInterceptor from "@/lib/interceptors/auth-interceptor";
import ErrorInterceptor from "@/lib/interceptors/error-interceptor";
import { apiBaseUrl } from "@/lib/httpClient/config";

const httpClient: AxiosInstance = axios.create({
  baseURL: apiBaseUrl,
  timeout: 60000,
  headers: {
    "Content-Type": "application/json",
    Accept: "application/json; version=1.0",
  },
});

AuthInterceptor(httpClient);
ErrorInterceptor(httpClient);

export { apiBaseUrl };
export default httpClient;
