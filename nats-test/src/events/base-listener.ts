import { Message, Stan } from 'node-nats-streaming';
import { Subjects } from './subjects';

interface Event {
  subject: Subjects;
  data: any;
}

export abstract class Listener<T extends Event> {
  abstract subject: T['subject'];
  abstract queueGroupName: string;
  abstract onMessage(data: T['data'], msg: Message): void;
  // Nats client屬性是對預初始化的引用(即已經成功連接到Nats)
  private client: Stan;
  // 確認等待5秒
  protected ackWait = 5 * 1000;

  // 確保構造函數收到 client
  constructor(client: Stan) {
    this.client = client;
  }

  subscriptionOptions() {
    return (
      this.client
        .subscriptionOptions()
        // 可以獲得過去發出的所有事件
        .setDeliverAllAvailable()
        // 啟動手動操作模式設置
        .setManualAckMode(true)
        // 設置等待秒數(預設為30秒), 將一些信息保存到數據庫中, 若30秒後沒收到回應會再轉發一次信息
        .setAckWait(this.ackWait)
        // 跟蹤已發生的所有不同事件
        .setDurableName(this.queueGroupName)
    );
  }

  // 設置訂閱
  listen() {
    const subscription = this.client.subscribe(
      this.subject,
      this.queueGroupName,
      this.subscriptionOptions()
    );

    // 監聽
    subscription.on('message', (msg: Message) => {
      console.log(`Message received: ${this.subject} / ${this.queueGroupName}`);

      const parsedData = this.parseMessage(msg);
      // 最終調用onMessage,當收到信息後該做什麼
      this.onMessage(parsedData, msg);
    });
  }
  // 當收到傳入信息時我們將使用 parseMessage 方式傳遞信息
  parseMessage(msg: Message) {
    const data = msg.getData();
    return typeof data === 'string'
      ? JSON.parse(data)
      : JSON.parse(data.toString('utf8'));
  }
}
