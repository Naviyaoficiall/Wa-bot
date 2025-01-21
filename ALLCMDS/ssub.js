const config = require('../config');
const { cmd, commands } = require('../command');
const { fetchJson, getBuffer, sleep, runtime, Json } = require('../lib/functions');
const axios = require('axios');

cmd({
    pattern: "ssub",
    desc: "Search and show top Sinhala subtitles for films.",
    react: "🎬",
    category: "movie",
    filename: __filename
}, async (conn, mek, m, { from, q, reply }) => {
    try {
        if (!q || q.trim() === "") {
            return reply("Please provide a movie name to search for Sinhala subtitles.");
        }

        const searchUrl = `https://www.dark-yasiya-api.site/movie/sinhalasub/search?text=${encodeURIComponent(q)}`;
        const response = await axios.get(searchUrl);
        const { result } = response.data;

        if (!result || result.data.length === 0) {
            return reply("Sorry, I couldn't find any Sinhala subtitles for the movie. Please check the title or try again later.");
        }

        const topFilms = result.data.slice(0, 20);
        const filmsList = topFilms.map((film, index) => `${index + 1}. 🎬 *${film.title} (${film.year})*`).join("\n\n");

        const msg = `🎥 *CineSubz Movie Search*\n\n🔍 *Search Results for:* *${q}*\n\n${filmsList}\n\n> Reply with a number to get details of a specific movie.`;
        const imageUrl = topFilms[0]?.image || 'https://i.ibb.co/K5JRNTJ/none-credit22.png';

        const sentMsg = await conn.sendMessage(from, {
            image: { url: imageUrl },
            caption: msg
        }, { quoted: mek });

        const messageID = sentMsg.key.id;

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

                if (!movieDetails || !movieDetails.dl_links || movieDetails.dl_links.length < 3) {
                    return reply("Sorry, download links for the movie are not available.");
                }

                const quality = movieDetails.dl_links[0]?.link;
                const quality1 = movieDetails.dl_links[1]?.link;
                const quality2 = movieDetails.dl_links[2]?.link;

                let pp = quality ? quality.replace('/u/', '/api/file/') + "?download" : null;
                let pp1 = quality1 ? quality1.replace('/u/', '/api/file/') + "?download" : null;
                let pp2 = quality2 ? quality2.replace('/u/', '/api/file/') + "?download" : null;

                const detailedMsg = `🎥 ᴀᴘᴇx ᴄɪɴᴇᴍᴀ 🎬

*☘️ Title:* ${movieDetails.title || 'N/A'} 
*📆 Release:* ${movieDetails.date || 'N/A'}
*🌎 Country:* ${movieDetails.country || 'N/A'}
*⏰ Runtime:* ${movieDetails.runtime || 'N/A'}

> Reply with:
*3* - HDRip 480p
*4* - HDRip 720p
*5* - HDRip 1080p`;

                const sentDetailMsg = await conn.sendMessage(from, {
                    image: { url: movieDetails.images[0] || 'https://i.ibb.co/K5JRNTJ/none-credit22.png' },
                    caption: detailedMsg
                }, { quoted: mek });

                const handleDetailResponse = async (messageUpdate) => {
                    const mek = messageUpdate.messages[0];
                    if (!mek.message) return;

                    const userReply = mek.message.conversation || mek.message.extendedTextMessage?.text;
                    const isReplyToSentMsg = mek.message.extendedTextMessage?.contextInfo.stanzaId === sentDetailMsg.key.id;

                    if (isReplyToSentMsg) {
                        const videoIndex = userReply === '3' ? 2 : userReply === '4' ? 1 : userReply === '5' ? 0 : null;
                        const videoLink = [pp2, pp1, pp][videoIndex];

                        if (videoLink) {
                            // Notify user that the movie is being downloaded
                            await conn.sendMessage(from, {
                                text: "🎥 Downloading Movie... Please wait."
                            }, { quoted: mek });

                            // Send the movie file
                            await conn.sendMessage(from, {
                                document: { url: videoLink },
                                mimetype: "video/mp4",
                                fileName: `${movieDetails.title} (${userReply === '3' ? '480p' : userReply === '4' ? '720p' : '1080p'}).mkv`
                            }, { quoted: mek });
                        } else {
                            reply("Invalid option or no download link available.");
                        }
                    }
                };

                conn.ev.removeAllListeners('messages.upsert');
                conn.ev.on('messages.upsert', handleDetailResponse);
            }
        };

        conn.ev.on('messages.upsert', handleUserResponse);
    } catch (e) {
        console.error(e);
        reply(`An error occurred: ${e.message || e}`);
    }
});
