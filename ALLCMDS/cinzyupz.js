const axios = require("axios");
const { cmd } = require("../command");

const API_KEY = "pramashi01";

cmd({
  pattern: "mvdl3",
  alias: ["moviedl"],
  react: "🎬",
  category: "download",
  desc: "Download movie from CineSubz",
  filename: __filename
}, async (conn, message, msg, { from, q, reply }) => {
  try {
    if (!q) return await reply("*Please provide a search query or CineSubz movie link!*");

    let movieUrl = "";

    // Check if the input is a search query or direct movie link
    if (q.includes("cinesubz.co/movies/")) {
      movieUrl = q;
    } else {
      // Search for the movie
      const searchRes = await axios.get(`https://darksadas-yt-cinezsub-search.vercel.app/?query=${encodeURIComponent(q)}&apikey=${API_KEY}`);
      if (!searchRes.data.length) return await reply("*No results found!*");

      movieUrl = searchRes.data[0].link;
    }

    // Get movie info
    const infoRes = await axios.get(`https://darksadas-yt-cineszub-info.vercel.app/?url=${movieUrl}&apikey=${API_KEY}`);
    const movieData = infoRes.data;
    if (!movieData.download_link) return await reply("*No download link found!*");

    // Get direct download link
    const dlRes = await axios.get(`https://darksadas-yt-cinezsub-dl.vercel.app/?url=${movieData.download_link}&apikey=${API_KEY}`);
    const downloadLink = dlRes.data.direct_link;
    if (!downloadLink) return await reply("*Failed to fetch direct download link!*");

    // Send download link
    let msgText = `🎬 *${movieData.title}*\n\n`;
    msgText += `📅 *Year:* ${movieData.year || "Unknown"}\n`;
    msgText += `⭐ *IMDB Rating:* ${movieData.rating || "Unknown"}\n`;
    msgText += `🔗 *Download Link:* [Click here](${downloadLink})`;

    await conn.sendMessage(from, { text: msgText }, { quoted: message });

  } catch (error) {
    console.error("Error:", error);
    reply("*An error occurred while fetching the movie!*");
  }
});
