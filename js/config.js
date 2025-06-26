import { readFileSync } from 'fs';
import { parse } from 'toml';

function read_config() {
    try {
        const configText = readFileSync('config/config.toml', 'utf-8');
        const config = parse(configText).crashbot || {};
        return {
            rss_url: config?.sign_rss_feed,
            channel_id: config?.channel_id,
            check_interval_ms: config?.check_interval_minutes * 60 * 1000,
        };
    } catch (err) {
        console.error('Error reading config.toml:', err);
        return { rss_url: '', channel_id: '' };
    }
}

export default { read_config };
