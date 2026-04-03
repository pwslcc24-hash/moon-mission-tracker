import { createClientFromRequest } from 'npm:@base44/sdk@0.8.23';
import Stripe from 'npm:stripe@14.25.0';

Deno.serve(async (req) => {
  try {
    const { amount, successUrl, cancelUrl } = await req.json();

    if (!amount || amount < 1) {
      return Response.json({ error: 'Invalid amount' }, { status: 400 });
    }

    const stripe = new Stripe(Deno.env.get('STRIPE_SECRET_KEY'));

    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      mode: 'payment',
      line_items: [
        {
          price_data: {
            currency: 'usd',
            unit_amount: Math.round(amount * 100), // cents
            product_data: {
              name: 'Support Moon Mission Tracker',
              description: 'Help keep this tracker live and improving 🚀',
            },
          },
          quantity: 1,
        },
      ],
      success_url: successUrl,
      cancel_url: cancelUrl,
    });

    return Response.json({ url: session.url });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});