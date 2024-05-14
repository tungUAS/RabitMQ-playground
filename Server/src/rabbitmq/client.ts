import { Channel, Connection, connect } from "amqplib";
import Consumer from "./consumer";
import Producer from "./producer";
import dotenv from "dotenv";

dotenv.config();

const REQUEST_QUEUE_NAME = "request_queue";

class RabbitMQClient {
  private constructor() {}

  private static instance: RabbitMQClient;
  private isInitalized: boolean = false;

  private producer: Producer;
  private consumer: Consumer;
  private connection: Connection;
  private producerChannel: Channel;
  private consumerChannel: Channel;

  static async getInstance() {
    if (!this.instance) {
      this.instance = new RabbitMQClient();
    }
    return this.instance;
  }

  async initialize() {
    if (this.isInitalized) {
      return;
    }

    try {
      this.connection = await connect(process.env.RABBITMQ_URL as string);
      this.producerChannel = await this.connection.createChannel();
      this.consumerChannel = await this.connection.createChannel();

      // connection goes off, queue will be deleted
      const reply = await this.consumerChannel.assertQueue(REQUEST_QUEUE_NAME, {
        exclusive: true,
      });

      // Extracting queue name from the result
      const requestQueueName = reply.queue;
      this.producer = new Producer(this.producerChannel);
      this.consumer = new Consumer(this.consumerChannel, requestQueueName);

      this.consumer.consumeMessages();

      this.isInitalized = true;
    } catch (err) {
      console.log(err);
    }
  }

  async produce(message: any, correlationId: string, replyTo: string) {
    if (!this.isInitalized) {
      await this.initialize();
    }

    return await this.producer.produceMessages(message, correlationId, replyTo);
  }
}

export default RabbitMQClient.getInstance();
