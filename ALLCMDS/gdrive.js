const axios = require('axios');
const { cmd } = require('../command');
const { fetchJson } = require("../lib/functions");
cmd({
  pattern: "gdrive",
  desc: "To download Gdrive files.",
  react: '🌐',
  category: "download",
  filename: __filename
}, async (conn, message, msg, { from, quoted, body, isCmd, command, args, q, isGroup, sender, senderNumber, botNumber2, botNumber, pushname, isMe, isOwner, groupMetadata, groupName, participants, groupAdmins, isBotAdmins, isAdmins, reply }) => {
  try {
    // React with a down arrow emoji
    await conn.sendMessage(from, {
      react: {
        text: '⬇️',
        key: quoted.key
      }
    });

    // Check if a valid link is provided
    if (!q) {
      return msg.reply("Please Give Me a valid Link...");
    }

    // Construct the API URL
    const apiUrl = "https://api.fgmods.xyz/api/downloader/gdrive?url=" + q + "&apikey=mnp3grlZ";
    
    // Fetch data from the API
    const response = await axios.get(apiUrl);
    const downloadUrl = response.data.result.downloadUrl;
    
    // If a download URL is found, send the file
    if (downloadUrl) {
      await conn.sendMessage(from, {
        react: {
          text: '⬆️',
          key: quoted.key
        }
      });

      await conn.sendMessage(from, {
        document: {
          url: downloadUrl
        },
        mimetype: response.data.result.mimetype,
        fileName: response.data.result.fileName,
        caption: "*© regards frediezra"
      }, {
        quoted: quoted
      });

      await conn.sendMessage(from, {
        react: {
          text: '✅',
          key: quoted.key
        }
      });
    }
  } catch (error) {
    console.log(error);
  }
});


// Command to download xnxx videos
cmd({
  pattern: "xnxxdown",
  alias: ["dlxnxx", "xnxxdl", "xxx"],
  react: '🫣',
  desc: "Download xnxx videos",
  category: "nsfw",
  use: ".xnxx <xnxx link>",
  filename: __filename
}, async (conn, message, msg, { from, l, quoted, body, isCmd, command, args, q, isGroup, sender, senderNumber, botNumber2, botNumber, pushname, isMe, isOwner, groupMetadata, groupName, participants, groupAdmins, isBotAdmins, isAdmins, reply }) => {
  try {
    if (!q) {
      return reply("*Please give me url !!*");
    }
    let videoData = await xdl(q);
    let videoTitle = videoData.result.title;
    await conn.sendMessage(from, {
      video: {
        url: videoData.result.files.high
      },
      caption: videoTitle
    }, {
      quoted: message
    });
  } catch (error) {
    reply("*Error !!*");
    console.log(error);
  }
});

// Command to download xvideos videos
cmd({
  pattern: "xvdown",
  alias: ["dlxv", "porno", 'xvdl'],
  react: '🫣',
  desc: "Download xvideos videos",
  category: 'nsfw',
  use: ".xv <xvideos link>",
  filename: __filename
}, async (conn, message, msg, { from, l, quoted, body, isCmd, command, args, q, isGroup, sender, senderNumber, botNumber2, botNumber, pushname, isMe, isOwner, groupMetadata, groupName, participants, groupAdmins, isBotAdmins, isAdmins, reply }) => {
  try {
    if (!q) {
      return reply("*Please give me url !!*");
    }
    let videoData = await fetchJson('https://www.dark-yasiya-api.site/download/xvideo?url=' + q);
    const caption = "\n   🔞 *XVIDEO DOWNLOADER* 🔞\n\n     \n• *Title* - " + videoData.result.title + "\n\n• *Views* - " + videoData.result.views + "\n\n• *Like* - " + videoData.result.like + "\n\n• *Deslike* - " + videoData.result.deslike + "\n\n• *Size* - " + videoData.result.size;
    await conn.sendMessage(from, {
      video: {
        url: videoData.result.dl_link
      },
      caption: caption
    }, {
      quoted: message
    });
  } catch (error) {
    reply("*Error !!*");
    console.log(error);
  }
});
