const puppeteer = require('puppeteer');
const axios = require('axios');
const cheerio = require('cheerio');
const { cmd } = require('../command');

cmd({
    pattern: "cinsubz4",
    alias: ['films', 'film'],
    category: "download",
    desc: "Search Sinhala Sub Movies and Download",
    filename: __filename
}, async (conn, message, msg, { from, q, reply }) => {
    try {
        if (!q) return await reply("*Please provide a movie name to search!*");

        let searchResults = await searchMovies(q);
        if (searchResults.length === 0) return await reply("*No results found!*");

        let resultMessage = "🎬 *Search Results for:* _" + q + "_\n\n";
        searchResults.forEach((result, index) => {
            resultMessage += `*${index + 1}.* ${result.title}\n🔗 Link: ${result.link}\n\n`;
        });

        let sentMessage = await conn.sendMessage(from, { text: resultMessage }, { quoted: message });

        conn.ev.on("messages.upsert", async msgUpdate => {
            let newMsg = msgUpdate.messages[0];
            if (!newMsg.message) return;
            
            let userText = newMsg.message.conversation || newMsg.message.extendedTextMessage?.text;
            let isReplyToBot = newMsg.message.extendedTextMessage && newMsg.message.extendedTextMessage.contextInfo.stanzaId === sentMessage.key.id;

            if (isReplyToBot) {
                let selectedIndex = parseInt(userText.trim());
                if (isNaN(selectedIndex) || selectedIndex < 1 || selectedIndex > searchResults.length) {
                    return await reply("*Invalid selection. Please reply with a valid number.*");
                }

                let selectedMovie = searchResults[selectedIndex - 1];
                let movieDetails = await getMovieInfo(selectedMovie.link);

                let detailsMessage = `🎬 *${movieDetails.title}*\n\n📄 *Description:* ${movieDetails.description}\n📥 *Download:* [Click Here](${movieDetails.downloadLink})`;

                await conn.sendMessage(from, {
                    text: detailsMessage,
                    image: { url: movieDetails.image }
                }, { quoted: newMsg });
            }
        });

    } catch (error) {
        console.error("Error:", error);
        await reply("*An error occurred while searching for the movie!*");
    }
});

// Search Movies Function
async function searchMovies(query) {
    const searchUrl = `https://cinesubz.co/?s=${encodeURIComponent(query)}`;
    const browser = await puppeteer.launch({ headless: true });
    const page = await browser.newPage();

    await page.goto(searchUrl, { waitUntil: 'load' });
    const html = await page.content();
    const $ = cheerio.load(html);
    
    let results = [];
    $('.post-title').each((index, element) => {
        let title = $(element).text().trim();
        let link = $(element).find('a').attr('href');
        results.push({ title, link });
    });

    await browser.close();
    return results;
}

// Get Movie Info Function
async function getMovieInfo(movieUrl) {
    const browser = await puppeteer.launch({ headless: true });
    const page = await browser.newPage();

    await page.goto(movieUrl, { waitUntil: 'load' });
    const html = await page.content();
    const $ = cheerio.load(html);

    let title = $('.post-title').text().trim();
    let image = $('.attachment-post-thumbnail').attr('src');
    let description = $('.post-content p').first().text();
    let downloadLink = $('.wp-block-button a').attr('href');

    await browser.close();
    return { title, image, description, downloadLink };
          }
