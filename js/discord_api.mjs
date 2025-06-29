
import { config as dotenv_config } from 'dotenv';

dotenv_config();// load token from environment

var HEADERS = {
    'Authorization': `Bot ${process.env.DISCORD_TOKEN}`,
    'User-Agent': 'DiscordBot (localhost, v1.0a)',
};
const DISCORD_URI = 'https://discord.com/api';
const API_VERSION = 10; // latest tested API version.

const LIST_SERVERS='/users/@me/guilds'
const LIST_CHANNELS='/guilds/{guild_id}/channels'
const POST_MESSAGE='/channels/{channel_id}/messages'


class DiscordApiFailure extends Error {}


function endpointUrl(endpoint) {
    return `${DISCORD_URI}/v${API_VERSION}${endpoint}`;
}

export function setToken(token, type='Bot') {
    HEADERS['Authorization'] = `${type} ${token}`
}

export async function discordAPI(endpoint, payload, type='GET', headers=HEADERS) {
    let options = {
        method: type,
        headers: headers,
    }
    if(payload) options['body'] = JSON.stringify(payload);
    
    console.debug(`Requesting ${endpoint}`);
    const response = await fetch(endpointUrl(endpoint), options);
    if(!response.ok) {
        if(response.status >= 400) {
            throw new DiscordApiFailure(`HTTP error ${response.statusText} (${response.status}): ${await response.text()}`);
        } else {
            throw new Error(`http error ${response.statusText}: ${await response.text()}`);
        }
    }
    
    return response.json()
}

export async function listServers() {
    return await discordAPI(LIST_SERVERS);
}

export async function listChannels(guild_id) {
    const URI = LIST_CHANNELS.replace("{guild_id}", guild_id);
    return await discordAPI(URI);
}

export async function postMessage(channel_id, message) {
    const URI = POST_MESSAGE.replace("{channel_id}", channel_id);
    
    const headers = {'Content-Type': 'application/json'};
    Object.assign(headers, HEADERS);
    
    return await discordAPI(URI, {content: message}, 'POST', headers);
}