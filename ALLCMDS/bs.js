const axios = require('axios');
const { cmd } = require('../command');



cmd({
    pattern: "bs2",
    desc: "Search and download Sinhala subtitles from Baiscope.",
    react: "🎬",
    category: "movie",
    filename: __filename
}, async (conn, mek, m, { from, q, reply }) => {
    try {
        if (!q || q.trim() === "") {
            return reply("Please provide a movie name to search for Sinhala subtitles.");
        }

        // Search API
        const searchUrl = `https://www.dark-yasiya-api.site/search/baiscope?text=${encodeURIComponent(q)}`;
        const response = await axios.get(searchUrl, { timeout: 10000 });
        const { result } = response.data;

        if (!result || result.data.length === 0) {
            return reply("No Sinhala subtitles found for the specified movie.");
        }

        const topResults = result.data.slice(0, 10); // Limit to top 10 results
        const resultList = topResults
            .map((item, index) => `${index + 1}. 🎬 *${item.title}*\n📅 Year: ${item.year || 'N/A'}\n🔗 [More Info](${item.link})`)
            .join("\n\n");

        const msg = `🎥 *Baiscope Search Results*\n\n🔍 *Search Results for:* *${q}*\n\n${resultList}\n\n> Reply with a number to download the subtitle.`;
        const sentMsg = await conn.sendMessage(from, { text: msg }, { quoted: mek });

        const messageID = sentMsg.key.id;

        const handleUserResponse = async (messageUpdate) => {
            const mek = messageUpdate.messages[0];
            if (!mek.message) return;

            const userReply = mek.message.conversation || mek.message.extendedTextMessage?.text;
            const isReplyToSentMsg = mek.message.extendedTextMessage?.contextInfo.stanzaId === messageID;

            if (isReplyToSentMsg && /^[0-9]+$/.test(userReply)) {
                const selectedIndex = parseInt(userReply) - 1;
                if (selectedIndex < 0 || selectedIndex >= topResults.length) {
                    return reply("Invalid selection. Please reply with a valid number.");
                }

                const selectedItem = topResults[selectedIndex];

                // Download API
                const downloadUrl = `https://www.dark-yasiya-api.site/download/baiscope?url=${encodeURIComponent(selectedItem.link)}`;
                const downloadResponse = await axios.get(downloadUrl);
                const { download_link } = downloadResponse.data.result;

                if (!download_link) {
                    return reply("Subtitle download link is not available. Please try again later.");
                    
                }

                await conn.sendMessage(from, {
                    text: "🎥 Downloading Movie... Please wait. This might take a few minutes."
                }, { quoted: mek });

                await conn.sendMessage(from, {
                    document: { url: download_link },
                    mimetype: "application/zip",
                    fileName: `${selectedItem.title} - Sinhala Subtitle.zip`
                }, { quoted: mek });

                reply("🎬 Subtitle downloaded successfully!");
            }
        };

        conn.ev.on('messages.upsert', handleUserResponse);
    } catch (error) {
        console.error(error);
        if (error.code === 'ECONNRESET' || error.code === 'ECONNABORTED') {
            reply("Connection was interrupted. Please try again later.");
        } else {
            reply("An unexpected error occurred. Please try again later.");
        }
    }
});
