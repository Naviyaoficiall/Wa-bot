const { sinhalaSub } = require("mrnima-moviedl");
const axios = require('axios');
const { cmd } = require('../command');
const { proto, generateWAMessageFromContent } = require('@whiskeysockets/baileys');

cmd({
  pattern: "sinhalasub2",
  alias: ['mv'],
  react: '📑',
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

    let sections = [
      {
        title: "📽️ Movie Search Results",
        rows: topResults.map((result, index) => ({
          header: "🎬 Movie",
          title: result.title,
          description: "Click to get download links",
          id: `movie_${index}`
        }))
      }
    ];

    let interactiveMessage = {
      body: proto.Message.InteractiveMessage.Body.create({
        text: `📽️ *Search Results for* "${q}"\n\nSelect a movie to get download links.`
      }),
      footer: proto.Message.InteractiveMessage.Footer.create({
        text: "SinhalaSub Movie Downloader"
      }),
      nativeFlowMessage: proto.Message.InteractiveMessage.NativeFlowMessage.fromObject({
        buttons: [
          {
            "name": "single_select",
            "buttonParamsJson": JSON.stringify({
              "title": "Movie List",
              "sections": sections
            })
          },
          {
            "name": "quick_reply",
            "buttonParamsJson": JSON.stringify({
              "display_text": "🔄 Refresh",
              "id": "refresh_movies"
            })
          }
        ]
      })
    };

    const msgContent = generateWAMessageFromContent(from, {
      viewOnceMessage: { message: { interactiveMessage: proto.Message.InteractiveMessage.fromObject(interactiveMessage) } }
    }, {});

    await conn.relayMessage(from, msgContent.message, { messageId: msgContent.key.id });

    conn.ev.on('messages.upsert', async (msgUpdate) => {
      const newMsg = msgUpdate.messages[0];
      if (!newMsg.message) return;

      const selectedId = newMsg.message?.interactiveResponseMessage?.selectedId;
      if (selectedId && selectedId.startsWith('movie_')) {
        const selectedIndex = parseInt(selectedId.split('_')[1]);
        const selectedMovie = topResults[selectedIndex];

        const detailsUrl = 'https://api-site-2.vercel.app/api/sinhalasub/movie?url=' + encodeURIComponent(selectedMovie.link);
        try {
          const detailsResponse = await axios.get(detailsUrl);
          const movieDetails = detailsResponse.data.result;
          const downloadLinks = movieDetails.dl_links || [];

          if (downloadLinks.length === 0) {
            return await reply("No download links found.");
          }

          let sections = [
            {
              title: "🎥 Download Links",
              rows: downloadLinks.map((link, index) => ({
                header: "⬇️ Download",
                title: `${link.quality} (${link.size})`,
                description: "Click to start download",
                id: `download_${index}_${selectedIndex}`
              }))
            }
          ];

          let downloadMessage = {
            body: proto.Message.InteractiveMessage.Body.create({
              text: `🎥 *${movieDetails.title}*\n\nChoose a quality to download.`
            }),
            footer: proto.Message.InteractiveMessage.Footer.create({
              text: "SinhalaSub Movie Downloader"
            }),
            nativeFlowMessage: proto.Message.InteractiveMessage.NativeFlowMessage.fromObject({
              buttons: [
                {
                  "name": "single_select",
                  "buttonParamsJson": JSON.stringify({
                    "title": "Download Options",
                    "sections": sections
                  })
                }
              ]
            })
          };

          const downloadMsg = generateWAMessageFromContent(from, {
            viewOnceMessage: { message: { interactiveMessage: proto.Message.InteractiveMessage.fromObject(downloadMessage) } }
          }, {});

          await conn.relayMessage(from, downloadMsg.message, { messageId: downloadMsg.key.id });

        } catch (error) {
          console.error("Error fetching movie details:", error);
          await reply("An error occurred while fetching movie details. Please try again.");
        }
      }

      if (selectedId && selectedId.startsWith('download_')) {
        const [_, linkIndex, movieIndex] = selectedId.split('_').map(Number);
        const selectedMovie = topResults[movieIndex];
        const detailsUrl = 'https://api-site-2.vercel.app/api/sinhalasub/movie?url=' + encodeURIComponent(selectedMovie.link);

        try {
          const detailsResponse = await axios.get(detailsUrl);
          const movieDetails = detailsResponse.data.result;
          const downloadLinks = movieDetails.dl_links || [];

          if (!downloadLinks[linkIndex]) {
            return await reply("Invalid download selection.");
          }

          const selectedLink = downloadLinks[linkIndex];
          const fileId = selectedLink.link.split('/').pop();
          await conn.sendMessage(from, { react: { text: '⬇️', key: message.key } });

          const downloadUrl = "https://pixeldrain.com/api/file/" + fileId;
          await conn.sendMessage(from, {
            document: { url: downloadUrl },
            mimetype: "video/mp4",
            fileName: `${movieDetails.title} - ${selectedLink.quality}.mp4`,
            caption: `${movieDetails.title}\nQuality: ${selectedLink.quality}\n`,
            contextInfo: {
              mentionedJid: [],
              externalAdReply: {
                title: movieDetails.title,
                body: "Download by SinhalaSub",
                mediaType: 1,
                sourceUrl: selectedMovie.link,
                thumbnailUrl: movieDetails.image
              }
            }
          }, { quoted: newMsg });

          await conn.sendMessage(from, { react: { text: '✅', key: message.key } });

        } catch (error) {
          console.error("Error fetching download link:", error);
          await reply("An error occurred while fetching the download link. Please try again.");
        }
      }
    });

  } catch (error) {
    console.error("Error during search:", error);
    reply("*An error occurred while searching!*");
  }
});
