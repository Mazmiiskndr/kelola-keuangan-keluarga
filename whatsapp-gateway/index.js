require('dotenv').config();
const express = require('express');
const { Client, LocalAuth } = require('whatsapp-web.js');
const qrcode = require('qrcode');
const axios = require('axios');
const fs = require('fs');
const path = require('path');

const app = express();
app.use(express.json());

process.on('unhandledRejection', (reason, promise) => {
    console.error('Unhandled Rejection at:', promise, 'reason:', reason);
    // Prevent the gateway from crashing on Windows EBUSY errors during logout
});

const PORT = process.env.PORT || 3100;
const LARAVEL_INTERNAL_URL = (process.env.LARAVEL_INTERNAL_URL || 'http://127.0.0.1:8000').replace(/\/$/, '');
const WHATSAPP_GATEWAY_SECRET = process.env.WHATSAPP_GATEWAY_SECRET;
const PROVIDER = 'whatsapp-web.js';
const LOG_FILE = path.join(__dirname, 'gateway.log');

let connectionState = 'starting';
let currentQrDataUrl = null;
let connectedPhone = null;
let lastUpdateTime = new Date().toISOString();

function updateState(newState, qrDataUrl = null, phone = null) {
    connectionState = newState;
    currentQrDataUrl = qrDataUrl;
    if (phone) connectedPhone = phone;
    lastUpdateTime = new Date().toISOString();
}
if (!WHATSAPP_GATEWAY_SECRET) {
    console.error('Missing WHATSAPP_GATEWAY_SECRET. Set it in whatsapp-gateway/.env before starting the gateway.');
    process.exit(1);
}

function authorized(req) {
    return req.headers.authorization === `Bearer ${WHATSAPP_GATEWAY_SECRET}`;
}

function normalizePhone(phone) {
    const digits = String(phone || '').replace(/\D/g, '');

    if (digits.startsWith('0')) {
        return `62${digits.slice(1)}`;
    }

    return digits;
}

function chatIdFor(phoneOrChatId) {
    const value = String(phoneOrChatId || '').trim();

    if (value.includes('@')) {
        return value;
    }

    return `${normalizePhone(value)}@c.us`;
}

function log(message, context = {}) {
    const line = JSON.stringify({
        time: new Date().toISOString(),
        message,
        ...context
    });

    console.log(line);
    fs.appendFileSync(LOG_FILE, `${line}\n`);
}

const client = new Client({
    authStrategy: new LocalAuth(),
    puppeteer: {
        args: ['--no-sandbox', '--disable-setuid-sandbox']
    }
});

client.on('qr', (qr) => {
    qrcode.toDataURL(qr, (err, url) => {
        if (!err) {
            updateState('qr', url);
            log('QR received. Check the UI to scan.');
        } else {
            log('Error generating QR code data URL', { error: err.message });
        }
    });
});

client.on('ready', () => {
    log('WhatsApp Client is ready.');
    try {
        const phone = client.info?.wid?.user;
        updateState('ready', null, phone);
    } catch (e) {
        updateState('ready');
    }
});

client.on('message', async (msg) => {
    // Only process private chats, ignore group messages and statuses
    if (msg.from.includes('@g.us') || msg.isStatus) {
        log('Ignored non-private message.', { from: msg.from, isStatus: msg.isStatus });
        return;
    }

    let contactNumber = '';
    let contactId = '';

    try {
        const contact = await msg.getContact();
        contactNumber = contact.number ? normalizePhone(contact.number) : '';
        contactId = contact.id?._serialized || '';
    } catch (error) {
        log('Could not resolve WhatsApp contact.', {
            from: msg.from,
            error: error.message
        });
    }

    const lookupPhone = contactNumber || normalizePhone(msg.from);

    log('Incoming private message.', {
        from: msg.from,
        from_phone: lookupPhone,
        contact_id: contactId,
        message_id: msg.id._serialized,
        body: msg.body
    });

    // Forward the message to Laravel
    try {
        const response = await axios.post(`${LARAVEL_INTERNAL_URL}/api/internal/whatsapp/messages`, {
            from: msg.from,
            reply_to: msg.from,
            from_phone: lookupPhone,
            body: msg.body,
            message_id: msg.id._serialized,
            timestamp: msg.timestamp,
            provider: PROVIDER
        }, {
            headers: {
                'Authorization': `Bearer ${WHATSAPP_GATEWAY_SECRET}`,
                'Content-Type': 'application/json'
            }
        });

        log('Forwarded message to Laravel.', {
            message_id: msg.id._serialized,
            from: msg.from,
            from_phone: lookupPhone
        });

        const replies = Array.isArray(response.data?.replies) ? response.data.replies : [];
        if (replies.length > 0) {
            const chat = await msg.getChat();

            for (const reply of replies) {
                if (!reply?.message) {
                    continue;
                }

                await chat.sendMessage(reply.message);
                log('Sent inbound chat reply.', {
                    message_id: msg.id._serialized,
                    to: msg.from
                });
            }
        }
    } catch (error) {
        const response = error.response ? ` (${error.response.status}) ${JSON.stringify(error.response.data)}` : '';
        log('Error forwarding message to Laravel.', {
            error: `${error.message}${response}`,
            message_id: msg.id._serialized,
            from: msg.from,
            from_phone: lookupPhone
        });
    }
});

