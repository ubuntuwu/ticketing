import { Publisher, Subjects, TicketCreatedEvent } from '@alexjjtickets/common';

// 將發出一個轉到該 nats streaming server 的事件
export class TicketCreatedPublisher extends Publisher<TicketCreatedEvent> {
  subject: Subjects.TicketCreated = Subjects.TicketCreated;
}
