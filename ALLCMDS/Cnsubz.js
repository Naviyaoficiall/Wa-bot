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
        const response = await axios.get(SEARCH_API);

        // Log API Response
        console.log('API Response:', response.data);

        // Check if status is true and data exists
        if (!response.data.status || !Array.isArray(response.data.data) || response.data.data.length === 0) {
            return await reply(`*No results found for:* ${q}`);
        }

        // Extract movie data
        const movieData = response.data.data;

        // Format and send results
        let responseText = `🎬 *Search Results for:* _${q}_\n\n`;
        movieData.slice(0, 5).forEach((movie, index) => {
            const title = movie.title || 'N/A';
            const imdb = movie.imdb || 'N/A';
            const year = movie.year || 'N/A';
            const link = movie.link || 'N/A';
            const shortDesc = movie.short_desc || 'N/A';

            responseText += `*${index + 1}.* ${title}\n📆 Year: ${year}\n⭐ IMDb: ${imdb}\n🔗 Link: ${link}\n📝 Description: ${shortDesc}\n\n`;
        });

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
