import "dotenv";
config();

if (process.env.APP_PUBLIC_KEY === undefined)
  throw new Error("Public key needs to be defined in .env!");

import { InteractionResponseFlags, InteractionResponseType, InteractionType, verifyKeyMiddleware } from 'discord-interactions';
import express, { type Express, type Request, type Response } from 'express';
import { config } from "dotenv";
import { spawn } from "child_process";

const PORT = process.env.PORT ?? 3000;

const app: Express = express();

app.post('/interaction',
  verifyKeyMiddleware(process.env.APP_PUBLIC_KEY),
  (request: Request, response: Response) => {
    try {
      const interaction = request.body;
      switch (interaction.type) {
        case InteractionType.PING:
          response.status(200).json({
            type: 1
          });
          break;
        case InteractionType.APPLICATION_COMMAND:
          handleApplicationCommand(interaction, response);
          break;
      }
    } catch (error) {
      response.status(500);
    }
  });

app.get("/health", (request: Request, response: Response) => {
  response.send("All is good!");
});

app.listen(PORT, () => {
  console.log(`Listening on port: ${PORT}`);
});

function handleApplicationCommand(interaction: any, response: Response): void {
  const data = interaction.data;

  var message = "Something went wrong!";
  switch (data.name) {
    case "start":
      message = "Starting server...";
      spawn("sh", ["-c", "start.sh"]);
      break;
    case "stop":
      message = "Stopping server...";
      spawn("sh", ["-c", "stop.sh"]);
      break;
  }
  response.json({
    type: InteractionResponseType.CHANNEL_MESSAGE_WITH_SOURCE,
    data: {
      // ephemeral because the discord bridge should send when it actually
      // starts/stops
      flags: InteractionResponseFlags.EPHEMERAL,
      content: message,
    }
  });
}
