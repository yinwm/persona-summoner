import { PostHog } from 'posthog-node';
import { v4 as uuidv4 } from 'uuid';
import * as fs from 'fs';
import * as path from 'path';
import * as os from 'os';
import 'dotenv/config';
import { DEFAULT_POSTHOG_API_KEY } from './telemetry-key.js';

// TODO: 请在此处填写您的 PostHog 项目 API Key 和 Host
const POSTHOG_API_KEY = process.env.POSTHOG_API_KEY || DEFAULT_POSTHOG_API_KEY;
const POSTHOG_HOST = process.env.POSTHOG_HOST || 'https://us.i.posthog.com';

const CONFIG_DIR = process.env.XDG_CONFIG_HOME || path.join(os.homedir(), '.config', 'persona-summoner');
const CONFIG_FILE = path.join(CONFIG_DIR, 'config.json');

interface TelemetryConfig {
    distinctId: string;
    telemetryEnabled: boolean;
}

let posthogClient: PostHog | null = null;
const state = {
    enabled: false,
    distinctId: '',
    initialized: false,
};

function getOrCreateDistinctId(): string {
    try {
        if (!fs.existsSync(CONFIG_DIR)) {
            fs.mkdirSync(CONFIG_DIR, { recursive: true });
        }
        if (fs.existsSync(CONFIG_FILE)) {
            const configStr = fs.readFileSync(CONFIG_FILE, 'utf-8');
            const config = JSON.parse(configStr) as TelemetryConfig;
            if (config.distinctId) {
                return config.distinctId;
            }
        }
        const newConfig: TelemetryConfig = {
            distinctId: uuidv4(),
            telemetryEnabled: true,
        };
        fs.writeFileSync(CONFIG_FILE, JSON.stringify(newConfig, null, 2));
        return newConfig.distinctId;
    } catch (error) {
        console.error('Error managing telemetry config:', error);
        return uuidv4();
    }
}

export function init(options: { forceDisable?: boolean } = {}): void {
    if (state.initialized) return;
    if (process.env.MCP_TELEMETRY_DISABLED === '1' || options.forceDisable || !POSTHOG_API_KEY) {
        state.enabled = false;
        state.initialized = true;
        return;
    }
    state.distinctId = getOrCreateDistinctId();
    state.enabled = true;
    state.initialized = true;
    posthogClient = new PostHog(POSTHOG_API_KEY, {
        host: POSTHOG_HOST,
        flushAt: 1,
        flushInterval: 0,
    });
}

export function trackEvent(eventName: string, properties: Record<string, any> = {}): void {
    if (!state.enabled || !posthogClient) return;
    posthogClient.capture({
        distinctId: state.distinctId,
        event: eventName,
        properties: {
            node_version: process.version,
            platform: os.platform(),
            arch: os.arch(),
            ...properties,
        },
    });
}

export async function shutdown(): Promise<void> {
    if (state.enabled && posthogClient) {
        await posthogClient.shutdown();
    }
} 