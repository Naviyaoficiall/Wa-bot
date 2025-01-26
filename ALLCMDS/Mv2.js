const { sinhalaSub } = require("mrnima-moviedl");
const axios = require('axios');
const { cmd } = require('../command');
const fetch = require('node-fetch'); // Thumbnail එක download කරන්න

cmd({
  pattern: "sinhalasub",
  alias: ['mv5'],
  react: '🧚',
  category: "download",
  desc: "Search movies on sinhalasub and get download links",
  filename: __filename
}, async (conn, message, msg, { from, q, reply }) => {
  try {
    if (!q) {
      return await reply("*Please provide a search query! (e.g., Deadpool)*");
    }

    const sinhalaSubAPI = await sinhalaSub();
    const searchResults = await sinhalaSubAPI.search(q);
    const topResults = searchResults.result.slice(0, 10);

    if (!topResults || topResults.length === 0) {
      return await reply("No results found for: " + q);
    }

    let resultMessage = "📽️ *Search Results for* \"" + q + "\":\n\n";
    topResults.forEach((result, index) => {
      resultMessage += '*' + (index + 1) + ".* " + result.title + "\n🔗 Link: " + result.link + "\n\n";
    });

    const sentMessage = await conn.sendMessage(from, { text: resultMessage }, { quoted: message });
    const messageId = sentMessage.key.id;

    conn.ev.on('messages.upsert', async msgUpdate => {
      const newMsg = msgUpdate.messages[0];
      if (!newMsg.message) return;

      const userText = newMsg.message.conversation || newMsg.message.extendedTextMessage?.text;
      const isReplyToBot = newMsg.message.extendedTextMessage && newMsg.message.extendedTextMessage.contextInfo.stanzaId === messageId;

      if (isReplyToBot) {
        const selectedNumber = parseInt(userText.trim());
        if (!isNaN(selectedNumber) && selectedNumber > 0 && selectedNumber <= topResults.length) {
          const selectedResult = topResults[selectedNumber - 1];
          const detailsUrl = 'https://api-site-2.vercel.app/api/sinhalasub/movie?url=' + encodeURIComponent(selectedResult.link);

          try {
            const detailsResponse = await axios.get(detailsUrl);
            const movieDetails = detailsResponse.data.result;
            const downloadLinks = movieDetails.dl_links || [];

            if (downloadLinks.length === 0) {
              return await reply("No PixelDrain links found.");
            }

            let linksMessage = "🎥 *" + movieDetails.title + "*\n\n";
            linksMessage += "*Available PixelDrain Download Links:*\n";
            downloadLinks.forEach((link, index) => {
              linksMessage += '*' + (index + 1) + ".* " + link.quality + " - " + link.size + "\n🔗 Link: " + link.link + "\n\n";
            });

            const downloadMessage = await conn.sendMessage(from, { text: linksMessage }, { quoted: newMsg });
            const downloadMessageId = downloadMessage.key.id;

            conn.ev.on("messages.upsert", async downloadMsgUpdate => {
              const downloadMsg = downloadMsgUpdate.messages[0];
              if (!downloadMsg.message) return;

              const downloadText = downloadMsg.message.conversation || downloadMsg.message.extendedTextMessage?.text;
              const isReplyToDownloadMessage = downloadMsg.message.extendedTextMessage && downloadMsg.message.extendedTextMessage.contextInfo.stanzaId === downloadMessageId;

              if (isReplyToDownloadMessage) {
                const downloadNumber = parseInt(downloadText.trim());
                if (!isNaN(downloadNumber) && downloadNumber > 0 && downloadNumber <= downloadLinks.length) {
                  const selectedLink = downloadLinks[downloadNumber - 1];
                  const fileId = selectedLink.link.split('/').pop();
                  await conn.sendMessage(from, { react: { text: '⬇️', key: message.key } });

                  const downloadUrl = "https://pixeldrain.com/api/file/" + fileId;
                  await conn.sendMessage(from, { react: { text: '⬆', key: message.key } });

                  // 🔥 Fetch thumbnail image
                  const thumbnailBuffer = await (await fetch(movieDetails.image)).buffer();

                  await conn.sendMessage(from, {
                    document: { url: downloadUrl },
                    mimetype: "video/mp4",
                    fileName: movieDetails.title + ".mp4",
                    caption: movieDetails.title, // ✅ Only movie title
                    jpegThumbnail: thumbnailBuffer // ✅ Attach thumbnail
                  }, { quoted: downloadMsg });

                  await conn.sendMessage(from, { react: { text: '✅', key: message.key } });
                } else {
                  await reply("Invalid selection. Please reply with a valid number.");
                }
              }
            });
          } catch (error) {
            console.error("Error fetching movie details:", error);
            await reply("An error occurred while fetching movie details. Please try again.");
          }
        } else {
          await reply("Invalid selection. Please reply with a valid number.");
        }
      }
    });
  } catch (error) {
    console.error("Error during search:", error);
    reply("*An error occurred while searching!*");
  }
});
