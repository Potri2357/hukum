import { Router, Request, Response } from 'express';
import crypto from 'crypto';
import { db } from '../database/store';

export const ordersRouter = Router();

/**
 * Place Order
 */
ordersRouter.post('/orders', (req: Request, res: Response) => {
  const {
    userId = 'guest_user',
    items,
    address,
    amount,
    paymentMethod,
    idempotencyKey,
  } = req.body;

  if (!items || items.length === 0) {
    return res.status(400).json({ error: 'Order must contain at least 1 item' });
  }

  // Idempotency check
  if (idempotencyKey) {
    const existing = db.findOne('orders', { idempotencyKey });
    if (existing) {
      return res.json({ order: existing, isDuplicate: true });
    }
  }

  const orderId = `ord_${crypto.randomBytes(8).toString('hex')}`;
  const now = new Date().toISOString();

  const newOrder = db.insertOne('orders', {
    _id: orderId,
    userId,
    items,
    address: address || {
      name: 'Aarav Sharma',
      street: '124, 100ft Road, Indiranagar',
      city: 'Bengaluru',
      state: 'Karnataka',
      pincode: '560038',
      phone: '9876543210',
    },
    amount: amount || {
      subtotal: items.reduce((s: number, i: any) => s + i.price * i.quantity, 0),
      discount: 0,
      shipping: 0,
      total: items.reduce((s: number, i: any) => s + i.price * i.quantity, 0),
    },
    status: paymentMethod === 'cod' ? 'CONFIRMED' : 'PLACED',
    paymentMethod: paymentMethod || 'simulated_upi',
    idempotencyKey: idempotencyKey || crypto.randomUUID(),
    createdAt: now,
    timeline: [
      { status: 'PLACED', at: now, note: 'Order placed by customer' },
      ...(paymentMethod === 'cod'
        ? [{ status: 'CONFIRMED', at: now, note: 'COD order confirmed automatically' }]
        : []),
    ],
  });

  // Clear cart for this user
  const cart = db.findOne('carts', { userId });
  if (cart) {
    db.updateOne('carts', cart._id, { items: [], appliedCoupon: null });
  }

  res.status(201).json({
    message: 'Order created successfully',
    order: newOrder,
  });
});

/**
 * Get User Orders
 */
ordersRouter.get('/orders', (req: Request, res: Response) => {
  const { userId = 'guest_user' } = req.query;
  const orders = db.find('orders', { userId: String(userId) });
  orders.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  res.json({ orders });
});

/**
 * Get Order Detail
 */
ordersRouter.get('/orders/:id', (req: Request, res: Response) => {
  const { id } = req.params;
  const order = db.findById('orders', id);
  if (!order) return res.status(404).json({ error: 'Order not found' });
  res.json({ order });
});

/**
 * Cancel Order
 */
ordersRouter.post('/orders/:id/cancel', (req: Request, res: Response) => {
  const { id } = req.params;
  const order = db.findById('orders', id);
  if (!order) return res.status(404).json({ error: 'Order not found' });

  if (['SHIPPED', 'OUT_FOR_DELIVERY', 'DELIVERED'].includes(order.status)) {
    return res.status(400).json({ error: 'Cannot cancel order after dispatch' });
  }

  const updated = db.updateOne('orders', id, {
    status: 'CANCELLED',
    timeline: [
      ...order.timeline,
      { status: 'CANCELLED', at: new Date().toISOString(), note: 'Cancelled by customer' },
    ],
  });

  res.json({ message: 'Order cancelled successfully', order: updated });
});

/**
 * Request Return
 */
ordersRouter.post('/orders/:id/return', (req: Request, res: Response) => {
  const { id } = req.params;
  const { reason = 'Defective/Wrong product' } = req.body;
  const order = db.findById('orders', id);
  if (!order) return res.status(404).json({ error: 'Order not found' });

  const updated = db.updateOne('orders', id, {
    status: 'RETURN_REQUESTED',
    returnReason: reason,
    timeline: [
      ...order.timeline,
      { status: 'RETURN_REQUESTED', at: new Date().toISOString(), note: `Return requested: ${reason}` },
    ],
  });

  res.json({ message: 'Return initiated', order: updated });
});

/**
 * Real-time Tracking Server-Sent Events (SSE) Stream
 */
ordersRouter.get('/orders/:id/stream', (req: Request, res: Response) => {
  const { id } = req.params;
  const order = db.findById('orders', id);

  if (!order) {
    return res.status(404).json({ error: 'Order not found' });
  }

  res.writeHead(200, {
    'Content-Type': 'text/event-stream',
    'Cache-Control': 'no-cache',
    Connection: 'keep-alive',
  });

  // Initial event
  res.write(`data: ${JSON.stringify({ type: 'INIT', order })}\n\n`);

  // Simulated progression of order steps every 4 seconds for live demo visual
  const stages = ['CONFIRMED', 'PACKED', 'SHIPPED', 'OUT_FOR_DELIVERY', 'DELIVERED'];
  let currentStageIndex = stages.indexOf(order.status);
  if (currentStageIndex === -1) currentStageIndex = 0;

  const interval = setInterval(() => {
    currentStageIndex++;
    if (currentStageIndex < stages.length) {
      const nextStage = stages[currentStageIndex];
      const updatedOrder = db.updateOne('orders', id, {
        status: nextStage,
        timeline: [
          ...order.timeline,
          { status: nextStage, at: new Date().toISOString(), note: `Order status moved to ${nextStage}` },
        ],
      });
      res.write(`data: ${JSON.stringify({ type: 'STATUS_UPDATE', order: updatedOrder })}\n\n`);
    } else {
      clearInterval(interval);
    }
  }, 4000);

  req.on('close', () => {
    clearInterval(interval);
  });
});
