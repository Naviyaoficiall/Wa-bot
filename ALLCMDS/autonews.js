const { cmd } = require('../command');
const axios = require('axios');
const cheerio = require('cheerio');
const cron = require('node-cron');

// Store active news subscriptions with group JIDs
const activeSubscriptions = new Map();

// Store last sent news to avoid duplicates
const lastSentNews = new Map();

cmd({
    pattern: "news",
    desc: "Get latest Sinhala news updates from Newsfirst every 2 minutes",
    category: "news",
    react: "📰",
    filename: __filename,
    use: ".news start <group_jid>/stop"
},
async (conn, message, m, { from, args, reply, isGroup }) => {
    try {
        if (!args[0]) {
            return await reply(`*Sinhala News Command Usage*
            
📰 To start news updates:
.news start group_jid
Example: .news start 1234567890@g.us

🛑 To stop news updates:
.news stop group_jid
Example: .news stop 1234567890@g.us

📋 To list active subscriptions:
.news list

📰 To get news once:
.news now group_jid

⏰ Auto updates every 2 minutes`);
        }

        const command = args[0].toLowerCase();

        switch (command) {
            case 'start':
                if (!args[1]) {
                    return await reply('❌ කරුණාකර group JID එක ලබා දෙන්න!\nExample: .news start 1234567890@g.us');
                }

                const groupJid = args[1];
                
                if (!groupJid.endsWith('@g.us')) {
                    return await reply('❌ වැරදි group JID එකක්! Group JID @g.us වලින් අවසන් විය යුතුය');
                }

                try {
                    const groupInfo = await conn.groupMetadata(groupJid);
                    if (!groupInfo) {
                        return await reply('❌ Group එක හමු නොවීය!');
                    }
                } catch (error) {
                    return await reply('❌ Group එක verify කිරීමට නොහැකි විය. Bot group එකේ add කර ඇති බව තහවුරු කරගන්න!');
                }

                if (activeSubscriptions.has(groupJid)) {
                    return await reply('මෙම group එක සඳහා news updates දැනටමත් active කර ඇත!');
                }

                // Schedule news updates every 2 minutes using cron
                const schedule = cron.schedule('*/2 * * * *', async () => {
                    await sendSinhalaNews(conn, groupJid);
                });

                activeSubscriptions.set(groupJid, {
                    schedule: schedule,
                    startTime: new Date().toISOString()
                });

                // Initialize last sent news for this group
                lastSentNews.set(groupJid, new Set());

                // Send first news immediately
                await sendSinhalaNews(conn, groupJid);
                await reply(`✅ News updates activated for group: ${groupJid}\nවිනාඩි 2කට වරක් පුවත් ලැබෙනු ඇත.`);
                break;

            // ... other cases remain the same ...
        }
    } catch (error) {
        console.error('Error in news command:', error);
        await reply('⚠️ දෝෂයක් ඇති විය. කරුණාකර නැවත උත්සාහ කරන්න.');
    }
});

async function sendSinhalaNews(conn, groupJid) {
    try {
        console.log('Attempting to fetch news...');  // Debug log
        const response = await axios.get('https://sinhala.newsfirst.lk/latest-news', {
            timeout: 10000,  // 10 second timeout
            headers: {
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
            }
        });
        
        console.log('News fetch response status:', response.status);  // Debug log
        
        const $ = cheerio.load(response.data);
        let newsFound = false;
        let newsMessage = '*📰 නවතම පුවත් - Newsfirst*\n\n';
        
        $('.news-story').each((index, element) => {
            if (index >= 5) return false;  // Only get top 5 news
            
            const title = $(element).find('.news-story__title').text().trim();
            const time = $(element).find('.news-story__time').text().trim();
            const link = $(element).find('a').attr('href');
            
            if (title && link) {
                newsFound = true;
                newsMessage += `*${index + 1}. ${title}*\n`;
                newsMessage += `⏰ ${time}\n`;
                newsMessage += `🔗 ${link}\n\n`;
                console.log(`Found news: ${title}`);  // Debug log
            }
        });
        
        if (!newsFound) {
            console.log('No news items found on the page');  // Debug log
            throw new Error('No news found');
        }

        newsMessage += '\n📱 Powered by Newsfirst Sinhala';
        
        console.log('Sending news to group:', groupJid);  // Debug log
        
        await conn.sendMessage(groupJid, {
            text: newsMessage,
            linkPreview: true
        });
        
        console.log('News sent successfully');  // Debug log
        
    } catch (error) {
        console.error('Error in sendSinhalaNews:', error.message);  // Detailed error log
        console.error('Full error:', error);  // Full error stack
        
        await conn.sendMessage(groupJid, {
            text: '⚠️ පුවත් ලබා ගැනීමට නොහැකි විය. Error: ' + error.message
        });
    }
                }
