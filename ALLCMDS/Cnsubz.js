const axios = require('axios');
const { cmd } = require('../command');

cmd({
    pattern: 'cinesubz',
    react: '🧚',
    category: 'search',
    desc: 'Search and fetch Cinesubz movie details',
    filename: __filename
}, async (bot, message, args, details) => {
    const { from, q, reply } = details;

    // API Key and Endpoint
    const API_KEY = 'pramashi01';
    const SEARCH_API = `https://darksadas-yt-cinezsub-search.vercel.app/?query=${encodeURIComponent(q)}&apikey=${API_KEY}`;

    try {
        // Ensure search query is provided
        if (!q) return await reply('*Please provide a search query!*');

        // Make API Request
        const searchResponse = await axios.get(SEARCH_API);

        // Validate response
        if (!searchResponse.data || typeof searchResponse.data !== 'object') {
            return await reply('*Invalid API response. Please try again later.*');
        }

        // Check if data exists
        const results = Array.isArray(searchResponse.data) ? searchResponse.data : [searchResponse.data];
        if (results.length === 0) {
            return await reply('*No results found for:* ' + q);
        }

        // Parse and format search results
        let responseText = `🎬 *Search Results for:* _${q}_\n\n`;
        results.slice(0, 5).forEach((movie, index) => {
            responseText += `*${index + 1}.* ${movie.title}\n🔗 Info: ${movie.info}\n⬇️ Download: ${movie.download}\n\n`;
        });

        // Send results to the user
        await reply(responseText);

    } catch (error) {
        console.error('Cinesubz Plugin Error:', error.response?.data || error.message);

        if (error.response?.status === 403) {
            await reply('*Error:* Forbidden (403). Please check the API key.');
        } else if (error.response?.status === 404) {
            await reply('*Error:* Not Found (404). The requested resource could not be found.');
        } else if (error.response?.status === 500) {
            await reply('*Error:* Server Error (500). Please try again later.');
        } else {
            await reply('*Error occurred while processing your request. Please try again later.*');
        }
    }
});
