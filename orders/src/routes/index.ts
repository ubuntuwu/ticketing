import express, { Request, Response } from 'express';
import { requireAuth } from '@alexjjtickets/common';
import { Order } from '../models/order';

const router = express.Router();

router.get('/api/orders', requireAuth, async (req: Request, res: Response) => {
  const orders = await Order.find({
    userId: req.currentUser!.id,
    // 很多場景都需要通過外間與另一張表建立關聯, populate可以很方便地實現
  }).populate('ticket');

  res.send(orders);
});

export { router as indexOrderRouter };
