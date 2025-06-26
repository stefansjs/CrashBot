import { config as dotenv_config } from 'dotenv';
import { Client, GatewayIntentBits } from 'discord.js';
import Parser from 'rss-parser';
import { read_config } from './config.mjs';

dotenv_config();
const client = new Client({ intents: [GatewayIntentBits.Guilds, GatewayIntentBits.GuildMessages] });
const parser = new Parser();

let config = read_config();
let lastItemGuid = null;

async function checkFeedAndPost() {
    const rssUrl = config['rss_url'];
    try {
        const feed = await parser.parseURL(rssUrl);
        if (!feed.items.length) return;
        const latest = feed.items[0];
        if (latest.guid !== lastItemGuid) {
            lastItemGuid = latest.guid;
            const channel = await client.channels.fetch(config.channel_id);
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
    config = read_config();
    setInterval(checkFeedAndPost, config.check_interval_ms || 15 * 60 * 1000);
});

client.login(process.env.DISCORD_TOKEN);
