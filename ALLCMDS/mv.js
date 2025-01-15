const puppeteer = require("puppeteer");
const { cmd } = require('../command');
const axios = require("axios");
const fs = require("fs");
const path = require("path");

cmd({
    pattern: "movie",
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

        // Launch Puppeteer
        const browser = await puppeteer.launch({ headless: true });
        const page = await browser.newPage();
        await page.goto("https://sinhalasub.lk/movies/");

        // Search for the movie
        await page.type('input[name="s"]', movieName); // Adjust selector for search bar
        await page.keyboard.press("Enter");
        await page.waitForTimeout(3000); // Wait for results to load

        // Scrape first search result
        const movieDetails = await page.evaluate(() => {
            const firstResult = document.querySelector(".post-title a"); // Selector for first movie link
            if (firstResult) {
                return {
                    title: firstResult.innerText.trim(),
                    link: firstResult.href,
                };
            }
            return null;
        });

        if (!movieDetails) {
            await browser.close();
            return reply(`❌ *No results found for:* ${movieName}`);
        }

        // Navigate to the movie details page
        await page.goto(movieDetails.link);

        // Scrape details and download link
        const fullDetails = await page.evaluate(() => {
            const title = document.querySelector(".post-title")?.innerText.trim() || "N/A";
            const thumbnail = document.querySelector(".post-thumbnail img")?.src || null; // Thumbnail URL
            const description = document.querySelector(".post-content p")?.innerText.trim() || "Description not available";
            const downloadLinks = Array.from(document.querySelectorAll(".wp-block-button__link")).map(el => ({
                text: el.innerText.trim(),
                link: el.href,
            })) || [];

            return { title, thumbnail, description, downloadLinks };
        });

        if (!fullDetails.downloadLinks.length) {
            await browser.close();
            return reply(`❌ No download links available for: *${movieName}*`);
        }

        // Display movie details and ask for confirmation
        let detailsMessage = `🎥 *Movie Found!*\n\n` +
            `📌 *Title:* ${fullDetails.title}\n` +
            `📝 *Description:* ${fullDetails.description}\n\n` +
            `🌐 *Available Downloads:*\n` +
            fullDetails.downloadLinks.map((link, index) => `🔹 ${index + 1}. ${link.text}`).join("\n") +
            `\n\n> Reply *yes* to download the best quality available.`;

        // Send the thumbnail and details
        await conn.sendMessage(m.chat, {
            image: { url: fullDetails.thumbnail },
            caption: detailsMessage,
        }, { quoted: m });

        // Wait for user confirmation
        conn.onceReply(m.chat, async (userResponse) => {
            const userReply = userResponse.body?.toLowerCase();
            if (userReply === "yes") {
                await reply("📥 Downloading the movie, please wait...");

                // Select the first available download link
                const bestLink = fullDetails.downloadLinks[0];
                const downloadUrl = bestLink.link;

                // Download the movie file
                const filePath = path.resolve(__dirname, `${fullDetails.title.replace(/[^a-zA-Z0-9]/g, "_")}.mp4`);
                const writer = fs.createWriteStream(filePath);

                const response = await axios({
                    url: downloadUrl,
                    method: "GET",
                    responseType: "stream",
                });

                response.data.pipe(writer);

                await new Promise((resolve, reject) => {
                    writer.on("finish", resolve);
                    writer.on("error", reject);
                });

                // Send the movie file
                await conn.sendMessage(m.chat, {
                    video: { url: filePath },
                    caption: `🎥 *Title:* ${fullDetails.title}\n\n> Powered by SinhalaSub.lk`,
                    thumbnail: { url: fullDetails.thumbnail },
                }, { quoted: m });

                // Clean up the file
                fs.unlinkSync(filePath);
                await reply("✅ Movie downloaded and sent successfully!");
            } else {
                await reply("❌ Download cancelled.");
            }
        });

        await browser.close();
    } catch (error) {
        console.error("Error in movie command:", error);
        reply("❌ An error occurred while processing your request. Please try again later.");
    }
});
