import { Publisher, OrderCreatedEvent, Subjects } from '@alexjjtickets/common';

export class OrderCreatedPublisher extends Publisher<OrderCreatedEvent> {
  subject: Subjects.OrderCreated = Subjects.OrderCreated;
}
