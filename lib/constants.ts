export const APP_NAME = "FleetVault";
export const APP_MARKETING_URL = "https://www.myfleetvault.com/";

export const DRIVER_APP_ENABLED =
  process.env.NEXT_PUBLIC_DRIVER_APP_ENABLED === "true";

/** Use live driver API instead of static demo (dev convenience). */
export const DRIVER_LIVE_API =
  process.env.NEXT_PUBLIC_DRIVER_LIVE_API === "true";

export const ACCESS_TOKEN_KEY = "token_fleetflow";
export const REFRESH_TOKEN_KEY = "refresh_token_fleetflow";

/** When true, skip Stripe checkout and grant dashboard access immediately after signup. */
export const SKIP_BILLING =
  process.env.NEXT_PUBLIC_SKIP_BILLING === "true";
