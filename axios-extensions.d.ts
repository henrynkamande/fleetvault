import "axios";

declare module "axios" {
  interface AxiosRequestConfig {
    /** Skip attaching Bearer token (public auth endpoints). */
    skipAuth?: boolean;
  }
}
