import { Router, Request, Response } from 'express';
import crypto from 'crypto';
import { db } from '../database/store';

export const paymentSimulatorRouter = Router();

const WEBHOOK_SECRET = process.env.PAYMENT_SIM_WEBHOOK_SECRET || 'sim_webhook_secret_default_12345';

export interface PaymentSimulatorConfig {
  defaultOutcome: 'auto' | 'success' | 'fail' | 'pending';
  latencyMs: number;
  webhookDelayMs: number;
  duplicateRate: number;
  reorderWebhooks: boolean;
}

export const simConfig: PaymentSimulatorConfig = {
  defaultOutcome: 'auto',
  latencyMs: 600,
  webhookDelayMs: 1500,
  duplicateRate: 0.1,
  reorderWebhooks: false,
};

export function signWebhookPayload(payload: any): string {
  const hmac = crypto.createHmac('sha256', WEBHOOK_SECRET);
  hmac.update(JSON.stringify(payload));
  return hmac.digest('hex');
}

/**
 * Create Payment Intent
 */
paymentSimulatorRouter.post('/payments/sim/intents', (req: Request, res: Response) => {
  const { amount, currency = 'INR', orderId, userId = 'guest_user' } = req.body;

  if (!amount || amount <= 0) {
    return res.status(400).json({ error: 'Valid positive amount is required' });
  }

  const intentId = `pi_${crypto.randomBytes(12).toString('hex')}`;
  const intent = db.insertOne('payments', {
    _id: intentId,
    orderId,
    userId,
    amount,
    currency,
    status: 'REQUIRES_PAYMENT_METHOD',
    attempts: 0,
    createdAt: new Date().toISOString(),
    expiresAt: new Date(Date.now() + 600 * 1000).toISOString(), // 10 min TTL
  });

  res.status(201).json({
    intentId: intent._id,
    amount: intent.amount,
    currency: intent.currency,
    status: intent.status,
    demoBadge: 'Demo payment — no real money is charged',
  });
});

/**
 * Confirm Payment Intent (Processes with deterministic magic values)
 */
paymentSimulatorRouter.post('/payments/sim/intents/:id/confirm', async (req: Request, res: Response) => {
  const { id } = req.params;
  const { paymentMethod, upiId, cardNumber, otp3ds } = req.body;

  const intent = db.findById('payments', id);
  if (!intent) {
    return res.status(404).json({ error: 'Payment intent not found' });
  }

  if (intent.status === 'SUCCEEDED') {
    return res.json({ message: 'Payment already succeeded', intent });
  }

  // Determine outcome based on magic values
  let outcome: 'SUCCEEDED' | 'FAILED' | 'REQUIRES_ACTION' | 'PENDING' = 'SUCCEEDED';
  let failureReason: string | undefined;

  if (simConfig.defaultOutcome === 'fail') {
    outcome = 'FAILED';
    failureReason = 'Forced failure by System Lab chaos switch';
  } else if (simConfig.defaultOutcome === 'pending') {
    outcome = 'PENDING';
  } else if (simConfig.defaultOutcome === 'auto') {
    // Magic values check
    if (paymentMethod === 'upi') {
      const upi = String(upiId || '').toLowerCase().trim();
      if (upi === 'fail@hukum') {
        outcome = 'FAILED';
        failureReason = 'Simulated UPI collect request declined by user';
      } else if (upi === 'pending@hukum') {
        outcome = 'PENDING';
      } else if (upi === 'timeout@hukum') {
        outcome = 'FAILED';
        failureReason = 'Simulated UPI session expired / timed out';
      } else {
        outcome = 'SUCCEEDED';
      }
    } else if (paymentMethod === 'card') {
      const card = String(cardNumber || '').replace(/\s+/g, '');
      if (card.endsWith('0002')) {
        outcome = 'FAILED';
        failureReason = 'Simulated Card declined: Insufficient funds';
      } else if (card.endsWith('3220')) {
        if (!otp3ds) {
          outcome = 'REQUIRES_ACTION';
        } else if (otp3ds === '123456') {
          outcome = 'SUCCEEDED';
        } else {
          outcome = 'FAILED';
          failureReason = 'Invalid 3-D Secure OTP';
        }
      } else {
        outcome = 'SUCCEEDED';
      }
    } else if (paymentMethod === 'wallet' || paymentMethod === 'paylater') {
      outcome = 'SUCCEEDED';
    }
  }

  // Artificial latency for realism
  if (simConfig.latencyMs > 0) {
    await new Promise((r) => setTimeout(r, simConfig.latencyMs));
  }

  const updated = db.updateOne('payments', id, {
    status: outcome,
    paymentMethod,
    failureReason,
    updatedAt: new Date().toISOString(),
  });

  // If order associated, update order state
  if (intent.orderId) {
    const order = db.findById('orders', intent.orderId);
    if (order) {
      if (outcome === 'SUCCEEDED') {
        db.updateOne('orders', order._id, {
          status: 'CONFIRMED',
          timeline: [...(order.timeline || []), { status: 'CONFIRMED', at: new Date().toISOString() }],
        });
      } else if (outcome === 'FAILED') {
        db.updateOne('orders', order._id, {
          status: 'CANCELLED',
          cancellationReason: failureReason,
          timeline: [...(order.timeline || []), { status: 'CANCELLED', at: new Date().toISOString() }],
        });
      }
    }
  }

  // Simulate HMAC-signed Webhook dispatch asynchronously
  setTimeout(() => {
    dispatchSimulatedWebhook({
      eventType: `payment_intent.${outcome.toLowerCase()}`,
      intentId: id,
      orderId: intent.orderId,
      amount: intent.amount,
      outcome,
    });
  }, simConfig.webhookDelayMs);

  res.json({
    intentId: id,
    status: outcome,
    orderId: intent.orderId,
    intent: updated,
    failureReason,
    demoBadge: 'Demo payment — no real money is charged',
  });
});

