const axios = require('axios');
const cheerio = require('cheerio');
const { cmd } = require('../command');

cmd({
  pattern: "ginisisila",
  react: '📑',
  category: 'download',
  desc: "ginisisilacartoon.net",
  filename: __filename
}, async (conn, message, msg, { from, q, isDev, reply }) => {
  try {
    if (!q) {
      return await reply("*Please provide a search query! (e.g., Garfield)*");
    }

    const searchUrl = "https://ginisisilacartoon.net/search.php?q=" + encodeURIComponent(q);
    const response = await axios.get(searchUrl);
    const $ = cheerio.load(response.data);
    let results = [];

    $("div.inner-video-cell").each((index, element) => {
      const title = $(element).find("div.video-title > a").attr('title');
      const postedTime = $(element).find("div.posted-time").text().trim();
      const episodeLink = $(element).find("div.video-title > a").attr("href");
      const imageUrl = $(element).find("div.inner-video-thumb-wrapper img").attr('src');
      if (title && episodeLink) {
        results.push({
          title: title,
          postedTime: postedTime,
          episodeLink: 'https://ginisisilacartoon.net/' + episodeLink,
          imageUrl: imageUrl
        });
      }
    });

    if (results.length === 0) {
      return await reply("No results found for: " + q);
    }

    let resultMessage = "📺 Search Results for *" + q + ":*\n\n";
    results.forEach((result, index) => {
      resultMessage += '*' + (index + 1) + ".* " + result.title + "\n🗓️ Posted: " + result.postedTime + "\n🔗 Link: " + result.episodeLink + "\n\n";
    });

    const sentMessage = await conn.sendMessage(from, {
      text: resultMessage
    }, {
      quoted: msg
    });

    const messageId = sentMessage.key.id;

    conn.ev.on("messages.upsert", async msgUpdate => {
      const newMsg = msgUpdate.messages[0];
      if (!newMsg.message) return;

      const userText = newMsg.message.conversation || newMsg.message.extendedTextMessage?.text;
      const userId = newMsg.key.remoteJid;
      const isReplyToBot = newMsg.message.extendedTextMessage && newMsg.message.extendedTextMessage.contextInfo.stanzaId === messageId;

      if (isReplyToBot) {
        const selectedNumber = parseInt(userText.trim());
        if (!isNaN(selectedNumber) && selectedNumber > 0 && selectedNumber <= results.length) {
          const selectedResult = results[selectedNumber - 1];
          const detailMessage = "*🪄 NAME:-* " + selectedResult.title + "\n⏳ *DATE:-* " + selectedResult.postedTime + "\n📎 *EPISODE LINK*:- " + selectedResult.episodeLink + "\n\n☘ *We are uploading the Movie/Episode you requested.*";
          const imageMessage = {
            image: {
              url: selectedResult.imageUrl
            },
            caption: detailMessage
          };
          await conn.sendMessage(userId, imageMessage, {
            quoted: newMsg
          });

          const episodeResponse = await axios.get(selectedResult.episodeLink);
          const $$ = cheerio.load(episodeResponse.data);
          const videoIframeSrc = $$("div#player-holder iframe").attr("src");

          if (videoIframeSrc) {
            const apiLink = "https://api.fgmods.xyz/api/downloader/gdrive?url=" + videoIframeSrc + "&apikey=mnp3grlZ";
            try {
              const apiResponse = await axios.get(apiLink);
              const downloadUrl = apiResponse.data.result.downloadUrl;
              if (downloadUrl) {
                await conn.sendMessage(userId, {
                  document: {
                    url: downloadUrl
                  },
                  mimetype: "video/mp4",
                  fileName: "MR FRANK | " + selectedResult.title + ".mp4",
                  caption: selectedResult.title + " | *© regards frediezra*"
                }, {
                  quoted: newMsg
                });
              } else {
                await reply("Failed to retrieve the download link for this episode.");
              }
            } catch (error) {
              console.error("Error fetching the download link:", error);
              await reply("An error occurred while trying to fetch the download link.");
            }
          } else {
            await reply("No downloadable link found for this episode.");
          }
        } else {
          await reply("Please reply with a valid number from the list.");
        }
      }
    });
  } catch (error) {
    await reply("*Error occurred while scraping!*");
    console.error(error);
  }
});





cmd({
  pattern: "gini2",
  react: '💚',
  category: 'download',
  desc: "Download cartoons from ginisisilacartoon.net",
  filename: __filename
}, async (conn, message, msg, { from, q, reply }) => {
  try {
    if (!q) {
      return await reply("*Please provide a search query! (e.g., Garfield)*");
    }

    const searchUrl = "https://ginisisilacartoon.net/search.php?q=" + encodeURIComponent(q);
    const response = await axios.get(searchUrl);
    const $ = cheerio.load(response.data);
    let results = [];

    $("div.inner-video-cell").each((index, element) => {
      const title = $(element).find("div.video-title > a").attr('title');
      const postedTime = $(element).find("div.posted-time").text().trim();
      const episodeLink = $(element).find("div.video-title > a").attr("href");
      const imageUrl = $(element).find("div.inner-video-thumb-wrapper img").attr('src');
      if (title && episodeLink) {
        results.push({
          title: title,
          postedTime: postedTime,
          episodeLink: 'https://ginisisilacartoon.net/' + episodeLink,
          imageUrl: imageUrl
        });
      }
    });

    if (results.length === 0) {
      return await reply("⚠️ No results found for: " + q);
    }

    let resultMessage = "📺 *Search Results for:* " + q + "\n\n";
    results.forEach((result, index) => {
      resultMessage += `*${index + 1}.* ${result.title}\n🗓️ Posted: ${result.postedTime}\n🔗 Link: ${result.episodeLink}\n\n`;
    });

    const sentMessage = await conn.sendMessage(from, { text: resultMessage }, { quoted: msg });
    const messageId = sentMessage.key.id;

    conn.ev.on("messages.upsert", async msgUpdate => {
      const newMsg = msgUpdate.messages[0];
      if (!newMsg.message) return;

      const userText = newMsg.message.conversation || newMsg.message.extendedTextMessage?.text;
      const userId = newMsg.key.remoteJid;
      const isReplyToBot = newMsg.message.extendedTextMessage && newMsg.message.extendedTextMessage.contextInfo.stanzaId === messageId;

      if (isReplyToBot) {
        const selectedNumber = parseInt(userText.trim());
        if (!isNaN(selectedNumber) && selectedNumber > 0 && selectedNumber <= results.length) {
          const selectedResult = results[selectedNumber - 1];

          const detailMessage = `*🎥 Name:* ${selectedResult.title}\n🗓️ *Date:* ${selectedResult.postedTime}\n🔗 *Watch Online:* ${selectedResult.episodeLink}`;
          const imageMessage = { image: { url: selectedResult.imageUrl }, caption: detailMessage };
          await conn.sendMessage(userId, imageMessage, { quoted: newMsg });

          const episodeResponse = await axios.get(selectedResult.episodeLink);
          const $$ = cheerio.load(episodeResponse.data);
          
          const videoUrl = $$("source").attr("src");
          if (videoUrl) {
            await conn.sendMessage(userId, { video: { url: videoUrl }, caption: selectedResult.title }, { quoted: newMsg });
          } else {
            await reply("❌ No direct download link found for this episode.");
          }
        } else {
          await reply("⚠️ Please reply with a valid number from the list.");
        }
      }
    });
  } catch (error) {
    await reply("❌ *Error occurred while processing your request!*");
    console.error(error);
  }
});
