const axios = require('axios');
const { cmd } = require('../command');

cmd({
    pattern: "ssub",
    desc: "Search and show top Sinhala subtitles for movies.",
    react: "🎬",
    category: "movie",
    filename: __filename
}, async (conn, mek, m, { from, q, reply }) => {
    try {
        if (!q || q.trim() === "") {
            return reply("Please provide a movie name to search for Sinhala subtitles.");
        }

        const searchUrl = `https://www.dark-yasiya-api.site/movie/sinhalasub/search?text=${encodeURIComponent(q)}`;

        // Fetch search results
        const response = await axios.get(searchUrl);
        const { result } = response.data;

        if (!result || result.data.length === 0) {
            return reply("No Sinhala subtitles found for the specified movie.");
        }

        const topFilms = result.data.slice(0, 10); // Show top 10 results
        const filmsList = topFilms
            .map((film, index) => `${index + 1}. 🎬 *${film.title} (${film.year || 'N/A'})*`)
            .join("\n\n");

        const msg = `🎥 *Movie Search Results*\n\n🔍 Results for: *${q}*\n\n${filmsList}\n\n> Reply with a number to get details about a specific movie.`;

        const imageUrl = topFilms[0]?.image || 'https://i.ibb.co/K5JRNTJ/none-credit22.png';
        const sentMsg = await conn.sendMessage(from, { 
            image: { url: imageUrl }, 
            caption: msg 
        }, { quoted: mek });

        const messageID = sentMsg.key.id;

        // Handle user response
        const handleUserResponse = async (messageUpdate) => {
            const mek = messageUpdate.messages[0];
            if (!mek.message) return;

            const userReply = mek.message.conversation || mek.message.extendedTextMessage?.text;
            const isReplyToSentMsg = mek.message.extendedTextMessage?.contextInfo.stanzaId === messageID;

            if (isReplyToSentMsg && /^[0-9]+$/.test(userReply)) {
                const selectedIndex = parseInt(userReply) - 1;
                if (selectedIndex < 0 || selectedIndex >= topFilms.length) {
                    return reply("Invalid selection. Please reply with a valid number.");
                }

                const selectedFilm = topFilms[selectedIndex];
                const detailResponse = await axios.get(`https://www.dark-yasiya-api.site/movie/sinhalasub/movie?url=${selectedFilm.link}`);
                const movieDetails = detailResponse.data.result.data;

                if (!movieDetails || !movieDetails.dl_links || movieDetails.dl_links.length === 0) {
                    return reply("Download links are not available for this movie.");
                }

                const downloadOptions = movieDetails.dl_links.map((link, idx) => `*${idx + 1}.* ${link.quality || 'N/A'}`).join("\n");

                const detailsMsg = `🎥 *${movieDetails.title || 'N/A'}*\n\n📆 Release Date: ${movieDetails.date || 'N/A'}\n🌎 Country: ${movieDetails.country || 'N/A'}\n⏰ Runtime: ${movieDetails.runtime || 'N/A'}\n\n🔗 Select a download option:\n${downloadOptions}`;

                const sentDetailMsg = await conn.sendMessage(from, {
                    image: { url: movieDetails.images[0] || imageUrl },
                    caption: detailsMsg
                }, { quoted: mek });

                const handleDownloadResponse = async (messageUpdate) => {
                    const mek = messageUpdate.messages[0];
                    if (!mek.message) return;

                    const userReply = mek.message.conversation || mek.message.extendedTextMessage?.text;
                    const isReplyToSentDetailMsg = mek.message.extendedTextMessage?.contextInfo.stanzaId === sentDetailMsg.key.id;

                    if (isReplyToSentDetailMsg && /^[0-9]+$/.test(userReply)) {
                        const selectedLinkIndex = parseInt(userReply) - 1;
                        if (selectedLinkIndex < 0 || selectedLinkIndex >= movieDetails.dl_links.length) {
                            return reply("Invalid option. Please select a valid download number.");
                        }

                        const downloadLink = movieDetails.dl_links[selectedLinkIndex].link;

                        if (downloadLink) {
                            await conn.sendMessage(from, {
                                text: "🎥 Downloading movie... Please wait."
                            }, { quoted: mek });

                            // Send movie file
                            await conn.sendMessage(from, {
                                document: { url: downloadLink },
                                mimetype: "video/mp4",
                                fileName: `${movieDetails.title || 'Movie'} (${movieDetails.dl_links[selectedLinkIndex].quality || 'Unknown'}).mkv`
                            }, { quoted: mek });
                        } else {
                            reply("Download link is invalid or unavailable.");
                        }
                    }
                };

                conn.ev.removeAllListeners('messages.upsert');
                conn.ev.on('messages.upsert', handleDownloadResponse);
            }
        };

        conn.ev.on('messages.upsert', handleUserResponse);
    } catch (error) {
        console.error(error);
        return reply("An error occurred while processing your request. Please try again later.");
    }
});
