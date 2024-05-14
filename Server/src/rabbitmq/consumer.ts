import { Channel, ConsumeMessage } from "amqplib";
import MessageHandler from "../message-handler";

export default class Consumer {
  constructor(private channel: Channel, private requestQueueName: string) {}

  async consumeMessages() {
    console.log("Ready to consume messages...");

    this.channel.consume(
      this.requestQueueName,
      async (message: ConsumeMessage | null) => {
        const { correlationId, replyTo } = message?.properties;
        if (!correlationId || !replyTo) {
          console.log("missing message properties..");
        }
        console.log("Received message from request queue...", message?.content.toString());
        await MessageHandler.handle(
          JSON.parse(message.content.toString()),
          correlationId,
          replyTo
        );
      },
      {
        noAck: true,
      }
    );
  }
}
