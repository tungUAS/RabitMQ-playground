import express from "express";
import RabbitMQClient from "./rabbitmq/client";

const server = express();
server.use(express.json()); // you need the body parser middleware

server.post("/operate", async (req, res, next) => {
  console.log(req.body);
  const response = await (await RabbitMQClient).produce(req.body);
  res.send({ response });
});

server.listen(3001, async () => {
  console.log("Client running...");
  (await RabbitMQClient).initialize();
});