/**
 * Webhook Dispatcher
 */
function dispatchSimulatedWebhook(event: any) {
  const signature = signWebhookPayload(event);
  console.log(`\n🔔 [SIMULATED WEBHOOK] Event: ${event.eventType} | Intent: ${event.intentId}`);
  console.log(`   Signature (HMAC-SHA256): ${signature}\n`);

  // Chaos: simulate duplicate delivery
  if (Math.random() < simConfig.duplicateRate) {
    setTimeout(() => {
      console.log(`⚠️ [WEBHOOK CHAOS] Duplicate webhook delivered for ${event.intentId}`);
    }, 1000);
  }
}

/**
 * Refund Intent Simulation
 */
paymentSimulatorRouter.post('/payments/sim/intents/:id/refund', (req: Request, res: Response) => {
  const { id } = req.params;
  const intent = db.findById('payments', id);
  if (!intent) return res.status(404).json({ error: 'Payment not found' });

  db.updateOne('payments', id, { status: 'REFUNDED', refundedAt: new Date().toISOString() });

  if (intent.orderId) {
    const order = db.findById('orders', intent.orderId);
    if (order) {
      db.updateOne('orders', order._id, {
        status: 'REFUNDED',
        timeline: [...(order.timeline || []), { status: 'REFUNDED', at: new Date().toISOString() }],
      });
    }
  }

  res.json({
    message: 'Simulated refund processed successfully',
    intentId: id,
    status: 'REFUNDED',
  });
});

/**
 * Payment Simulator Chaos Settings (Configured from System Lab)
 */
paymentSimulatorRouter.get('/payments/sim/config', (_req: Request, res: Response) => {
  res.json({ config: simConfig });
});

paymentSimulatorRouter.post('/payments/sim/config', (req: Request, res: Response) => {
  const { defaultOutcome, latencyMs, webhookDelayMs, duplicateRate, reorderWebhooks } = req.body;
  if (defaultOutcome) simConfig.defaultOutcome = defaultOutcome;
  if (typeof latencyMs === 'number') simConfig.latencyMs = latencyMs;
  if (typeof webhookDelayMs === 'number') simConfig.webhookDelayMs = webhookDelayMs;
  if (typeof duplicateRate === 'number') simConfig.duplicateRate = duplicateRate;
  if (typeof reorderWebhooks === 'boolean') simConfig.reorderWebhooks = reorderWebhooks;

  res.json({ message: 'Payment simulator chaos config updated', config: simConfig });
});
