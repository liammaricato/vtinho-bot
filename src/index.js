import { Client, Events, GatewayIntentBits } from 'discord.js';
import { messages } from './messages.js';

const token = process.env.DISCORD_TOKEN;
if (!token) {
  console.error('Missing DISCORD_TOKEN environment variable.');
  process.exit(1);
}

const client = new Client({
  intents: [GatewayIntentBits.Guilds, GatewayIntentBits.GuildMessages],
});

client.once(Events.ClientReady, (readyClient) => {
  console.log(`Logged in as ${readyClient.user.tag}`);
});

client.on(Events.MessageCreate, async (message) => {
  if (message.author.bot) return;

  // Only react to direct @mentions, not @everyone/@here or role pings.
  const mentioned = message.mentions.has(client.user, {
    ignoreEveryone: true,
    ignoreRoles: true,
  });
  if (!mentioned) return;

  const reply = messages[Math.floor(Math.random() * messages.length)];
  try {
    await message.reply(reply);
  } catch (error) {
    console.error('Failed to send reply:', error);
  }
});

// Docker sends SIGTERM on stop; disconnect cleanly so the bot goes offline right away.
for (const signal of ['SIGINT', 'SIGTERM']) {
  process.on(signal, async () => {
    await client.destroy();
    process.exit(0);
  });
}

client.login(token);
