const axios = require('axios');
const { cmd } = require('../command');




cmd({
  pattern: "tiktokk",	
  react: '🎥',
  category: "download",
  desc: "Download random TikTok videos based on a query",
  filename: __filename
},
async (conn, m, mek, { from, q, reply }) => {
  try {
    // Check if query is provided
    if (!q) {
      return reply('⚠️ Please provide a query to search for TikTok videos.');
    }

    // API URL
    const apiUrl = `https://mr-rashmika-apis.vercel.app/random-tiktok?apikey=MR.RASHMIKA&query=${encodeURIComponent(q)}`;

    // Fetch video data
    const response = await axios.get(apiUrl);
    const { video_url, caption } = response.data;

    // Check if video URL is present
    if (!video_url) {
      return reply('⚠️ Unable to fetch video. Please try with a different query.');
    }

    // Send video to the chat
    await conn.sendMessage(from, {
      video: { url: video_url },
      caption: `🎬 *TikTok Video Downloaded*\n\n*🎭 Caption:* ${caption || "No caption available."}\n\n*Query:* ${q}`
    }, { quoted: mek });

  } catch (err) {
    console.error(err);
    reply('❌ An error occurred while fetching the TikTok video. Please try again.');
  }
});
