import { Channel, ConsumeMessage } from "amqplib";
import { randomUUID } from "crypto";
import { EventEmitter } from "events";

const REQUEST_QUEUE_NAME = "request_queue";

export default class Producer {
  constructor(
    private channel: Channel,
    private replyQueueName: string,
    private eventEmitter: EventEmitter
  ) {}

  async produceMessages(message: any) {
    const uuid = randomUUID();
    console.log("the correlation id is ...", uuid);
    this.channel.sendToQueue(
      REQUEST_QUEUE_NAME,
      Buffer.from(JSON.stringify(message)),
      {
        replyTo: this.replyQueueName,
        correlationId: uuid,
      }
    );

    return new Promise((resolve, reject) => {
      this.eventEmitter.once(uuid, async (data) => {
        const reply = JSON.parse(data.content);
        resolve(reply);
      });
    });
  }
}
