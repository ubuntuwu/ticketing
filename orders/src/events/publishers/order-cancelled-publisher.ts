import {
  Subjects,
  Publisher,
  OrderCancelledEvent,
} from '@alexjjtickets/common';

export class OrderCancelledPublisher extends Publisher<OrderCancelledEvent> {
  subject: Subjects.OrderCancelled = Subjects.OrderCancelled;
}
