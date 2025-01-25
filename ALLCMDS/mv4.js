const { sinhalaSub } = require("mrnima-moviedl");
const axios = require('axios');
const fs = require('fs');
const path = require('path');
const { cmd } = require('../command');

cmd({
  pattern: "sinhalasub",
  alias: ['mvs'],
  react: '💚',
  category: "download",
  desc: "Search movies on SinhalaSub and get download links",
  filename: __filename
}, async (conn, message, msg, { from, q, reply }) => {
  try {
    if (!q) {
      return await reply("*Please provide a search query! (e.g., Deadpool)*");
    }

    // Search for movies
    const sinhalaSubAPI = await sinhalaSub();
    const searchResults = await sinhalaSubAPI.search(q);
    const topResults = searchResults.result.slice(0, 10);

    if (!topResults || topResults.length === 0) {
      return await reply("No results found for: " + q);
    }

    let resultMessage = "📽️ *Search Results for* \"" + q + "\":\n\n";
    topResults.forEach((result, index) => {
      resultMessage += `*${index + 1}.* ${result.title}\n🔗 Link: ${result.link}\n\n`;
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
              return await reply("No download links found.");
            }

            let linksMessage = `🎥 *${movieDetails.title}*\n\n`;
            linksMessage += "*Available Download Links:*\n";
            downloadLinks.forEach((link, index) => {
              linksMessage += `*${index + 1}.* ${link.quality} - ${link.size}\n🔗 Link: ${link.link}\n\n`;
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
                  const downloadUrl = selectedLink.link;
                  const filePath = path.join(__dirname, `${movieDetails.title} - ${selectedLink.quality}.mp4`);

                  await reply("📥 *Downloading movie... Please wait!*");

                  try {
                    const response = await axios({ url: downloadUrl, method: 'GET', responseType: 'stream' });
                    const writer = fs.createWriteStream(filePath);
                    response.data.pipe(writer);

                    writer.on('finish', async () => {
                      await reply("✅ *Download complete! Uploading to WhatsApp...*");

                      await conn.sendMessage(from, {
                        document: fs.readFileSync(filePath),
                        mimetype: "video/mp4",
                        fileName: `${movieDetails.title} - ${selectedLink.quality}.mp4`,
                        caption: `🎬 *${movieDetails.title}*\n📀 Quality: ${selectedLink.quality}\n\n🚀 Downloaded via SinhalaSub`,
                      }, { quoted: downloadMsg });

                      fs.unlinkSync(filePath);
                      await conn.sendMessage(from, { react: { text: '✅', key: message.key } });
                    });

                    writer.on('error', async () => {
                      await reply("❌ *Failed to download movie. Please try again!*");
                    });
                  } catch (error) {
                    console.error("Error downloading movie:", error);
                    await reply("❌ *An error occurred while downloading. Please try again!*");
                  }
                } else {
                  await reply("Invalid selection. Please reply with a valid number.");
                }
              }
            });
          } catch (error) {
            console.error("Error fetching movie details:", error);
            await reply("❌ *An error occurred while fetching movie details. Please try again!*");
          }
        } else {
          await reply("Invalid selection. Please reply with a valid number.");
        }
      }
    });
  } catch (error) {
    console.error("Error during search:", error);
    reply("❌ *An error occurred while searching!*");
  }
});
