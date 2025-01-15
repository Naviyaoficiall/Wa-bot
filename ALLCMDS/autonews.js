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
        const response = await axios.get('https://sinhala.newsfirst.lk/latest-news');
        const $ = cheerio.load(response.data);
        
        const previousNews = lastSentNews.get(groupJid) || new Set();
        let newNewsFound = false;
        let newsMessage = '*📰 නවතම පුවත් - Newsfirst*\n\n';

        // Extract news from the website
        const newsItems = [];
        $('.news-story').each((index, element) => {
            const title = $(element).find('.news-story__title').text().trim();
            const time = $(element).find('.news-story__time').text().trim();
            const link = $(element).find('a').attr('href');

            if (title && link && !previousNews.has(title)) {
                newsItems.push({ title, time, link });
                previousNews.add(title);
                newNewsFound = true;
            }
        });

        // Keep only the latest 20 news titles in memory
        if (previousNews.size > 20) {
            const newsArray = Array.from(previousNews);
            const newSet = new Set(newsArray.slice(newsArray.length - 20));
            lastSentNews.set(groupJid, newSet);
        }

        // If new news found, send them
        if (newNewsFound) {
            newsItems.slice(0, 5).forEach((news, index) => {
                newsMessage += `*${index + 1}. ${news.title}*\n`;
                newsMessage += `⏰ ${news.time}\n`;
                newsMessage += `🔗 ${news.link}\n\n`;
            });

            newsMessage += '\n📱 Powered by Newsfirst Sinhala';

            await conn.sendMessage(groupJid, {
                text: newsMessage,
                linkPreview: true
            });
        }
    } catch (error) {
        console.error('Error fetching news:', error);
        await conn.sendMessage(groupJid, {
            text: '⚠️ පුවත් ලබා ගැනීමට නොහැකි විය. පසුව නැවත උත්සාහ කරනු ඇත.'
        });
    }
  }
