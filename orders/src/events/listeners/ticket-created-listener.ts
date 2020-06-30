import { Message } from 'node-nats-streaming';
import { Subjects, Listener, TicketCreatedEvent } from '@alexjjtickets/common';
import { Ticket } from '../../models/ticket';
import { queueGroupName } from './queue-group-name';

export class TicketCreatedListener extends Listener<TicketCreatedEvent> {
  subject: Subjects.TicketCreated = Subjects.TicketCreated;
  queueGroupName = queueGroupName;

  // data是事件內部的數據, msg是Nats Streaming的註釋信息
  async onMessage(data: TicketCreatedEvent['data'], msg: Message) {
    const { id, title, price } = data;

    const ticket = Ticket.build({
      // 要注意從tickets傳到order的id並不相同,所以要修改tickets model
      id,
      title,
      price,
    });
    await ticket.save();

    // 事件已經成功處理了
    msg.ack();
  }
}
