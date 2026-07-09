import Stripe from "stripe";
import config from "../../config";
import catchAsync from "./catchAsync";
import sendResponse from "./sendResponse";
import prisma from "../lib/prisma";
import { PaymentStatusEnum } from "@prisma/client";
import cache from "./cache";


const stripe = new Stripe(config.stripe.secretKey as string);

const webhookSecret = config.stripe.webhookSecret as string;

const handleWebHook = catchAsync(async (req: any, res: any) => {
  const sig = req.headers["stripe-signature"] as string;

  if (!sig) {
    return sendResponse(res, {
      statusCode: 400,
      success: false,
      message: "Missing Stripe signature header.",
      data: null,
    });
  }

  let event: Stripe.Event;

  try {
    event = stripe.webhooks.constructEvent(
      req.body,
      sig,
      webhookSecret,
    );
  } catch (err: any) {
    return res.status(400).send(`Webhook Error: ${err.message}`);
  }
  switch (event.type) {
    case "checkout.session.completed": {
      const completedSession = event.data.object as Stripe.Checkout.Session;

      const metadata = completedSession.metadata ?? {};
      const subscriberId = metadata.subscriberId;
      const userId = metadata.userId;
      const zones = (metadata.zone ?? "")
        .split(",")
        .map((zone) => zone.trim())
        .filter(Boolean);

      if (!subscriberId || !userId || zones.length === 0) {
        console.warn(
          "Missing checkout metadata for subscription update:",
          completedSession.id,
        );
        break;
      }

      await prisma.$transaction([
        prisma.subscriber.updateMany({
          where: { id: subscriberId, userId },
          data: {
            status: PaymentStatusEnum.Completed,
            isActive: true,
          },
        }),
        prisma.user.update({
          where: { id: userId },
          data: {
            subscriptionArea: zones,
          },
        }),
      ]);

      cache.invalidatePattern("payments:*").catch(() => {});
      cache.invalidate("dashboard:stats").catch(() => {});

      console.log("checkout.session.completed:", completedSession.id);
      break;
    }

    default: {
      console.log(`Unhandled event type: ${event.type}`);
      break;
    }
  }

  res.status(200).send("Event received");
});

export default handleWebHook;
