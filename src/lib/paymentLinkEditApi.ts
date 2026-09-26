/** Edit a payment link's mutable fields (URL and amount stay unchanged). */

import { apiFetch } from "./api";
import type { AuthToken, WalletId } from "./brands";
import type { PaymentLink } from "./payment-links";

export type PaymentLinkEdit = {
  name: string;
  description?: string;
  imageUrl?: string | null;
  redirectUrl?: string;
};

/** Assumes `PUT /v1/wallets/:id/payment-links/:linkId` accepts these fields (null clears one). */
export function updatePaymentLink(
  token: AuthToken,
  walletId: WalletId,
  linkId: string,
  edit: PaymentLinkEdit,
) {
  return apiFetch<PaymentLink>(`/v1/wallets/${walletId}/payment-links/${linkId}`, {
    method: "PUT",
    token,
    body: JSON.stringify({
      name: edit.name,
      description: edit.description || null,
      image_url: edit.imageUrl || null,
      redirect_url: edit.redirectUrl || null,
    }),
  });
}

/** Redirect targets must be http(s) URLs; returns an error message or null. */
export function validateRedirectUrl(value: string): string | null {
  if (!value) return null;
  try {
    const u = new URL(value);
    return u.protocol === "https:" || u.protocol === "http:" ? null : "Redirect URL must start with https://.";
  } catch {
    return "Enter a valid redirect URL.";
  }
}
