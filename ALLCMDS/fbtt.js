const { fetchJson } = require("../lib/functions");
const { downloadTiktok } = require("@mrnima/tiktok-downloader");
const { facebook } = require("@mrnima/facebook-downloader");
const cheerio = require("cheerio");
const { igdl } = require("ruhend-scraper");
const axios = require("axios");
const { cmd, commands } = require('../command');

cmd({
  pattern: 'fb',
  alias: ["facebook"],
  desc: "Download Facebook videos",
  category: "download",
  filename: __filename
}, async (conn, message, msg, { from, quoted, body, isCmd, command, args, q, isGroup, sender, senderNumber, botNumber2, botNumber, pushname, isMe, isOwner, groupMetadata, groupName, participants, groupAdmins, isBotAdmins, isAdmins, reply }) => {
  try {
    if (!q || !q.startsWith("https://")) {
      return conn.sendMessage(from, {
        text: "*`Need URL`*"
      }, {
        quoted: quoted
      });
    }

    await conn.sendMessage(from, {
      react: {
        text: '⏳',
        key: quoted.key
      }
    });

    const fbData = await facebook(q);
    const caption = "〔 *✧FREDI MD✧* 〕\n▸╭───────────\n▸┃๏ *FB DOWNLOADER*\n▸└───────────···๏\n╰────────────────┈⊷\n╭━━━❐━⪼\n┇๏ *Duration* - " + fbData.result.duration + " \n╰━━━❐━⪼\n╭━❮ *Download Video* ❯━┈⊷\n▸╭─────────────·๏\n▸┃๏ *1.1*     ┃  *SD Quality*\n▸┃๏ *1.2*     ┃  *HD Quality*\n▸└────────────┈⊷\n╰━━━━━━━━━━━━━━━⪼\n╭━❮ *Download Audio* ❯━┈⊷\n┃▸╭─────────────·๏\n▸┃๏ *2.1*     ┃  *Audio*\n▸┃๏ *2.2*     ┃  *Document*\n▸┃๏ *2.3*     ┃  *Voice*\n▸└────────────┈⊷\n╰━━━━━━━━━━━━━━━⪼\n> *© credits FrediEzra*";

    const sentMessage = await conn.sendMessage(from, {
      image: {
        url: fbData.result.thumbnail
      },
      caption: caption
    }, {
      quoted: quoted
    });

    const messageId = sentMessage.key.id;

    conn.ev.on("messages.upsert", async msgUpdate => {
      const newMsg = msgUpdate.messages[0];
      if (!newMsg.message) {
        return;
      }

      const userText = newMsg.message.conversation || newMsg.message.extendedTextMessage?.text;
      const userId = newMsg.key.remoteJid;
      const isReplyToBot = newMsg.message.extendedTextMessage && newMsg.message.extendedTextMessage.contextInfo.stanzaId === messageId;

      if (isReplyToBot) {
        await conn.sendMessage(userId, {
          react: {
            text: '⬇️',
            key: newMsg.key
          }
        });

        let fbResult = fbData.result;
        
        await conn.sendMessage(userId, {
          react: {
            text: '⬆️',
            key: newMsg.key
          }
        });

        if (userText === "1.1") {
          await conn.sendMessage(userId, {
            video: {
              url: fbResult.links.SD
            },
            caption: "*© regards frediezra*"
          }, {
            quoted: newMsg
          });
        } else if (userText === "1.2") {
          await conn.sendMessage(userId, {
            video: {
              url: fbResult.links.HD
            },
            caption: "*© regards frediezra*"
          }, {
            quoted: newMsg
          });
        } else if (userText === '2.1') {
          await conn.sendMessage(userId, {
            audio: {
              url: fbResult.links.SD
            },
            mimetype: "audio/mpeg"
          }, {
            quoted: newMsg
          });
        } else if (userText === '2.2') {
          await conn.sendMessage(userId, {
            document: {
              url: fbResult.links.SD
            },
            mimetype: "audio/mpeg",
            fileName: "FREDI/FBDL.mp3",
            caption: "*© regards frediezra*"
          }, {
            quoted: newMsg
          });
        } else if (userText === '2.3') {
          await conn.sendMessage(userId, {
            audio: {
              url: fbResult.links.SD
            },
            mimetype: "audio/mp4",
            ptt: true
          }, {
            quoted: newMsg
          });
        }
      }
    });
  } catch (error) {
    console.log(error);
    reply('' + error);
  }
});

cmd({
  pattern: "tiktok",
  alias: ['tt'],
  react: '🎥',
  desc: "Download TikTok videos",
  category: "download",
  filename: __filename
}, async (conn, message, msg, { from, quoted, body, isCmd, command, args, q, isGroup, sender, senderNumber, botNumber2, botNumber, pushname, isMe, isOwner, groupMetadata, groupName, participants, groupAdmins, isBotAdmins, isAdmins, reply }) => {
  try {
    if (!q || !q.startsWith('https://')) {
      return reply("*`Need url`*");
    }
    
    msg.react('⬇️');
    
    let tiktokData = await downloadTiktok(q);
    let caption = "〔 *✧FREDI MD✧* 〕\n▸╭───────────\n▸┃๏ *TIKTOK DOWNLOADER*\n▸└───────────···๏\n╰────────────────┈⊷\n╭━━━❐━⪼\n┇๏ *Title* - " + tiktokData.result.title + " \n╰━━━❐━⪼\n╭━❮ *Download Video* ❯━┈⊷\n▸╭─────────────·๏\n▸┃๏ *1*     ┃  *SD Quality*\n▸┃๏ *2*     ┃  *HD Quality*\n┃▸└────────────┈⊷\n╰━━━━━━━━━━━━━━━⪼\n╭━❮ *Download Audio* ❯━┈⊷\n▸╭─────────────·๏\n▸┃๏ *3*     ┃  *Audio*\n▸└────────────┈⊷\n╰━━━━━━━━━━━━━━━⪼\n> *© regards frediezra*";
    
    const sentMessage = await conn.sendMessage(from, {
      image: { url: tiktokData.result.image },
      caption: caption
    });
    
    const messageId = sentMessage.key.id;
    
    conn.ev.on("messages.upsert", async msgUpdate => {
      const newMsg = msgUpdate.messages[0];
      if (!newMsg.message) return;

      const userText = newMsg.message.conversation || newMsg.message.extendedTextMessage?.text;
      const userId = newMsg.key.remoteJid;
      const isReplyToBot = newMsg.message.extendedTextMessage && newMsg.message.extendedTextMessage.contextInfo.stanzaId === messageId;

      if (isReplyToBot) {
        await conn.sendMessage(userId, {
          react: { text: '⬇️', key: newMsg.key }
        });

        let tiktokResult = tiktokData.result;
        
        await conn.sendMessage(userId, {
          react: { text: '⬆️', key: newMsg.key }
        });

        if (userText === '1') {
          await conn.sendMessage(userId, {
            video: { url: tiktokResult.dl_link.download_mp4_1 },
            caption: "*© regards frediezra*"
          }, { quoted: newMsg });
        } else if (userText === '2') {
          await conn.sendMessage(userId, {
            video: { url: tiktokResult.dl_link.download_mp4_2 },
            caption: "*© Powered By frediezra*"
          }, { quoted: newMsg });
        } else if (userText === '3') {
          await conn.sendMessage(userId, {
            audio: { url: tiktokResult.dl_link.download_mp3 },
            mimetype: "audio/mpeg"
          }, { quoted: newMsg });
        }
      }
    });
  } catch (error) {
    console.log(error);
    reply('' + error);
  }
});
