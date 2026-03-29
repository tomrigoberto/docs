import { NextResponse } from "next/server";
import { getStripe } from "@/lib/stripe";
import { prisma } from "@/lib/prisma";
import { headers } from "next/headers";

export async function POST(req: Request) {
  const body = await req.text();
  const signature = headers().get("stripe-signature");

  if (!signature) {
    return NextResponse.json({ error: "No signature" }, { status: 400 });
  }

  let event;
  try {
    const stripe = await getStripe();
    event = stripe.webhooks.constructEvent(
      body,
      signature,
      process.env.STRIPE_WEBHOOK_SECRET!
    );
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 400 });
  }

  if (event.type === "checkout.session.completed") {
    const session = event.data.object as any;
    const templateIds = session.metadata?.templateIds?.split(",") || [];
    const customerEmail = session.customer_details?.email;

    if (customerEmail && templateIds.length > 0) {
      const user = await prisma.user.findUnique({ where: { email: customerEmail } });

      if (user) {
        for (const templateId of templateIds) {
          const template = await prisma.template.findUnique({ where: { id: templateId } });
          if (template) {
            await prisma.purchase.create({
              data: {
                userId: user.id,
                templateId,
                amount: template.salePrice ?? template.price,
                stripePaymentId: session.payment_intent,
              },
            });
            await prisma.template.update({
              where: { id: templateId },
              data: { downloads: { increment: 1 } },
            });
          }
        }
      }
    }
  }

  return NextResponse.json({ received: true });
}
