import { Client, Events, GatewayIntentBits } from "discord.js";
import dotenv from "dotenv";

dotenv.config();

type Command = {
  name: string;
  execute: (message: any) => Promise<void>;
};

const commands = new Map<string, Command>([
  [
    "pin",
    {
      name: "pin",
      execute: async (message) => {
        const referencedMessage = await message.channel.messages.fetch(
          message.reference.messageId,
        );
        if (!referencedMessage.pinned) {
          await referencedMessage.pin();
        }
      },
    },
  ],
  [
    "unpin",
    {
      name: "unpin",
      execute: async (message) => {
        const referencedMessage = await message.channel.messages.fetch(
          message.reference.messageId,
        );
        if (referencedMessage.pinned) {
          await referencedMessage.unpin();
        }
      },
    },
  ],
]);

const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMembers,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.GuildMessageReactions,
    GatewayIntentBits.MessageContent,
  ],
});

client.once(Events.ClientReady, () => console.log("Ready!"));

client.on(Events.MessageCreate, async (message) => {
  if (
    message.author.bot ||
    !message.mentions.has(client.user!.id) ||
    !message.reference
  )
    return;

  const commandName = message.content
    .toLowerCase()
    .split(" ")
    .find((word) => commands.has(word));
  if (!commandName) return;

  try {
    await commands.get(commandName)!.execute(message);
  } catch (error) {
    console.error("Error:", error);
  }
});

client.login(process.env.DISCORD_TOKEN);
