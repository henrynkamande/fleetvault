import { AxiosInstance, AxiosError } from "axios";

/**
 * Centralized HTTP error handling (aligned with Metsamdti-frontend).
 */
const ErrorInterceptor = (httpClient: AxiosInstance) => {
  httpClient.interceptors.response.use(
    (response) => response,
    (error: AxiosError) => {
      if (!error.response) {
        const raw = (error.message || "").trim();
        const isGenericAxiosNetwork = !raw || raw === "Network Error";
        const errorMessage = isGenericAxiosNetwork
          ? "We couldn't reach the server. Check your connection and try again."
          : raw;

        return Promise.reject({
          message: errorMessage,
          code: "NETWORK_ERROR",
          originalError: error,
        });
      }

      const status = error.response.status;
      const data = error.response.data as {
        message?: string;
        error?: string;
        detail?: string;
      };

      const errorMessage =
        data?.message || data?.error || data?.detail || "An error occurred";

      switch (status) {
        case 400:
          return Promise.reject({
            message: errorMessage || "Invalid request",
            code: "BAD_REQUEST",
            status,
            data,
          });
        case 401:
          return Promise.reject({
            message: errorMessage || "Unauthorized. Please log in again.",
            code: "UNAUTHORIZED",
            status,
          });
        case 403:
          return Promise.reject({
            message: "You don't have permission to perform this action.",
            code: "FORBIDDEN",
            status,
          });
        case 404:
          return Promise.reject({
            message: "Resource not found",
            code: "NOT_FOUND",
            status,
          });
        case 422:
          return Promise.reject({
            message: errorMessage || "Validation error",
            code: "VALIDATION_ERROR",
            status,
            data,
          });
        case 429:
          return Promise.reject({
            message: "Too many requests. Please try again later.",
            code: "RATE_LIMIT",
            status,
          });
        case 500:
          return Promise.reject({
            message: "Server error. Please try again later.",
            code: "SERVER_ERROR",
            status,
          });
        default:
          return Promise.reject({
            message: errorMessage || "An unexpected error occurred",
            code: "UNKNOWN_ERROR",
            status,
            data,
          });
      }
    },
  );
};

export default ErrorInterceptor;