client.on('auth_failure', (message) => {
    log('WhatsApp authentication failed.', { error: message });
    updateState('auth_failure');
});

client.on('disconnected', (reason) => {
    log('WhatsApp Client disconnected.', { reason });
    updateState('disconnected');
});

// Endpoint for Laravel to send a message
app.post('/send-message', async (req, res) => {
    if (!authorized(req)) {
        return res.status(401).json({ error: 'Unauthorized' });
    }

    const { phone, message } = req.body;
    if (!phone || !message) {
        return res.status(400).json({ error: 'Missing phone or message' });
    }

    try {
        const chatId = chatIdFor(phone);
        await client.sendMessage(chatId, message);
        log('Sent outbound message.', { to: chatId });
        res.json({ success: true });
    } catch (error) {
        log('Error sending outbound message.', { phone, error: error.message });
        res.status(500).json({ error: error.message });
    }
});

app.get('/', (req, res) => {
    res.type('text/plain').send([
        'WhatsApp Gateway is running.',
        `Provider: ${PROVIDER}`,
        `Laravel: ${LARAVEL_INTERNAL_URL}`,
        '',
        'Use GET /health with the Authorization bearer token for authenticated health checks.'
    ].join('\n'));
});

app.get('/health', (req, res) => {
    if (!authorized(req)) {
        return res.status(401).json({ error: 'Unauthorized' });
    }

    res.json({
        ok: true,
        provider: PROVIDER,
        laravel: LARAVEL_INTERNAL_URL
    });
});

app.get('/status', (req, res) => {
    if (!authorized(req)) {
        return res.status(401).json({ error: 'Unauthorized' });
    }

    res.json({
        ok: true,
        provider: PROVIDER,
        state: connectionState,
        qr_data_url: currentQrDataUrl,
        phone: connectedPhone,
        message: null,
        updated_at: lastUpdateTime
    });
});

app.post('/logout', async (req, res) => {
    if (!authorized(req)) {
        return res.status(401).json({ error: 'Unauthorized' });
    }

    log('Triggered client logout via API.');
    updateState('logged_out');

    try {
        // We reply immediately to prevent the request from hanging
        res.json({ success: true });

        try {
            await client.logout();
        } catch (e) {
            log('Error during client.logout()', { error: e.message });
        }

        // Wait a bit for WhatsApp Web to actually process the logout
        setTimeout(async () => {
            try {
                await client.destroy();
            } catch (e) {
                log('Error during client.destroy()', { error: e.message });
            }

            // Manually clear the auth directory just in case it failed due to EBUSY
            setTimeout(() => {
                try {
                    const authDir = path.join(__dirname, '.wwebjs_auth');
                    if (fs.existsSync(authDir)) {
                        fs.rmSync(authDir, { recursive: true, force: true });
                        log('Cleared .wwebjs_auth directory.');
                    }
                } catch (e) {
                    log('Could not clear auth directory.', { error: e.message });
                }

                log('Re-initializing client after logout.');
                client.initialize();
                updateState('starting');
            }, 2000);
        }, 2000);

    } catch (error) {
        log('Unexpected error in logout handler', { error: error.message });
    }
});

app.post('/restart', async (req, res) => {
    if (!authorized(req)) {
        return res.status(401).json({ error: 'Unauthorized' });
    }

    log('Triggered client restart via API.');
    updateState('starting');

    try {
        await client.destroy();
        client.initialize();
        res.json({ success: true });
    } catch (error) {
        log('Error during restart', { error: error.message });
        res.status(500).json({ error: error.message });
    }
});

app.listen(PORT, () => {
    log('WhatsApp Gateway listening.', { port: PORT });
});

client.initialize();
