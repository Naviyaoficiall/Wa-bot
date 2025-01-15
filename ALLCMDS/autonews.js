const { cmd } = require('../command');
const axios = require('axios');
const cheerio = require('cheerio');

async function scrapeHiruNews() {
    try {
        const response = await axios.get('https://www.hirunews.lk/sinhala/', {
            headers: {
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
            }
        });

        const $ = cheerio.load(response.data);
        const news = [];

        // Scrape latest news
        $('.main-news').each((i, element) => {
            if (i < 4) { // Get top 4 news
                const title = $(element).find('.main-news-heading').text().trim();
                const time = $(element).find('.time').text().trim();
                news.push({ title, time });
            }
        });

        return news;
    } catch (error) {
        console.error('Scraping error:', error);
        return null;
    }
}

cmd({
    pattern: "news",
    desc: "Get latest Hiru news",
    category: "news",
    react: "📰",
    filename: __filename,
}, async (conn, message, m, { reply }) => {
    try {
        // Send initial message
        await reply("🔄 පුවත් ලබාගනිමින්... කරුණාකර රැඳී සිටින්න.");

        // Scrape news
        const news = await scrapeHiruNews();
        
        if (!news) {
            return await reply("❌ පුවත් ලබාගැනීමට නොහැකි විය. පසුව උත්සාහ කරන්න.");
        }

        // Format news message
        let newsMsg = `*📰 හිරු පුවත් - LIVE UPDATE*\n`;
        newsMsg += `➖➖➖➖➖➖➖➖➖➖➖\n\n`;

        news.forEach((item, index) => {
            newsMsg += `*${index + 1}. ${item.title}*\n`;
            newsMsg += `⏰ ${item.time}\n\n`;
        });

        newsMsg += `➖➖➖➖➖➖➖➖➖➖➖\n`;
        newsMsg += `📱 Powered by: NAVIYA MD\n`;
        newsMsg += `⚡ User: ${message.pushName}\n`;
        newsMsg += `🕐 Updated: ${new Date().toLocaleTimeString()}`;

        await conn.sendMessage(message.key.remoteJid, { 
            text: newsMsg,
            quoted: message 
        });

    } catch (error) {
        console.error("Error:", error);
        await reply("❌ Error fetching news");
    }
});

// Auto update variable
let updateInterval;

cmd({
    pattern: "autostart",
    desc: "Start auto news updates",
    category: "news",
    filename: __filename,
}, async (conn, message, m, { reply }) => {
    try {
        if (updateInterval) {
            return await reply("⚠️ Auto updates දැනටමත් ක්‍රියාත්මකයි!");
        }

        updateInterval = setInterval(async () => {
            try {
                const news = await scrapeHiruNews();
                if (news) {
                    let newsMsg = `*📰 හිරු පුවත් - AUTO UPDATE*\n`;
                    newsMsg += `➖➖➖➖➖➖➖➖➖➖➖\n\n`;

                    news.forEach((item, index) => {
                        newsMsg += `*${index + 1}. ${item.title}*\n`;
                        newsMsg += `⏰ ${item.time}\n\n`;
                    });

                    newsMsg += `➖➖➖➖➖➖➖➖➖➖➖\n`;
                    newsMsg += `📱 Powered by: NAVIYA MD\n`;
                    newsMsg += `⚡ Auto Update System`;

                    await conn.sendMessage(message.key.remoteJid, { 
                        text: newsMsg,
                        quoted: message 
                    });
                }
            } catch (err) {
                console.error("Auto update error:", err);
            }
        }, 60000); // Every 1 minute

        await reply("✅ Real-time news updates started!");

    } catch (error) {
        console.error("Error:", error);
        await reply("❌ Error starting auto updates");
    }
});

cmd({
    pattern: "autostop",
    desc: "Stop auto news updates",
    category: "news",
    filename: __filename,
}, async (conn, message, m, { reply }) => {
    try {
        if (!updateInterval) {
            return await reply("⚠️ No auto updates running!");
        }

        clearInterval(updateInterval);
        updateInterval = null;
        await reply("✅ News auto updates stopped!");

    } catch (error) {
        console.error("Error:", error);
        await reply("❌ Error stopping auto updates");
    }
});
