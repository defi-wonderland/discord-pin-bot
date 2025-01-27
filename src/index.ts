import { 
  Client, 
  Events, 
  GatewayIntentBits, 
  REST, 
  Routes, 
  ApplicationCommandType, 
  ContextMenuCommandBuilder,
  MessageContextMenuCommandInteraction,
  TextChannel,
  ThreadChannel
} from "discord.js";
import dotenv from "dotenv";

// Load environment variables
dotenv.config();

// Initialize Discord client with required intents
const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.MessageContent
  ],
});

// Define the context menu commands
const contextCommands = [
  new ContextMenuCommandBuilder()
    .setName('Pin Message')
    .setType(ApplicationCommandType.Message),
  new ContextMenuCommandBuilder()
    .setName('Unpin Message')
    .setType(ApplicationCommandType.Message)
];

// Initialize REST API handler with bot token
const rest = new REST().setToken(process.env.DISCORD_TOKEN!);

/**
 * Sends a notification about pin/unpin action
 */
async function sendNotification(
  interaction: MessageContextMenuCommandInteraction,
  isPinning: boolean
) {
  const channel = interaction.channel;
  
  // Check if the channel is a text channel or thread where we can send messages
  if (!(channel instanceof TextChannel || channel instanceof ThreadChannel)) return;

  const notification = `📌 <@${interaction.user.id}> ${isPinning ? 'pinned' : 'unpinned'} a [message](${interaction.targetMessage.url})`;

  try {
    await channel.send({
      content: notification,
      allowedMentions: { users: [] } // Prevents the @ from pinging
    });
  } catch (error) {
    console.error('Failed to send notification:', error);
  }
}

/**
 * Handles pin/unpin operations and responds to the user
 */
async function handlePinOperation(
  interaction: MessageContextMenuCommandInteraction, 
  shouldPin: boolean
) {
  const targetMessage = interaction.targetMessage;
  const isPinned = targetMessage.pinned;
  const action = shouldPin ? 'pin' : 'unpin';

  try {
    // Check if the message is already in the desired state
    if (shouldPin === isPinned) {
      await interaction.reply({ 
        content: `Message is already ${action}ned!`,
        ephemeral: true 
      });
      return;
    }

    // Perform pin/unpin operation
    await (shouldPin ? targetMessage.pin() : targetMessage.unpin());
    
    // Send ephemeral confirmation to the user who triggered the command
    await interaction.reply({ 
      content: `Message ${action}ned!`,
      ephemeral: true 
    });

    // Send public notification
    await sendNotification(interaction, shouldPin);

  } catch (error) {
    console.error(`Error during ${action} operation:`, error);
    await interaction.reply({ 
      content: `Failed to ${action} message. Please check bot permissions.`,
      ephemeral: true 
    });
  }
}

// Register commands when bot starts
client.once(Events.ClientReady, async (readyClient) => {
  try {
    console.log(`Starting bot as ${readyClient.user.tag}`);
    
    // Register the context menu commands globally
    await rest.put(
      Routes.applicationCommands(readyClient.user.id),
      { body: contextCommands }
    );
    
    console.log('Successfully registered context menu commands');
  } catch (error) {
    console.error('Failed to register commands:', error);
  }
});

// Handle context menu interactions
client.on(Events.InteractionCreate, async (interaction) => {
  if (!interaction.isMessageContextMenuCommand()) return;

  switch (interaction.commandName) {
    case 'Pin Message':
      await handlePinOperation(interaction, true);
      break;
    case 'Unpin Message':
      await handlePinOperation(interaction, false);
      break;
    default:
      console.warn(`Unknown command: ${interaction.commandName}`);
  }
});

// Handle errors gracefully
client.on(Events.Error, error => {
  console.error('Discord client error:', error);
});

// Start the bot
client.login(process.env.DISCORD_TOKEN)
  .catch(error => {
    console.error('Failed to start bot:', error);
    process.exit(1);
  });