import { NextRequest, NextResponse } from 'next/server';
import Stripe from 'stripe';

export async function POST(req: NextRequest) {
  try {
    const body = await req.text();
    const signature = req.headers.get('stripe-signature');

    const stripeSecretKey = process.env.STRIPE_SECRET_KEY;
    const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;

    if (!stripeSecretKey || !webhookSecret || !signature) {
      return NextResponse.json({ received: true, configured: false });
    }

    const stripe = new Stripe(stripeSecretKey);

    const event = stripe.webhooks.constructEvent(body, signature, webhookSecret);

    if (event.type === 'checkout.session.completed') {
      const session = event.data.object;
      const userId = session.metadata?.userId;
      const customerId = typeof session.customer === 'string' ? session.customer : session.customer?.id;
      const paymentId = typeof session.payment_intent === 'string' ? session.payment_intent : session.payment_intent?.id;

      if (userId) {
        const { isSupabaseAdminConfigured, supabaseAdmin } = await import('@/lib/supabase-admin');

        if (isSupabaseAdminConfigured()) {
          await supabaseAdmin
            .from('weddingroadmap_profiles')
            .update({
              is_premium: true,
              stripe_customer_id: customerId ?? null,
              stripe_payment_id: paymentId ?? null,
              premium_activated_at: new Date().toISOString(),
            })
            .eq('user_id', userId);
        }
      }
    }

    return NextResponse.json({ received: true });
  } catch (error) {
    console.error('Webhook error:', error);
    return NextResponse.json({ error: 'Webhook error' }, { status: 400 });
  }
}
