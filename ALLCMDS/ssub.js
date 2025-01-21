const config = require('../config');
const { cmd } = require('../command');
const axios = require('axios');

cmd({
    pattern: "ssub",
    desc: "Search Sinhala subtitles and download movies.",
    react: "🎬",
    category: "movie",
    filename: __filename
}, async (conn, mek, m, { from, q, reply }) => {
    try {
        if (!q || q.trim() === "") {
            return reply("Please provide a movie name to search for Sinhala subtitles.");
        }

        // Fetch movie search results
        const searchUrl = `https://www.dark-yasiya-api.site/movie/sinhalasub/search?text=${encodeURIComponent(q)}`;
        const searchResponse = await axios.get(searchUrl);
        const { result } = searchResponse.data;

        if (!result || result.data.length === 0) {
            return reply("No Sinhala subtitles found for the given movie. Please try again with a different title.");
        }

        // Display top 20 movies
        const topMovies = result.data.slice(0, 20);
        const movieList = topMovies.map((movie, index) => `${index + 1}. 🎬 *${movie.title} (${movie.year || 'N/A'})*`).join("\n\n");
        const searchMessage = `🎥 *CineSubz Search Results*\n\n🔍 *Results for:* "${q}"\n\n${movieList}\n\n> Reply with a number to get more details about a specific movie.`;

        const imageUrl = topMovies[0]?.image || 'https://i.ibb.co/K5JRNTJ/none-credit22.png';

        const sentMsg = await conn.sendMessage(from, {
            image: { url: imageUrl },
            caption: searchMessage
        }, { quoted: mek });

        const sentMessageId = sentMsg.key.id;

        // Handle user reply for movie details
        const handleMovieDetails = async (messageUpdate) => {
            const userMessage = messageUpdate.messages[0];
            if (!userMessage.message) return;

            const userReply = userMessage.message.conversation || userMessage.message.extendedTextMessage?.text;
            const isReplyToSearch = userMessage.message.extendedTextMessage?.contextInfo.stanzaId === sentMessageId;

            if (isReplyToSearch && /^[0-9]+$/.test(userReply)) {
                const selectedIndex = parseInt(userReply) - 1;
                if (selectedIndex < 0 || selectedIndex >= topMovies.length) {
                    return reply("Invalid selection. Please reply with a valid number.");
                }

                const selectedMovie = topMovies[selectedIndex];
                const detailUrl = `https://www.dark-yasiya-api.site/movie/sinhalasub/movie?url=${encodeURIComponent(selectedMovie.link)}`;
                const detailResponse = await axios.get(detailUrl);
                const movieDetails = detailResponse.data.result.data;

                if (!movieDetails || !movieDetails.dl_links || movieDetails.dl_links.length < 3) {
                    return reply("Download links for the selected movie are not available.");
                }

                const qualities = movieDetails.dl_links.map((link, index) => ({
                    quality: link.quality || ['HDRip 1080p', 'HDRip 720p', 'HDRip 480p'][index],
                    url: link.link.replace('/u/', '/api/file/') + "?download"
                }));

                const detailMessage = `🎥 *${movieDetails.title || 'N/A'}*\n\n` +
                    `*📆 Release:* ${movieDetails.date || 'N/A'}\n` +
                    `*🌎 Country:* ${movieDetails.country || 'N/A'}\n` +
                    `*⏰ Runtime:* ${movieDetails.runtime || 'N/A'}\n\n` +
                    `> Reply with:\n` +
                    `*1* - ${qualities[0]?.quality || '1080p'}\n` +
                    `*2* - ${qualities[1]?.quality || '720p'}\n` +
                    `*3* - ${qualities[2]?.quality || '480p'}`;

                const sentDetailMsg = await conn.sendMessage(from, {
                    image: { url: movieDetails.images[0] || 'https://i.ibb.co/K5JRNTJ/none-credit22.png' },
                    caption: detailMessage
                }, { quoted: mek });

                const handleDownloadRequest = async (downloadUpdate) => {
                    const downloadMessage = downloadUpdate.messages[0];
                    if (!downloadMessage.message) return;

                    const userDownloadReply = downloadMessage.message.conversation || downloadMessage.message.extendedTextMessage?.text;
                    const isReplyToDetails = downloadMessage.message.extendedTextMessage?.contextInfo.stanzaId === sentDetailMsg.key.id;

                    if (isReplyToDetails && /^[1-3]$/.test(userDownloadReply)) {
                        const selectedQuality = parseInt(userDownloadReply) - 1;
                        const selectedLink = qualities[selectedQuality]?.url;

                        if (selectedLink) {
                            await conn.sendMessage(from, {
                                text: "🎥 Downloading your movie... Please wait."
                            }, { quoted: downloadMessage });

                            await conn.sendMessage(from, {
                                document: { url: selectedLink },
                                mimetype: "video/mp4",
                                fileName: `${movieDetails.title || 'Movie'} (${qualities[selectedQuality]?.quality || 'N/A'}).mkv`
                            }, { quoted: downloadMessage });
                        } else {
                            reply("Invalid quality selection or no download link available.");
                        }
                    }
                };

                conn.ev.removeAllListeners('messages.upsert');
                conn.ev.on('messages.upsert', handleDownloadRequest);
            }
        };

        conn.ev.on('messages.upsert', handleMovieDetails);
    } catch (error) {
        console.error(error);
        reply(`An error occurred: ${error.message || 'Please try again later.'}`);
    }
});
