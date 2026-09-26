/** Build a SEP-7 `web+stellar:pay` URI. */
export function sep7PayUri(p: {
  destination: string;
  amount?: string;
  assetCode?: string;
  assetIssuer?: string;
  memoId?: number | string;
}): string {
  const q = new URLSearchParams({ destination: p.destination });
  if (p.amount) q.set("amount", p.amount);
  if (p.assetCode && p.assetIssuer) {
    q.set("asset_code", p.assetCode);
    q.set("asset_issuer", p.assetIssuer);
  }
  if (p.memoId !== undefined && p.memoId !== null && p.memoId !== "") {
    q.set("memo", String(p.memoId));
    q.set("memo_type", "MEMO_ID");
  }
  return `web+stellar:pay?${q.toString()}`;
}
