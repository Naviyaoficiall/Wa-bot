const puppeteer = require("puppeteer");
const cheerio = require("cheerio");
const { cmd } = require("../command");

cmd({
    pattern: "fmv",
    alias: ["moviesearch"],
    react: "🎥",
    category: "scraping",
    desc: "Scrape movie details and links",
    filename: __filename,
}, async (conn, mek, m, { from, q, reply }) => {
    try {
        if (!q) {
            return reply("*Please provide a movie name to search! (e.g., Interstellar)*");
        }

        const searchUrl = `https://firemovieshub.com/?s=${q}`;

        // Step 1: Search for the movie
        const browser = await puppeteer.launch({ headless: true });
        const page = await browser.newPage();
        await page.setUserAgent(
            "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36"
        );
        await page.goto(searchUrl, { waitUntil: "domcontentloaded" });
        await page.waitForSelector("div.title a");

        const searchContent = await page.content();
        const $ = cheerio.load(searchContent);

        const searchResults = [];
        $("div.result-item").each((index, element) => {
            searchResults.push({
                title: $(element).find("div.title > a").text(),
                year: $(element).find("span.year").text(),
                link: $(element).find("a").attr("href"),
                image: $(element).find("img").attr("src"),
            });
        });

        if (searchResults.length === 0) {
            await browser.close();
            return reply("*No results found! Please try another movie name.*");
        }

        // Step 2: Display search results
        let message = `🎬 *Search Results for "${q}"*\n\n`;
        searchResults.slice(0, 5).forEach((movie, index) => {
            message += `*${index + 1}.* ${movie.title} (${movie.year})\n   🔗 *Link:* ${movie.link}\n\n`;
        });

        const sentMessage = await conn.sendMessage(from, { text: message }, { quoted: mek });

        // Step 3: Listen for user selection
        conn.ev.on("messages.upsert", async (msgUpdate) => {
            const newMsg = msgUpdate.messages[0];
            if (!newMsg.message) return;

            const userText = newMsg.message.conversation || newMsg.message.extendedTextMessage?.text;
            const isReplyToBot = newMsg.message.extendedTextMessage?.contextInfo.stanzaId === sentMessage.key.id;

            if (isReplyToBot) {
                const selectedIndex = parseInt(userText.trim());
                if (isNaN(selectedIndex) || selectedIndex < 1 || selectedIndex > searchResults.length) {
                    return reply("*Invalid selection! Please choose a valid number.*");
                }

                const selectedMovie = searchResults[selectedIndex - 1];

                // Step 4: Scrape movie details
                await page.goto(selectedMovie.link, { waitUntil: "domcontentloaded" });
                await page.waitForSelector("div.data > h1");

                const movieContent = await page.content();
                const $details = cheerio.load(movieContent);

                const title = $details("div.data > h1").text();
                const image = $details("div.poster > img").attr("src");
                const theme = $details("span.tagline").text();
                const date = $details("span.date").text();
                const duration = $details("span.runtime").text();
                const genres = $details("div.sgeneros > a")
                    .map((i, el) => $details(el).text())
                    .get()
                    .join(", ");
                const description = $details("div.wp-content > p").text();
                const imdb = $details("span.valor > strong").text();

                // Step 5: Send movie details
                let movieDetails = `🎥 *${title}*\n\n`;
                movieDetails += `📅 *Release Date:* ${date}\n⏳ *Duration:* ${duration}\n🌟 *IMDb Rating:* ${imdb}\n🎭 *Genres:* ${genres}\n📝 *Description:* ${description}\n\n🔗 *Link:* ${selectedMovie.link}`;

                await conn.sendMessage(from, {
                    image: { url: image },
                    caption: movieDetails,
                }, { quoted: mek });

                await browser.close();
            }
        });
    } catch (error) {
        console.error(error);
        reply(`❌ *An error occurred!*\n\n${error.message || error}`);
    }
});
