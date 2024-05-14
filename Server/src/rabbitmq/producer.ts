import { Channel } from "amqplib";

export default class Producer {
  constructor(private channel: Channel) {}

  async produceMessages(
    message: any,
    correlationIdFromRequestQueue: string,
    replyToQueue: string
  ) {
    this.channel.sendToQueue(
      replyToQueue,
      Buffer.from(JSON.stringify(message)),
      {
        correlationId: correlationIdFromRequestQueue,
      }
    );
  }
}
