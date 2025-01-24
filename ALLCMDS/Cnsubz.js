const axios = require('axios');
const { cmd, commands } = require('../command');

cmd({
    'pattern': 'cinesubz',
    'react': '🎥',
    'category': 'download',
    'desc': 'Search movies, get movie info, and download links from Cinesubz using the free API',
    'filename': __filename
}, async (bot, message, args, details) => {
    const { from, q, reply } = details;
    const API_KEY = 'pramashi01';

    try {
        if (!q) return await reply('Please provide a search query!\n\nExample: *!cinesubz Avatar*');

        // Search movies
        const searchUrl = `https://darksadas-yt-cinezsub-search.vercel.app/?query=${encodeURIComponent(q)}&apikey=${API_KEY}`;
        const searchResponse = await axios.get(searchUrl);

        if (!searchResponse.data || searchResponse.data.length === 0) {
            return await reply('No results found for your search query!');
        }

        const results = searchResponse.data.slice(0, 5); // Limit to 5 results
        let responseText = `*🎥 Cinesubz Search Results for:* _${q}_\n\n`;

        results.forEach((movie, index) => {
            responseText += `*${index + 1}.* ${movie.title}\n🔗 Link: ${movie.url}\n\n`;
        });

        responseText += 'Reply with the number of the movie to get more info.';

        const sentMessage = await bot.sendMessage(from, { text: responseText }, { quoted: message });
        const sentMessageId = sentMessage.key.id;

        // Listen for user reply
        bot.ev.on('messages.upsert', async upsert => {
            const incomingMessage = upsert.messages[0];
            if (!incomingMessage.message) return;

            const text = incomingMessage.message.conversation || incomingMessage.message.extendedTextMessage?.text;
            const isReplyToSentMessage = incomingMessage.messageContextInfo?.stanzaId === sentMessageId;

            if (isReplyToSentMessage) {
                const selectedNumber = parseInt(text.trim());
                if (!isNaN(selectedNumber) && selectedNumber > 0 && selectedNumber <= results.length) {
                    const selectedMovie = results[selectedNumber - 1];

                    // Fetch movie info
                    const infoUrl = `https://darksadas-yt-cineszub-info.vercel.app/?url=${encodeURIComponent(selectedMovie.url)}&apikey=${API_KEY}`;
                    const infoResponse = await axios.get(infoUrl);

                    if (infoResponse.data) {
                        const movieInfo = infoResponse.data;
                        let infoText = `*🎬 ${movieInfo.title}*\n\n*🎭 Genres:* ${movieInfo.genres || 'N/A'}\n*📅 Released:* ${movieInfo.release || 'N/A'}\n*📜 Description:* ${movieInfo.description || 'N/A'}\n\n*🔗 Download Link:*\n${movieInfo.download || 'N/A'}`;

                        await bot.sendMessage(from, { text: infoText }, { quoted: incomingMessage });
                    } else {
                        await reply('*Error fetching movie info. Please try again.*');
                    }
                } else {
                    await reply('*Invalid selection. Please reply with a valid number.*');
                }
            }
        });
    } catch (error) {
        console.error(error);
        await reply('*Error occurred while processing your request. Please try again later.*');
    }
});
