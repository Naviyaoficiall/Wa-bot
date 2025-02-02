const { cmd } = require('../command');
const axios = require('axios');
const fs = require('fs').promises;
const path = require('path');

cmd({
    pattern: "firemovie",
    alias: ["moviefire2", "moviesearch"],
    react: "🎬",
    desc: "Search Movies on Fire Movies Hub",
    category: "media",
    use: ".firemovie <movie name>",
    filename: __filename
}, async (conn, mek, m, { from, reply, args, q }) => {
    try {
        if (!q) {
            return await reply(`
*🎬 FIRE MOVIE SEARCH*

Usage: .firemovie <movie name>

Examples:
.firemovie Iron Man
.firemovie Avengers
.firemovie Spider-Man

*Tips:*
- Be specific with movie name
- Use full movie titles`);
        }

        await m.react("🔍");
        const encodedQuery = encodeURIComponent(q);

        const searchResponse = await axios.get(`https://www.dark-yasiya-api.site/movie/firemovie/search?text=${encodedQuery}`);

        if (!searchResponse.data || !searchResponse.data.status) {
            return await reply("❌ No movies found or API error.");
        }

        const movies = searchResponse.data.result.data;
        if (movies.length === 0) {
            return await reply(`❌ No movies found for "${q}".`);
        }

        let desc = `*🎬 MOVIE SEARCH RESULTS*\n\n${movies.map((movie, index) => `*${index + 1}. ${movie.title} (${movie.year})*\n📄 Type: ${movie.type}\n🔗 Link: ${movie.link}`).join('\n\n')}`;

        const sentMsg = await conn.sendMessage(from, { text: desc }, { quoted: mek });
        const messageID = sentMsg.key?.id;

        conn.ev.on("messages.upsert", async (messageUpdate) => {
            const mek = messageUpdate.messages[0];
            if (!mek.message) return;

            const messageType = mek.message.conversation || mek.message.extendedTextMessage?.text;
            const isReplyToSentMsg = mek.message.extendedTextMessage && mek.message.extendedTextMessage.contextInfo.stanzaId === messageID;

            if (isReplyToSentMsg) {
                const selectedIndex = parseInt(messageType) - 1;
                if (selectedIndex >= 0 && selectedIndex < movies.length) {
                    const selectedMovie = movies[selectedIndex];

                    try {
                        const detailResponse = await axios.get(`https://www.dark-yasiya-api.site/movie/firemovie/movie?url=${encodeURIComponent(selectedMovie.link)}`);

                        if (!detailResponse.data || !detailResponse.data.status) {
                            return await reply("❌ Failed to fetch movie details.");
                        }

                        const movieDetails = detailResponse.data.result.data;

                        if (mek && mek.key) {
                            await conn.sendMessage(from, { react: { text: "🎬", key: mek.key } });
                        }

                        const detailMessage = `
*🎬 MOVIE DETAILS*

📽️ *Title*: ${movieDetails.title}
📅 *Release Date*: ${movieDetails.date}
⏱️ *Duration*: ${movieDetails.duration}

🏷️ *Categories*: 
${movieDetails.category.join(", ")}

🎥 *Director*: ${movieDetails.director}
⭐ *TMDB Rating*: ${movieDetails.tmdbRate}

*🌟 CAST*:
${movieDetails.cast.slice(0, 5).map(actor => `• ${actor.name}`).join('\n')}

*🔗 DOWNLOAD OPTIONS*:
${movieDetails.dl_links.map((link, index) => `*${index + 1}. ${link.quality}* (${link.size})`).join('\n')}`;

                        await conn.sendMessage(from, { image: { url: movieDetails.mainImage }, caption: detailMessage }, { quoted: mek });

                        global.movieDownloadDetails = {
                            links: movieDetails.dl_links,
                            title: movieDetails.title
                        };

                    } catch (detailError) {
                        console.error("Movie Detail Fetch Error:", detailError);
                        await reply("❌ Failed to fetch movie details.");
                    }
                } else {
                    if (mek && mek.key) {
                        await conn.sendMessage(from, { react: { text: "❓", key: mek.key } });
                    }
                    reply("Please enter a valid movie number!");
                }
            } else if (global.movieDownloadDetails) {
                const selectedDownloadIndex = parseInt(messageType) - 1;

                if (selectedDownloadIndex >= 0 && selectedDownloadIndex < global.movieDownloadDetails.links.length) {
                    const selectedDownload = global.movieDownloadDetails.links[selectedDownloadIndex];

                    if (mek && mek.key) {
                        await conn.sendMessage(from, { react: { text: "📥", key: mek.key } });
                    }

                    const processingMsg = await reply(`🔄 Preparing download for ${global.movieDownloadDetails.title}...`);

                    try {
                        const downloadResponse = await axios({
                            method: 'get',
                            url: selectedDownload.link,
                            responseType: 'arraybuffer',
                            maxContentLength: Infinity,
                            maxBodyLength: Infinity,
                            headers: { 'User-Agent': 'Mozilla/5.0' }
                        });

                        const sanitizedTitle = global.movieDownloadDetails.title.replace(/[^a-zA-Z0-9]/g, '_').substring(0, 50);
                        const filename = `${sanitizedTitle}_${selectedDownload.quality}.mp4`;
                        const tempFilePath = path.join(__dirname, 'temp', filename);

                        await fs.mkdir(path.join(__dirname, 'temp'), { recursive: true });
                        await fs.writeFile(tempFilePath, downloadResponse.data);

                        if (processingMsg && processingMsg.key) {
                            await conn.sendMessage(from, { delete: processingMsg.key });
                        }

                        await conn.sendMessage(from, {
                            document: { url: tempFilePath },
                            mimetype: 'video/mp4',
                            fileName: filename,
                            caption: `
*🎬 DOWNLOADED MOVIE*

📽️ *Title*: ${global.movieDownloadDetails.title}
📊 *Quality*: ${selectedDownload.quality}
📦 *Size*: ${selectedDownload.size}`
                        }, { quoted: mek });

                        await reply(`✅ *Download Complete*\n📥 File: ${filename}`);

                        setTimeout(async () => {
                            try {
                                await fs.unlink(tempFilePath);
                            } catch (cleanupError) {
                                console.log("Temp file cleanup error:", cleanupError);
                            }
                        }, 5 * 60 * 1000);

                        if (mek && mek.key) {
                            await conn.sendMessage(from, { react: { text: "✅", key: mek.key } });
                        }

                    } catch (downloadError) {
                        console.error("Movie Download Error:", downloadError);

                        if (processingMsg && processingMsg.key) {
                            await conn.sendMessage(from, { delete: processingMsg.key });
                        }

                        let errorMessage = "❌ Download failed. ";
                        if (downloadError.response) {
                            switch (downloadError.response.status) {
                                case 404:
                                    errorMessage += "Download link is no longer valid.";
                                    break;
                                case 403:
                                    errorMessage += "Access to the file is restricted.";
                                    break;
                                case 500:
                                    errorMessage += "Server error occurred.";
                                    break;
                                default:
                                    errorMessage += `HTTP Error: ${downloadError.response.status}`;
                            }
                        } else {
                            errorMessage += "An unexpected error occurred.";
                        }

                        await reply(errorMessage);

                        if (mek && mek.key) {
                            await conn.sendMessage(from, { react: { text: "❌", key: mek.key } });
                        }
                    }

                    delete global.movieDownloadDetails;
                }
            }
        });
    } catch (error) {
        console.error("Movie Search Error:", error);
        await reply("❌ An error occurred during the movie search.");
    }
});
