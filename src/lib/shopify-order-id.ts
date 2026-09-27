export function normalizeDraftOrderId(value: string): string {
  const match = /^(?:gid:\/\/shopify\/DraftOrder\/)?([1-9]\d*)$/.exec(value);
  if (!match) throw new Error('Invalid draft order ID');
  return match[1];
}

export function isPaidFinancialStatus(value: unknown) {
  return typeof value === 'string' && ['paid', 'partially_refunded', 'refunded'].includes(value.toLowerCase());
}
