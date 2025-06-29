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
        console.debug(`reading from ${rssUrl}`);
        const feed = await parser.parseURL(rssUrl);

        if(!feed?.items) {
            console.debug("Nothing returned from RSS feed at " + rssUrl);
            return;
        }
        
        const latest = feed.items[feed.items.length - 1];
        
        if (lastItem?.isoDate === latest?.isoDate){
            console.debug("No new messages since " + latest.isoDate);
            return;
        }
        
        const message = buildDiscordMessage(lastItem, latest);
        if(message) {
            await postMessage(config.channel_id, message);
            lastItem = latest;// only assign latest to lastItem if we successfully sent the message
        } else {
            console.debug("No message. Not posting to discord");
        }
    } catch (err) {
        console.error('Error fetching RSS feed:', err);
    }
}

function buildDiscordMessage(previousMessage, currentMessage) {
    const closedTime = getClosingTime(currentMessage);
    const isClosed = Date.now() >= closedTime;

    if (isClosed) {
        // If the last "opened" message came long enough ago, say that we're currently closed
        return `The space closed at ${closedTime.toLocaleString("en-US", {timeZoneName: "short"})}`;
    } else if(getClosingTime(previousMessage) >= Date(currentMessage.isoDate)) {
        // If the current message was sent before the previous message's close, don't re-post about how the space is open
        return null;
    } else {
        // otherwise, let the caller decide if we should post this "open" message
        return `**${latest.title}**\nSomeone opened the space at ${currentMessage.pubDate}. The space will be open for at least 1 hour. Check ${currentMessage.link} for the current status`;
    }
}

function getClosingTime(rssMessage) {
    const messageTime = Date.parse(rssMessage.isoDate);
    
    var hoursOffset = 1;
    if(rssMessage.contentSnippet === "crashbutton1 - update - 60mins.") {
        hoursOffset = 1;
    }

    const closedTime = new Date(messageTime + hourseToMillis(hoursOffset));
    return closedTime;
}
function hourseToMillis(hours) {
    return hours * 60 * 60 * 1000;
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
    // call the callback immediately. apparently setInterval waits first
    checkFeedAndPost();
}

await setup();

