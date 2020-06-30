import Stripe from 'stripe';

// 第一個參數為API密鑰, 第二個參數為API版本
export const stripe = new Stripe(process.env.STRIPE_KEY!, {
  apiVersion: '2020-03-02',
});
