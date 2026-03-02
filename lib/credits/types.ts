export type CreditType =
  | "subscription_grant"
  | "subscription_reset"
  | "topup"
  | "api_usage"
  | "admin_adjustment";

export type CreditSource = "subscription" | "topup" | "admin";

export class CreditError extends Error {
  code: string;
  constructor(code: "INSUFFICIENT_CREDITS" | "NO_SUBSCRIPTION") {
    super(code === "INSUFFICIENT_CREDITS"
      ? "Insufficient credits. Please top up or upgrade your plan."
      : "Active subscription required.");
    this.code = code;
    this.name = "CreditError";
  }
}
