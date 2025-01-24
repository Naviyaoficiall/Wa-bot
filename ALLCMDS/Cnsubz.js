const axios = require('axios');
const { cmd } = require('../command');

cmd({
    pattern: 'cinesubz',
    react: '🎬',
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

        // Log response for debugging
        console.log('API Response:', searchResponse.data);

        // Check and process the response data
        if (!Array.isArray(searchResponse.data) || searchResponse.data.length === 0) {
            return await reply('*No results found for:* ' + q);
        }

        // Parse and format search results
        let responseText = `🎬 *Search Results for:* _${q}_\n\n`;
        searchResponse.data.slice(0, 5).forEach((movie, index) => {
            const title = movie.title || 'N/A';
            const infoLink = movie.info || 'N/A';
            const downloadLink = movie.download || 'N/A';

            responseText += `*${index + 1}.* ${title}\n🔗 Info: ${infoLink}\n⬇️ Download: ${downloadLink}\n\n`;
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
