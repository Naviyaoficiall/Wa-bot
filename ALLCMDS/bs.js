const axios = require('axios');
const { cmd } = require('../command');


cmd({
    pattern: "bs2",
    desc: "Search and download Sinhala subtitles or movies.",
    react: "🎬",
    category: "movie",
    filename: __filename
}, async (conn, mek, m, { from, q, reply }) => {
    try {
        if (!q || q.trim() === "") {
            return reply("Please provide a movie name to search.");
        }

        // Search API
        const searchUrl = `https://www.dark-yasiya-api.site/search/baiscope?text=${encodeURIComponent(q)}`;
        const response = await axios.get(searchUrl, { timeout: 10000 });
        const { result } = response.data;

        if (!result || result.data.length === 0) {
            return reply("No movies found for the specified title.");
        }

        const topResults = result.data.slice(0, 10); // Limit to top 10 results
        const resultList = topResults
            .map((item, index) => `${index + 1}. 🎬 *${item.title}*\n📅 Year: ${item.year || 'N/A'}\n🔗 [More Info](${item.link})`)
            .join("\n\n");

        const msg = `🎥 *Baiscope Search Results*\n\n🔍 *Search Results for:* *${q}*\n\n${resultList}\n\n> Reply with a number to download the movie.`;
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
                try {
                    const downloadResponse = await axios.get(downloadUrl, { timeout: 10000 });
                    const { result: downloadResult } = downloadResponse.data;

                    if (!downloadResult || !downloadResult.download_link) {
                        return reply("Failed to retrieve the download link. Please try again later.");
                    }

                    // Notify the user that the download is starting
                    await conn.sendMessage(from, {
                        text: "🎥 Downloading Movie... Please wait. This might take a few minutes."
                    }, { quoted: mek });

                    // Send the movie file to the user
                    await conn.sendMessage(from, {
                        document: { url: downloadResult.download_link },
                        mimetype: "video/mp4",
                        fileName: `${selectedItem.title}.mp4`
                    }, { quoted: mek });

                    reply("🎬 Movie downloaded successfully!");
                } catch (downloadError) {
                    console.error("Error during download process:", downloadError);
                    reply("An error occurred while trying to download the movie. Please try again later.");
                }
            }
        };

        conn.ev.on('messages.upsert', handleUserResponse);
    } catch (error) {
        console.error("Error during search process:", error);
        reply("An unexpected error occurred. Please try again later.");
    }
});
