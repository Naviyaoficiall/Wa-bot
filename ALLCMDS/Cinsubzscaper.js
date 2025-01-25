const puppeteer = require('puppeteer');
const axios = require('axios');
const cheerio = require('cheerio');
const { cmd } = require('../command');

cmd({
    pattern: ".cinsubz4",
    alias: ['mv3'],
    react: '🎬',
    category: "download",
    desc: "Search movies on CineSubz and get download links",
    filename: __filename
}, async (conn, message, msg, { from, q, reply }) => {
    try {
        if (!q) {
            return await reply("*Please provide a movie name! (e.g., Deadpool)*");
        }

        // Scraping CineSubz search results
        const searchUrl = `https://cinesubz.co/?s=${encodeURIComponent(q)}`;
        const browser = await puppeteer.launch({
            headless: true,
            args: ['--no-sandbox', '--disable-setuid-sandbox']
        });

        const page = await browser.newPage();
        await page.goto(searchUrl, { waitUntil: 'domcontentloaded' });

        const searchResults = await page.evaluate(() => {
            let results = [];
            document.querySelectorAll(".post-title.entry-title").forEach((el) => {
                const title = el.innerText;
                const link = el.querySelector("a").href;
                results.push({ title, link });
            });
            return results;
        });

        await browser.close();

        if (!searchResults.length) {
            return await reply(`*No results found for:* ${q}`);
        }

        // Creating the search results message
        let resultMessage = `🎬 *Search Results for:* _${q}_\n\n`;
        searchResults.slice(0, 5).forEach((result, index) => {
            resultMessage += `*${index + 1}.* ${result.title}\n🔗 Link: ${result.link}\n\n`;
        });

        const sentMessage = await conn.sendMessage(from, { text: resultMessage }, { quoted: message });

        const messageId = sentMessage.key.id;

        // Handling User Response for Download
        conn.ev.on('messages.upsert', async msgUpdate => {
            const newMsg = msgUpdate.messages[0];
            if (!newMsg.message) return;

            const userText = newMsg.message.conversation || newMsg.message.extendedTextMessage?.text;
            const isReplyToBot = newMsg.message.extendedTextMessage && newMsg.message.extendedTextMessage.contextInfo.stanzaId === messageId;

            if (isReplyToBot) {
                const selectedNumber = parseInt(userText.trim());
                if (!isNaN(selectedNumber) && selectedNumber > 0 && selectedNumber <= searchResults.length) {
                    const selectedMovie = searchResults[selectedNumber - 1];

                    const movieResponse = await axios.get(selectedMovie.link);
                    const $ = cheerio.load(movieResponse.data);

                    let downloadLinks = [];
                    $("a").each((_, element) => {
                        const link = $(element).attr("href");
                        if (link && link.includes("pixeldrain.com")) {
                            downloadLinks.push(link);
                        }
                    });

                    if (!downloadLinks.length) {
                        return await reply("No PixelDrain download links found.");
                    }

                    let downloadMessage = `🎥 *${selectedMovie.title}*\n\n`;
                    downloadMessage += "*Available Download Links:*\n";
                    downloadLinks.forEach((link, index) => {
                        downloadMessage += `*${index + 1}.* 🔗 Link: ${link}\n\n`;
                    });

                    const sentDownloadMessage = await conn.sendMessage(from, { text: downloadMessage }, { quoted: newMsg });

                    const downloadMessageId = sentDownloadMessage.key.id;

                    // Handling User Response for Final Download
                    conn.ev.on("messages.upsert", async downloadMsgUpdate => {
                        const downloadMsg = downloadMsgUpdate.messages[0];
                        if (!downloadMsg.message) return;

                        const downloadText = downloadMsg.message.conversation || downloadMsg.message.extendedTextMessage?.text;
                        const isReplyToDownloadMessage = downloadMsg.message.extendedTextMessage && downloadMsg.message.extendedTextMessage.contextInfo.stanzaId === downloadMessageId;

                        if (isReplyToDownloadMessage) {
                            const downloadNumber = parseInt(downloadText.trim());
                            if (!isNaN(downloadNumber) && downloadNumber > 0 && downloadNumber <= downloadLinks.length) {
                                const selectedLink = downloadLinks[downloadNumber - 1];
                                const fileId = selectedLink.split('/').pop();

                                await conn.sendMessage(from, { react: { text: '⬇️', key: message.key } });

                                const downloadUrl = `https://pixeldrain.com/api/file/${fileId}`;
                                await conn.sendMessage(from, { react: { text: '⬆', key: message.key } });

                                await conn.sendMessage(from, {
                                    document: { url: downloadUrl },
                                    mimetype: "video/mp4",
                                    fileName: `${selectedMovie.title}.mp4`,
                                    caption: `${selectedMovie.title}\nQuality: HD\nDownloaded via Naviya MD`,
                                    contextInfo: {
                                        externalAdReply: {
                                            title: selectedMovie.title,
                                            body: "Download from CineSubz",
                                            mediaType: 1,
                                            sourceUrl: selectedMovie.link,
                                            thumbnailUrl: "https://cinesubz.co/wp-content/uploads/2023/04/CineSubz.png"
                                        }
                                    }
                                }, { quoted: downloadMsg });

                                await conn.sendMessage(from, { react: { text: '✅', key: message.key } });
                            } else {
                                await reply("Invalid selection. Please reply with a valid number.");
                            }
                        }
                    });
                } else {
                    await reply("Invalid selection. Please reply with a valid number.");
                }
            }
        });
    } catch (error) {
        console.error("Error during search:", error);
        reply("*An error occurred while searching!*");
    }
});
