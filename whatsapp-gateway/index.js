require('dotenv').config();
const express = require('express');
const { Client, LocalAuth } = require('whatsapp-web.js');
const qrcode = require('qrcode-terminal');
const axios = require('axios');
const fs = require('fs');
const path = require('path');

const app = express();
app.use(express.json());

const PORT = process.env.PORT || 3100;
const LARAVEL_INTERNAL_URL = (process.env.LARAVEL_INTERNAL_URL || 'http://127.0.0.1:8000').replace(/\/$/, '');
const WHATSAPP_GATEWAY_SECRET = process.env.WHATSAPP_GATEWAY_SECRET;
const PROVIDER = 'whatsapp-web.js';
const LOG_FILE = path.join(__dirname, 'gateway.log');

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
    qrcode.generate(qr, { small: true });
    log('QR received. Scan the code above.');
});

client.on('ready', () => {
    log('WhatsApp Client is ready.');
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
});

client.on('disconnected', (reason) => {
    log('WhatsApp Client disconnected.', { reason });
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

app.listen(PORT, () => {
    log('WhatsApp Gateway listening.', { port: PORT });
});

client.initialize();
