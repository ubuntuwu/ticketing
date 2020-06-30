import express, { Request, Response } from 'express';
import { body } from 'express-validator';
import {
  requireAuth,
  validateRequest,
  BadRequestError,
  NotAuthorizedError,
  NotFoundError,
  OrderStatus,
} from '@alexjjtickets/common';
import { stripe } from '../stripe';
import { Order } from '../models/order';
import { Payment } from '../models/payment';
import { PaymentCreatedPublisher } from '../events/publishers/payment-created-publisher';
import { natsWrapper } from '../nats-wrapper';

const router = express.Router();

router.post(
  '/api/payments',
  requireAuth,
  [body('token').not().isEmpty(), body('orderId').not().isEmpty()],
  validateRequest,
  async (req: Request, res: Response) => {
    const { token, orderId } = req.body;

    // 找出訂單
    const order = await Order.findById(orderId);

    if (!order) {
      throw new NotFoundError();
    }

    // 確認這個訂單屬於這個用戶
    if (order.userId !== req.currentUser!.id) {
      throw new NotAuthorizedError();
    }

    // 確保訂單尚未取消
    if (order.status === OrderStatus.Cancelled) {
      throw new BadRequestError('Cannot pay for an cancelled order');
    }

    // Stripe 創建中提供三個不同的選項
    const charge = await stripe.charges.create({
      currency: 'usd',
      amount: order.price * 100, // 轉換成美分
      source: token,
    });

    const payment = Payment.build({
      orderId,
      stripeId: charge.id,
    });
    await payment.save();

    // 發佈付款創建事件
    new PaymentCreatedPublisher(natsWrapper.client).publish({
      id: payment.id,
      orderId: payment.orderId,
      stripeId: payment.stripeId,
    });

    res.status(201).send({ id: payment.id });
  }
);

// 注意要在 nginx config 確保對api付款的請求被定向到/api/payments
export { router as createChargeRouter };
