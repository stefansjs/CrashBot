require('dotenv').config();
const { Client, GatewayIntentBits } = require('discord.js');
const Parser = require('rss-parser');

const client = new Client({ intents: [GatewayIntentBits.Guilds, GatewayIntentBits.GuildMessages] });
const parser = new Parser();

const CHANNEL_ID = process.env.CHANNEL_ID;
const RSS_URL = process.env.RSS_URL;
const FIFTEEN_MINUTES_IN_MS = 15 * 60 * 1000;
let lastItemGuid = null;

async function checkFeedAndPost() {
  try {
    const feed = await parser.parseURL(RSS_URL);
    if (!feed.items.length) return;
    const latest = feed.items[0];
    if (latest.guid !== lastItemGuid) {
      lastItemGuid = latest.guid;
      const channel = await client.channels.fetch(CHANNEL_ID);
      if (channel) {
        await channel.send(`New RSS Item: **${latest.title}**\n${latest.link}`);
      }
    }
  } catch (err) {
    console.error('Error fetching RSS feed:', err);
  }
}

client.once('ready', () => {
  console.log(`Logged in as ${client.user.tag}`);
  setInterval(checkFeedAndPost, FIFTEEN_MINUTES_IN_MS); // Check every 5 minutes
});

client.login(process.env.DISCORD_TOKEN);
