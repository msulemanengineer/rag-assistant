/** Change this to rename the product everywhere in the UI. */
export const APP_NAME = "DocuMind";

export const API_BASE_URL = (
  process.env.NEXT_PUBLIC_API_BASE_URL ?? "http://localhost:8000"
).replace(/\/$/, "");
