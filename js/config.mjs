import { readFileSync } from 'fs';
import { parse } from 'toml';
import Ajv from 'ajv';

export function read_config() {
    const configPath = 'config/config.toml';
    const schemaPath = 'config/config.schema.toml';

    try {
        console.debug("Loading config from " + configPath);
        const config = validate_config(read_toml(configPath), read_toml(schemaPath));
        let config_data = {
            rss_url: config.sign_rss_feed,
            channel_id: config.channel_id,
            check_interval_ms: (config?.check_interval_minutes || 1) * 60 * 1000,
        };
        if(config?.check_interval_ms) config_data['check_interval_ms'] = config.check_interval_ms;
        
        return config_data;
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
