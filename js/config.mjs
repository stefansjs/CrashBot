import { readFileSync } from 'fs';
import { parse } from 'toml';
import Ajv from 'ajv';

export function read_config() {
    try {
        const config = validate_config(read_toml('config/config.toml'), read_toml('config/config.schema.toml'));
        return {
            rss_url: config.sign_rss_feed,
            channel_id: config.channel_id,
            check_interval_ms: config?.check_interval_minutes * 60 * 1000,
        };
    } catch (err) {
        console.error('Error reading config.toml:', err);
        return { rss_url: '', channel_id: '' };
    }
}

function validate_config(data, schema) {
    const ajv = new Ajv();
    const validate = ajv.compile(schema);
    const valid = validate(data);
    if(!valid) {
        throw new Error('Invalid configuration: ' + JSON.stringify(validate.errors));
    }

    return data.crashbot;
}

function read_toml(path) {
    const configText = readFileSync(path, 'utf-8');
    const config = parse(configText);
    return config;
}
