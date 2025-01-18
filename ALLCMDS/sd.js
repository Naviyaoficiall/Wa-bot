const fs = require('fs');
const path = require('path');
const axios = require('axios');
const cheerio = require('cheerio');
const { cmd } = require('../command');




cmd({
    pattern: `scrapemovie`,
    react: "📥",
    dontAddCommandList: true,
    filename: __filename
}, async (conn, mek, m, { from, q, isDev, reply }) => {

    if (!q) return reply('*Please provide a search query or URL!*');

    try {
        if (q.includes("https://sinhalasub.lk/movies")) {
            // Scraping movie details from the movie URL
            const response = await axios.get(q);
            const $ = cheerio.load(response.data);

            const title = $(".sheader .data .head h1").text().trim();
            const img = $(".sheader .poster img").attr("src");
            const desc = $("#info .wp-content p").text().trim();
            const rating = $("#repimdb strong").text().trim();
            const genres = $(".data .sgeneros a").map((i, el) => $(el).text()).get().join(", ");
            const downloadLinks = [];

            $("div#download.sbox table tbody tr").each((i, el) => {
                downloadLinks.push({
                    link: $(el).find("td a").attr("href"),
                    quality: $(el).find("td strong").text(),
                    size: $(el).find("td:nth-child(3)").text(),
                });
            });

            let message = `🎬 *Title:* ${title}\n`;
            message += `⭐ *Rating:* ${rating}\n`;
            message += `📜 *Genres:* ${genres}\n`;
            message += `📖 *Description:* ${desc}\n\n`;
            message += `🔗 *Download Links:*\n`;
            downloadLinks.forEach((link, i) => {
                message += `\n${i + 1}. Quality: ${link.quality}\nSize: ${link.size}\nLink: ${link.link}\n`;
            });

            // Send the scraped details as a message
            await conn.sendMessage(from, { text: message }, { quoted: mek });
        } else {
            // Search query handler
            const searchUrl = `https://sinhalasub.lk/?s=${q}`;
            const response = await axios.get(searchUrl);
            const $ = cheerio.load(response.data);

            const results = [];
            $("div.result-item").each((i, el) => {
                results.push({
                    title: $(el).find(".title a").text().trim(),
                    link: $(el).find(".title a").attr("href"),
                });
            });

            let searchResults = `🔍 *Search Results for:* "${q}"\n\n`;
            results.forEach((movie, i) => {
                searchResults += `${i + 1}. 🎬 *${movie.title}*\n🔗 ${movie.link}\n\n`;
            });

            await conn.sendMessage(from, { text: searchResults }, { quoted: mek });
        }
    } catch (err) {
        console.error(err);
        await reply('❌ *An error occurred while processing your request!*');
    }
});
