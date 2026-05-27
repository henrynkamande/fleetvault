export type PlatformRegisterPayload = {
  email: string;
  phone_number: string;
  first_name: string;
  last_name: string;
  password: string;
  confirm_password: string;
};

export type PlatformLoginPayload = {
  email: string;
  password: string;
};

export type PlatformAuthResponse = {
  message?: string;
  tokens: { access: string; refresh: string };
  user: import("@/types/user").User;
  redirect_url: string;
};
