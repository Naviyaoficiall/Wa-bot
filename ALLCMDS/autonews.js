const { cmd } = require('../command');
const axios = require('axios');
const cheerio = require('cheerio');
const cron = require('node-cron');

// Store active subscriptions
const activeSubscriptions = new Map();

cmd({
    pattern: "news",
    desc: "Get latest Sinhala news updates",
    category: "news",
    react: "📰",
    filename: __filename,
}, async (conn, message, m, { args, reply }) => {
    try {
        // First, send reaction to show command is received
        await conn.sendMessage(message.key.remoteJid, { react: { text: "📰", key: message.key }});

        if (!args[0]) {
            return await reply(`*📰 Sinhala News Command*\n\n` +
                `🔸 To start: .news start\n` +
                `🔸 To stop: .news stop\n` +
                `🔸 Test news: .news test\n\n` +
                `Updates every 2 minutes.`);
        }

        const command = args[0].toLowerCase();
        const groupJid = message.key.remoteJid;

        switch (command) {
            case 'start':
                // Check if it's a group
                if (!groupJid.endsWith('@g.us')) {
                    return await reply('❌ Groups only!');
                }

                // Check if already active
                if (activeSubscriptions.has(groupJid)) {
                    return await reply('📰 Already active in this group!');
                }

                try {
                    // Test fetch news first
                    await testNewsFunction(conn, groupJid);

                    // If test successful, setup cron
                    const schedule = cron.schedule('*/2 * * * *', async () => {
                        await testNewsFunction(conn, groupJid);
                    });

                    activeSubscriptions.set(groupJid, schedule);
                    await reply('✅ News updates started! Testing first news...');

                } catch (err) {
                    console.error('Start error:', err);
                    await reply('❌ Error starting news: ' + err.message);
                }
                break;

            case 'stop':
                const schedule = activeSubscriptions.get(groupJid);
                if (!schedule) {
                    return await reply('❌ No active news in this group!');
                }
                schedule.stop();
                activeSubscriptions.delete(groupJid);
                await reply('🛑 News updates stopped.');
                break;

            case 'test':
                await reply('🔄 Testing news fetch...');
                await testNewsFunction(conn, groupJid);
                break;

            default:
                await reply('❌ Invalid command! Use start/stop/test');
        }

    } catch (error) {
        console.error('Main command error:', error);
        await reply('⚠️ Error: ' + error.message);
    }
});

async function testNewsFunction(conn, groupJid) {
    try {
        // Test message to confirm function is running
        await conn.sendMessage(groupJid, { text: '🔄 Fetching latest news...' });

        // Prepare news message
        let newsMessage = '*📰 ශ්‍රී ලංකා පුවත් - News*\n\n';
        
        // Add some test news (we'll replace this with real news fetching later)
        newsMessage += `*1. Test News Title*\n`;
        newsMessage += `⏰ Just now\n`;
        newsMessage += `🔗 https://example.com\n\n`;

        // Send the news message
        await conn.sendMessage(groupJid, {
            text: newsMessage
        });

        // Confirm message sent successfully
        console.log('Test news sent to:', groupJid);
        
    } catch (error) {
        console.error('Test function error:', error);
        await conn.sendMessage(groupJid, {
            text: '⚠️ Error testing news: ' + error.message
        });
    }
                        }
