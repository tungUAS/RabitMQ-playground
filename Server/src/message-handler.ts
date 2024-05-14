import rabbitClient from "./rabbitmq/client";

export default class MessageHandler {
  static async handle(
    data: any,
    correlationId: string,
    replyTo: string
  ) {
    const { num1, num2 } = data;
    const response = num1 * num2;
    console.log("The response in messagehandler is ...", response );
    await (await rabbitClient).produce(response.toString(), correlationId, replyTo);
  }
}