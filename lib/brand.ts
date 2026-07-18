export const PRODUCT_NAME = "HandleFi";

const configuredXHandle = process.env.NEXT_PUBLIC_HANDLEFI_X_HANDLE?.trim()
  .replace(/^@/, "")
  .replace(/[^a-zA-Z0-9_]/g, "");

export const PRODUCT_X_HANDLE = configuredXHandle || "handlefixx";
export const PRODUCT_X_MENTION = `@${PRODUCT_X_HANDLE}`;
export const PRODUCT_X_URL = `https://x.com/${PRODUCT_X_HANDLE}`;
