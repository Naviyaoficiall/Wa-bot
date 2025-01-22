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

        const searchUrl = `https://www.dark-yasiya-api.site/search/baiscope?text=${encodeURIComponent(q)}`;

        const fetchWithRetry = async (url, retries = 3, timeout = 30000) => {
            for (let attempt = 0; attempt < retries; attempt++) {
                try {
                    const response = await axios.get(url, { timeout });
                    return response.data;
                } catch (error) {
                    if (attempt === retries - 1 || error.code !== 'ECONNABORTED') {
                        throw error;
                    }
                    console.log(`Retrying... (${attempt + 1}/${retries})`);
                }
            }
        };

        const data = await fetchWithRetry(searchUrl);

        if (!data.result || data.result.data.length === 0) {
            return reply("No movies found for the specified title.");
        }

        const topResults = data.result.data.slice(0, 10);
        const resultList = topResults
            .map((item, index) => `${index + 1}. 🎬 *${item.title}*\n📅 Year: ${item.year || 'N/A'}\n🔗 [More Info](${item.link})`)
            .join("\n\n");

        reply(`🎥 *Baiscope Search Results*\n\n🔍 *Search Results for:* *${q}*\n\n${resultList}`);
    } catch (error) {
        if (error.code === 'ECONNABORTED') {
            reply("⚠️ The request timed out. The server may be busy. Please try again later.");
        } else {
            reply("⚠️ An unexpected error occurred. Please try again.");
            console.error("Error during search process:", error);
        }
    }
});
