const axios = require("axios");
const fs = require("fs");
const { cmd } = require("../command");

const API_KEY = "pramashi01";

cmd({
  pattern: "cinesubz",
  alias: ["css"],
  react: "💚",
  category: "download",
  desc: "Download full movies from Cinesubz and send on WhatsApp",
  filename: __filename,
}, async (conn, message, msg, { from, q, reply }) => {
  try {
    if (!q) return await reply("*Please provide a movie name! (e.g., Jawan)*");

    // 🔍 **Search movies on Cinesubz**
    const searchUrl = `https://darksadas-yt-cinezsub-search.vercel.app/?query=${encodeURIComponent(q)}&apikey=${API_KEY}`;
    const searchRes = await axios.get(searchUrl);
    const movies = searchRes.data.result.slice(0, 10);

    if (!movies.length) return await reply("No results found for: " + q);

    // 📜 **Display Search Results**
    let searchMessage = "📽️ *Search Results for* \"" + q + "\":\n\n";
    movies.forEach((m, index) => {
      searchMessage += `*${index + 1}.* ${m.title}\n🔗 Link: ${m.link}\n\n`;
    });

    const sentMessage = await conn.sendMessage(from, { text: searchMessage }, { quoted: message });
    const messageId = sentMessage.key.id;

    // 📩 **Handle user reply**
    conn.ev.on("messages.upsert", async (msgUpdate) => {
      const newMsg = msgUpdate.messages[0];
      if (!newMsg.message) return;

      const userText = newMsg.message.conversation || newMsg.message.extendedTextMessage?.text;
      const isReplyToBot = newMsg.message.extendedTextMessage && newMsg.message.extendedTextMessage.contextInfo.stanzaId === messageId;

      if (isReplyToBot) {
        const selectedIndex = parseInt(userText.trim());
        if (!isNaN(selectedIndex) && selectedIndex > 0 && selectedIndex <= movies.length) {
          const selectedMovie = movies[selectedIndex - 1];

          // 📜 **Fetch Movie Details**
          const movieInfoUrl = `https://darksadas-yt-cineszub-info.vercel.app/?url=${encodeURIComponent(selectedMovie.link)}&apikey=${API_KEY}`;
          const movieInfoRes = await axios.get(movieInfoUrl);
          const movieDetails = movieInfoRes.data.result;

          // 📥 **Get Download Link**
          const dlUrl = `https://darksadas-yt-cinezsub-dl.vercel.app/?url=${encodeURIComponent(selectedMovie.link)}&apikey=${API_KEY}`;
          const dlRes = await axios.get(dlUrl);
          const downloadLink = dlRes.data.result.link;

          // **Send downloading reaction**
          await conn.sendMessage(from, {
            react: { text: "⬇️", key: message.key },
          });

          // **Download movie file**
          const movieFile = `./${movieDetails.title}.mp4`;
          const writer = fs.createWriteStream(movieFile);

          const response = await axios({
            url: downloadLink,
            method: "GET",
            responseType: "stream",
          });

          response.data.pipe(writer);

          writer.on("finish", async () => {
            await conn.sendMessage(from, {
              react: { text: "⬆", key: message.key },
            });

            // **Send the movie file on WhatsApp**
            await conn.sendMessage(from, {
              document: fs.readFileSync(movieFile),
              mimetype: "video/mp4",
              fileName: movieDetails.title + ".mp4",
              caption: `🎥 *${movieDetails.title}*\n📅 *Year:* ${movieDetails.year}\n📥 *Size:* ~1.5GB\n🔗 *Source:* ${selectedMovie.link}`,
            }, { quoted: newMsg });

            await conn.sendMessage(from, {
              react: { text: "✅", key: message.key },
            });

            // **Delete the file after sending**
            fs.unlinkSync(movieFile);
          });
        } else {
          await reply("Invalid selection. Please reply with a valid number.");
        }
      }
    });
  } catch (error) {
    console.error("Error fetching movie details:", error);
    await reply("An error occurred while downloading the movie. Please try again.");
  }
});
