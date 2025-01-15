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
    // ... previous command handler code remains same ...
});

async function testNewsFunction(conn, groupJid) {
    try {
        await conn.sendMessage(groupJid, { text: '🔄 පුවත් ලබාගනිමින්...' });

        // Fetch news from Hiru News
        const response = await axios.get('https://www.hirunews.lk/sinhala/local-news.php', {
            headers: {
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
            }
        });

        const $ = cheerio.load(response.data);
        let newsMessage = '*📰 නවතම පුවත් - Hiru News*\n\n';
        let newsCount = 0;

        // Get news items
        $('.all-section-grid').each((index, element) => {
            if (newsCount >= 5) return false; // Only get top 5 news

            const title = $(element).find('.all-section-grid-heading a').text().trim();
            const time = $(element).find('.all-section-grid-sub').text().trim();
            const link = $(element).find('.all-section-grid-heading a').attr('href');

            if (title && link) {
                newsCount++;
                newsMessage += `*${newsCount}. ${title}*\n`;
                if (time) newsMessage += `⏰ ${time}\n`;
                newsMessage += `🔗 https://www.hirunews.lk${link}\n\n`;
            }
        });

        if (newsCount === 0) {
            throw new Error('No news found');
        }

        newsMessage += '\n📱 Powered by Hiru News';

        // Send the news
        await conn.sendMessage(groupJid, {
            text: newsMessage,
            linkPreview: true
        });

        console.log(`Sent ${newsCount} news items to group ${groupJid}`);

    } catch (error) {
        console.error('News fetch error:', error);
        await conn.sendMessage(groupJid, {
            text: '⚠️ පුවත් ලබා ගැනීමට නොහැකි විය: ' + error.message
        });
    }
                }
