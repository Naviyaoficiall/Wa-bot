const { cmd } = require('../command'); // Command handler
const axios = require("axios");
const cheerio = require("cheerio");

cmd({
    pattern: "movieinfo",
    desc: "Fetch movie details and download links",
    category: "scraper",
    filename: __filename,
    use: ".movieinfo <movie name or URL>"
}, async (conn, mek, m, { reply, q }) => {
    try {
        if (!q) {
            return reply(`
❌ *Please provide a movie name or URL!*

📝 *Usage:* .movieinfo <movie name or URL>
📌 *Example:* .movieinfo Avengers
📌 *Example:* .movieinfo https://sinhalasub.lk/movies/example-movie`);
        }

        if (!q.startsWith("https://sinhalasub.lk/movies")) {
            // Searching for movies
            const searchUrl = `https://sinhalasub.lk?s=${encodeURIComponent(q)}`;
            const response = await axios.get(searchUrl);
            const $ = cheerio.load(response.data);

            const searchResults = [];
            $("div.result-item").each((_, el) => {
                searchResults.push({
                    title: $(el).find("div.title > a").text().trim(),
                    link: $(el).find("div.title > a").attr("href")
                });
            });

            if (!searchResults.length) {
                return reply(`❌ No results found for: *${q}*`);
            }

            // Display top search result and ask for confirmation
            const topResult = searchResults[0];
            return reply(`🎥 *Top Result:*\n\n` +
                `📌 *Title:* ${topResult.title}\n` +
                `🔗 *Link:* ${topResult.link}\n\n` +
                `> Reply with the full movie URL for detailed information.`);
        }

        // Fetching movie details
        const movieUrl = q.trim();
        const response = await axios.get(movieUrl);
        const $ = cheerio.load(response.data);

        const title = $(".sheader .data .head h1").text().trim();
        const tagline = $(".sheader .extra .tagline").text().trim();
        const releaseDate = $(".sheader .extra .date").text().trim();
        const duration = $(".sheader .extra .runtime").text().trim();
        const rating = $("#repimdb strong").text().trim();
        const country = $(".sheader .extra .country").text().trim();
        const description = $("#info .wp-content p").text().trim();
        const poster = $(".poster img").attr("src");

        // Fetching download links
        const downloadLinks = [];
        $("div#download.sbox > div > div > table > tbody > tr").each((_, el) => {
            downloadLinks.push({
                link: $(el).find("td > a").attr("href"),
                quality: $(el).find("td > strong").text().trim(),
                size: $(el).find("td:nth-child(3)").text().trim()
            });
        });

        const images = [];
        $("div.g-item").each((_, el) => {
            images.push($(el).find("a").attr("href"));
        });

        // Format the response
        let message = `🎥 *Movie Details*\n\n` +
            `📌 *Title:* ${title}\n` +
            `🔖 *Tagline:* ${tagline}\n` +
            `📆 *Release Date:* ${releaseDate}\n` +
            `⏳ *Duration:* ${duration}\n` +
            `⭐ *Rating:* ${rating}\n` +
            `🌍 *Country:* ${country}\n` +
            `📝 *Description:* ${description}\n\n`;

        if (downloadLinks.length) {
            message += `📥 *Download Links:*\n` +
                downloadLinks.map((d, i) => `🔹 ${i + 1}. *Quality:* ${d.quality} | *Size:* ${d.size}\n   🔗 ${d.link}`).join("\n") + "\n\n";
        } else {
            message += "❌ *No download links found.*\n\n";
        }

        if (images.length) {
            message += `🖼️ *Gallery Images:*\n` +
                images.map((img, i) => `🔹 ${i + 1}. ${img}`).join("\n") + "\n\n";
        }

        // Send the details with the poster image
        await conn.sendMessage(m.chat, {
            image: { url: poster },
            caption: message
        }, { quoted: m });

    } catch (error) {
        console.error("Error fetching movie details:", error);
        reply("❌ An error occurred while processing your request. Please try again later.");
    }
});
