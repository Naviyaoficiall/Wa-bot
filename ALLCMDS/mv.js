const { cmd } = require('../command'); // Command handler
const axios = require("axios");
const cheerio = require("cheerio");

cmd({
    pattern: "mv",
    desc: "Search and download movies",
    category: "scraper",
    filename: __filename,
    use: ".movie <movie name>"
}, async (conn, mek, m, { reply, q }) => {
    try {
        if (!q) {
            return reply(`
❌ *Please provide a movie name!*

📝 *Usage:* .movie <movie name>
📌 *Example:* .movie Avengers`);
        }

        const movieName = q.trim();
        await reply("⏳ Searching for the movie, please wait...");

        // Fetch the website and search for the movie
        const searchUrl = `https://sinhalasub.lk/movies/?s=${encodeURIComponent(movieName)}`;
        const { data: searchPage } = await axios.get(searchUrl);
        const $ = cheerio.load(searchPage);

        // Scrape the first search result
        const firstResult = $(".post-title a").first();
        if (!firstResult.length) {
            return reply(`❌ *No results found for:* ${movieName}`);
        }

        const movieTitle = firstResult.text().trim();
        const movieLink = firstResult.attr("href");

        // Fetch the movie details page
        const { data: moviePage } = await axios.get(movieLink);
        const $$ = cheerio.load(moviePage);

        // Extract movie details
        const title = $$(".post-title").text().trim() || "N/A";
        const thumbnail = $$(".post-thumbnail img").attr("src") || null; // Thumbnail URL
        const description = $$(".post-content p").first().text().trim() || "Description not available";

        // Extract download links
        const downloadLinks = [];
        $$(".wp-block-button__link").each((i, el) => {
            downloadLinks.push({
                text: $(el).text().trim(),
                link: $(el).attr("href"),
            });
        });

        if (!downloadLinks.length) {
            return reply(`❌ No download links available for: *${movieName}*`);
        }

        // Display movie details and ask for confirmation
        let detailsMessage = `🎥 *Movie Found!*\n\n` +
            `📌 *Title:* ${title}\n` +
            `📝 *Description:* ${description}\n\n` +
            `🌐 *Available Downloads:*\n` +
            downloadLinks.map((link, index) => `🔹 ${index + 1}. ${link.text}`).join("\n") +
            `\n\n> Reply *yes* to download the best quality available.`;

        // Send the thumbnail and details
        await conn.sendMessage(m.chat, {
            image: { url: thumbnail },
            caption: detailsMessage,
        }, { quoted: m });

        // Wait for user confirmation
        conn.onceReply(m.chat, async (userResponse) => {
            const userReply = userResponse.body?.toLowerCase();
            if (userReply === "yes") {
                await reply("📥 Downloading the movie, please wait...");

                // Select the first available download link
                const bestLink = downloadLinks[0];
                const downloadUrl = bestLink.link;

                // Send the download link as a message
                await conn.sendMessage(m.chat, {
                    text: `🎥 *Title:* ${title}\n` +
                          `📥 *Download Link:* ${downloadUrl}\n\n` +
                          `> Powered by SinhalaSub.lk`,
                }, { quoted: m });

                await reply("✅ Download link sent successfully!");
            } else {
                await reply("❌ Download cancelled.");
            }
        });
    } catch (error) {
        console.error("Error in movie command:", error);
        reply("❌ An error occurred while processing your request. Please try again later.");
    }
});
