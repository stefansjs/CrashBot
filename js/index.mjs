import { config as dotenv_config } from 'dotenv';
import { Client, GatewayIntentBits } from 'discord.js';
import Parser from 'rss-parser';
import { read_config } from './config.mjs';
import { listServers, listChannels, postMessage } from './discord_api.mjs';

dotenv_config();
const client = new Client({ intents: [GatewayIntentBits.Guilds, GatewayIntentBits.GuildMessages] });
const parser = new Parser();

let config = read_config();
let lastItem = null;

async function checkFeedAndPost() {
    if(!config.channel_id) { 
        console.warn("There's no channel configured to post messages to. Skipping checking RSS feed");
        return;
    }

    const rssUrl = config['rss_url'];
    try {
        const feed = await parser.parseURL(rssUrl);
        if(!feed) {
            console.debug("Nothing returned from RSS feed at " + rssUrl);
            return;
        }

        console.debug(`reading from ${feed.title}`);
        const latest = feed.items[feed.items.length - 1];

        if(!latest) {
            console.debug(`No recent message from feed ${rssUrl}`);
            return;
        }
        if (lastItem?.isoDate === latest?.isoDate){
            console.debug("No new messages since " + JSON.stringify(latest));
            return;
        }
        
        await postMessage(config.channel_id, `New RSS Item: **${latest.title}**\n${latest.link}`);
        lastItem = latest;// only assign latest to lastItem if we successfully sent the message
    } catch (err) {
        console.error('Error fetching RSS feed:', err);
    }
}


async function setup() {
    const servers = await listServers();
    const channels = await listChannels(servers[0].id);
    console.debug(`ready to post to channel ${JSON.stringify(channels)} on server ${JSON.stringify(servers)}`);
    
    // Update config from retrieved values
    config.all_channels = channels
    config.guild = servers[0];
    
    //set periodic callback
    setInterval(checkFeedAndPost, config.check_interval_ms);
}

await setup();

