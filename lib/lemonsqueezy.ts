import * as LemonSqueezy from "@lemonsqueezy/lemonsqueezy.js";

let initialized = false;

export function initLemonSqueezy() {
  if (initialized) {
    return;
  }

  const apiKey = process.env.LEMONSQUEEZY_API_KEY;
  if (!apiKey) {
    return;
  }

  const maybeSetup = (LemonSqueezy as { lemonSqueezySetup?: (args: { apiKey: string }) => void })
    .lemonSqueezySetup;

  if (typeof maybeSetup === "function") {
    maybeSetup({ apiKey });
    initialized = true;
  }
}

export function getCheckoutProviderLabel() {
  return "Stripe Payment Link";
}
