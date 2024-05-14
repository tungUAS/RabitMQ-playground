import RabbitMQClient from "./rabbitmq/client";

const startServer = async () => {
  console.log("Server running...");
  const rabbitMQClient = (await RabbitMQClient).initialize();
}

startServer().catch(err => console.error(err));