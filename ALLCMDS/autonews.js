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
    desc: "Get latest Sinhala news updates from Newsfirst automatically",
    category: "news",
    react: "📰",
    filename: __filename,
    use: ".news start/stop/list"
}, async (conn, message, m, { args, reply }) => {
    try {
        if (!args[0]) {
            return await reply(`*📰 Sinhala News Command Usage*

🔸 Start news updates:
  .news start

🔸 Stop news updates:
  .news stop

🔸 Check active subscriptions:
  .news list

🔸 Get news once:
  .news now

⏰ News updates every 2 minutes.`);
        }

        const command = args[0].toLowerCase();
        const groupJid = message.key.remoteJid;

        switch (command) {
            case 'start':
                if (!groupJid.endsWith('@g.us')) {
                    return await reply('❌ This command can only be used in groups!');
                }

                if (activeSubscriptions.has(groupJid)) {
                    return await reply('📰 News updates are already active in this group!');
                }

                // Schedule news updates every 2 minutes
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
                await reply('✅ News updates activated! You will receive updates every 2 minutes.');
                break;

            case 'stop':
                if (!activeSubscriptions.has(groupJid)) {
                    return await reply('❌ No active news subscription in this group!');
                }

                const subscription = activeSubscriptions.get(groupJid);
                subscription.schedule.stop();
                activeSubscriptions.delete(groupJid);
                lastSentNews.delete(groupJid);

                await reply('🛑 News updates have been stopped.');
                break;

            case 'list':
                if (activeSubscriptions.size === 0) {
                    return await reply('❌ No active news subscriptions.');
                }

                let subscriptionList = '*📰 Active News Subscriptions*\n\n';
                for (const [gid, data] of activeSubscriptions) {
                    try {
                        const groupMetadata = await conn.groupMetadata(gid);
                        subscriptionList += `Group: ${groupMetadata.subject}\n`;
                        subscriptionList += `Started: ${data.startTime}\n\n`;
                    } catch (error) {
                        subscriptionList += `Group JID: ${gid}\n`;
                        subscriptionList += `Started: ${data.startTime}\n\n`;
                    }
                }
                await reply(subscriptionList);
                break;

            case 'now':
                await sendSinhalaNews(conn, groupJid);
                break;

            default:
                await reply('❌ Invalid command. Use start, stop, list, or now.');
        }

    } catch (error) {
        console.error('Error in news command:', error);
        await reply('⚠️ An error occurred while processing the command.');
    }
});

async function sendSinhalaNews(conn, groupJid) {
    try {
        console.log('Fetching news from Newsfirst...');
        
        const response = await axios.get('https://sinhala.newsfirst.lk/latest-news', {
            timeout: 15000,
            headers: {
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
            }
        });

        const $ = cheerio.load(response.data);
        const previousNews = lastSentNews.get(groupJid) || new Set();
        let newNewsFound = false;
        let newsMessage = '*📰 නවතම පුවත් - Newsfirst*\n\n';

        // Try multiple selectors to find news items
        const newsItems = [];
        $('article, .article, .news-item, .post').each((index, element) => {
            const title = $(element).find('h1, h2, h3, .title').first().text().trim();
            const time = $(element).find('.time, .date, time').first().text().trim();
            let link = $(element).find('a').first().attr('href');

            if (title && link && !previousNews.has(title)) {
                // Make sure link is absolute URL
                if (!link.startsWith('http')) {
                    link = `https://sinhala.newsfirst.lk${link}`;
                }

                newsItems.push({ title, time, link });
                previousNews.add(title);
                newNewsFound = true;
            }
        });

        // Keep only the latest 20 news titles in memory
        if (previousNews.size > 20) {
            const newsArray = Array.from(previousNews);
            lastSentNews.set(groupJid, new Set(newsArray.slice(newsArray.length - 20)));
        }

        // If new news found, send them
        if (newNewsFound) {
            newsItems.slice(0, 5).forEach((news, index) => {
                newsMessage += `*${index + 1}. ${news.title}*\n`;
                if (news.time) newsMessage += `⏰ ${news.time}\n`;
                newsMessage += `🔗 ${news.link}\n\n`;
            });

            newsMessage += '\n📱 Powered by Newsfirst Sinhala';

            await conn.sendMessage(groupJid, {
                text: newsMessage,
                linkPreview: true
            });
            
            console.log(`Sent ${newsItems.length} news items to group ${groupJid}`);
        } else {
            console.log('No new news items found');
        }

    } catch (error) {
        console.error('Error fetching news:', error);
        if (!activeSubscriptions.has(groupJid)) return; // Don't send error if subscription was stopped

        await conn.sendMessage(groupJid, {
            text: '⚠️ පුවත් ලබා ගැනීමට නොහැකි විය. කරුණාකර පසුව නැවත උත්සාහ කරන්න.'
        });
    }
}

module.exports = {
    // Export any functions or variables if needed
};
