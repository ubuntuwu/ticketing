import { useEffect, useState } from 'react';
import StripeCheckout from 'react-stripe-checkout';
import Router from 'next/router';
import useRequest from '../../hooks/use-request';

// 主要目標是向用戶提供一個可以付款的按鍵
const OrderShow = ({ order, currentUser }) => {
  const [timeLeft, setTimeLeft] = useState(0);
  const { doRequest, errors } = useRequest({
    url: '/api/payments',
    method: 'post',
    body: {
      orderId: order.id,
    },
    onSuccess: () => Router.push('/orders'),
  });

  useEffect(() => {
    // 倒數計時
    const findTimeLeft = () => {
      const msLeft = new Date(order.expiresAt) - new Date();
      setTimeLeft(Math.round(msLeft / 1000));
    };

    findTimeLeft();
    const timerId = setInterval(findTimeLeft, 1000);

    // call [order] 來停止計時
    return () => {
      clearInterval(timerId);
    };
  }, [order]);

  if (timeLeft < 0) {
    return <div>Order Expired</div>;
  }

  return (
    <div>
      Time left to pay: {timeLeft} seconds
      {/* 付款彈出視窗  */}
      <StripeCheckout
        // 這個 token id 需要發送給我們的 payment api
        token={({ id }) => doRequest({ token: id })}
        // Publishable key
        stripeKey="pk_test_51Gy8mkIxKMJRaxmFeaPUzgDITXe5k6pcJgfEfOHytG9SGZTgyqb1dZbJyULLoWFn15xZywSdcJ1Su1g7Y4fLTWRX00na4AtsSK"
        // Stripe 是收美分
        amount={order.ticket.price * 100}
        email={currentUser.email}
      />
      {errors}
    </div>
  );
};

OrderShow.getInitialProps = async (context, client) => {
  const { orderId } = context.query;
  const { data } = await client.get(`/api/orders/${orderId}`);

  return { order: data };
};

export default OrderShow;
