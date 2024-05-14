import { Channel, Connection, connect } from "amqplib";
import Consumer from "./consumer";
import Producer from "./producer";
import dotenv from "dotenv";
import { EventEmitter } from "events";

dotenv.config();

const REPLY_QUEUE_NAME = "reply_queue";

class RabbitMQClient {
  private constructor() {}

  private static instance: RabbitMQClient;
  private isInitalized: boolean = false;

  private producer: Producer;
  private consumer: Consumer;
  private connection: Connection;
  private producerChannel: Channel;
  private consumerChannel: Channel;

  private eventEmitter: EventEmitter;

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
      const reply = await this.consumerChannel.assertQueue(REPLY_QUEUE_NAME, {
        exclusive: true,
      });

      this.eventEmitter = new EventEmitter();

      // Extracting queue name from the result
      const replyQueueName = reply.queue;
      this.producer = new Producer(this.producerChannel, replyQueueName, this.eventEmitter );
      this.consumer = new Consumer(this.consumerChannel, replyQueueName, this.eventEmitter );

      this.consumer.consumeMessages();

      this.isInitalized = true;
    } catch (err) {
      console.log(err);
    }
  }

  async produce(message: any) {
    if (!this.isInitalized) {
      await this.initialize();
    }

    return await this.producer.produceMessages(message);
  }
}

export default RabbitMQClient.getInstance();
