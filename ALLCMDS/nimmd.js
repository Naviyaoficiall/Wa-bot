const axios = require("axios");
const cheerio = require("cheerio");
const { cmd } = require("../command");

cmd({
    pattern: "firemovie",
    alias: ["moviesearch", "searchmovie"],
    react: "🎬",
    desc: "Search and download movies",
    category: "media",
    use: ".firemovie <movie name>",
    filename: __filename,
}, async (conn, mek, m, { from, reply, args, q }) => {
    try {
        if (!q) {
            return await reply(`
*🎬 FIRE MOVIE SEARCH*

Usage: .firemovie <movie name>

Examples:
.firemovie Avatar
.firemovie John Wick

*Tips:*
- Use full movie titles
- Be specific with your search`);
        }

        await reply("🔍 Searching for movies...");

        // Scraping Movies from SinhalaSub.lk
        const searchURL = `https://www.sinhalasub.lk/?s=${encodeURIComponent(q)}`;
        const res = await axios.get(searchURL);
        const $ = cheerio.load(res.data);

        const movies = [];
        $(".result-item").each((i, el) => {
            const title = $(el).find(".title a").text().trim();
            const link = $(el).find(".title a").attr("href");
            const image = $(el).find("img").attr("src");
            movies.push({ title, link, image });
        });

        if (movies.length === 0) {
            return await reply(`❌ No results found for "${q}".`);
        }

        let movieList = `*🎬 Movie Search Results for "${q}"*\n\n`;
        movies.forEach((movie, index) => {
            movieList += `*${index + 1}. ${movie.title}*\n🔗 Link: ${movie.link}\n\n`;
        });

        // Send Movie List with numbers for selection
        const sentMsg = await conn.sendMessage(
            from,
            {
                text: `${movieList}\n*Reply with the movie number to download it!*`,
                contextInfo: {
                    externalAdReply: {
                        title: `Movie Search for ${q}`,
                        body: "Click on the links to view or reply with a number to download",
                        thumbnailUrl: movies[0]?.image || null,
                        mediaType: 1,
                    },
                },
            },
            { quoted: mek }
        );

        const messageID = sentMsg.key.id;

        // Handle movie selection
        conn.ev.on("messages.upsert", async (msgUpdate) => {
            const mek = msgUpdate.messages[0];
            if (!mek.message) return;

            const text = mek.message.conversation || mek.message.extendedTextMessage?.text;
            const isReplyToSentMsg = mek.message.extendedTextMessage?.contextInfo?.stanzaId === messageID;

            if (isReplyToSentMsg) {
                const selectedIndex = parseInt(text) - 1;

                if (selectedIndex >= 0 && selectedIndex < movies.length) {
                    const selectedMovie = movies[selectedIndex];
                    await reply(`🎬 Fetching download links for *${selectedMovie.title}*...`);

                    // Scrape download links from selected movie page
                    const moviePageRes = await axios.get(selectedMovie.link);
                    const $moviePage = cheerio.load(moviePageRes.data);

                    const downloadLinks = [];
                    $moviePage("a.download").each((i, el) => {
                        const link = $moviePage(el).attr("href");
                        const quality = $moviePage(el).text().trim();
                        downloadLinks.push({ quality, link });
                    });

                    if (downloadLinks.length === 0) {
                        return await reply(`❌ No download links found for *${selectedMovie.title}*.`);
                    }

                    let downloadList = `*🎬 Download Options for "${selectedMovie.title}"*\n\n`;
                    downloadLinks.forEach((dl, index) => {
                        downloadList += `*${index + 1}. ${dl.quality}*\n🔗 Link: ${dl.link}\n\n`;
                    });

                    await conn.sendMessage(
                        from,
                        {
                            text: `${downloadList}\n*Reply with the number to download the movie directly!*`,
                        },
                        { quoted: mek }
                    );

                    global.selectedMovieDownloads = downloadLinks;

                } else {
                    await reply("❌ Please enter a valid movie number.");
                }
            } else if (global.selectedMovieDownloads) {
                const selectedDownloadIndex = parseInt(text) - 1;
                const selectedDownload = global.selectedMovieDownloads[selectedDownloadIndex];

                if (selectedDownload) {
                    await reply(`🔽 Downloading movie in ${selectedDownload.quality}...`);

                    try {
                        // Download and send the movie file
                        const movieRes = await axios({
                            method: "get",
                            url: selectedDownload.link,
                            responseType: "arraybuffer",
                        });

                        const filename = `${q}_${selectedDownload.quality}.mp4`;

                        await conn.sendMessage(from, {
                            document: Buffer.from(movieRes.data),
                            mimetype: "video/mp4",
                            fileName: filename,
                            caption: `🎬 *Download Complete*\n📽️ *Title*: ${q}\n📊 *Quality*: ${selectedDownload.quality}`,
                        });

                        await reply(`✅ Movie downloaded successfully in ${selectedDownload.quality}!`);
                        delete global.selectedMovieDownloads;
                    } catch (err) {
                        console.error("Download Error:", err);
                        await reply("❌ Failed to download the movie.");
                    }
                } else {
                    await reply("❌ Please select a valid download option.");
                }
            }
        });
    } catch (err) {
        console.error(err);
        await reply("❌ An error occurred while searching or downloading.");
    }
});
