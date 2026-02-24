// Stripe integration for Wedding Roadmap
// Configure with actual Stripe keys in production

export const PRICE_PREMIUM = 980; // JPY (one-time payment)

export async function createCheckoutSession(userId: string): Promise<{ url: string }> {
  const res = await fetch('/api/stripe/checkout', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ userId }),
  });
  if (!res.ok) throw new Error('チェックアウトセッションの作成に失敗しました');
  return res.json();
}

export async function checkPremiumStatus(): Promise<boolean> {
  try {
    const res = await fetch('/api/stripe/status');
    if (!res.ok) return false;
    const data = await res.json();
    return data.isPremium === true;
  } catch {
    return false;
  }
}
