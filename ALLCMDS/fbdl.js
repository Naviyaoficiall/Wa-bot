const { facebook } = require("@mrnima/facebook-downloader");
const { cmd, commands } = require('../command');
const { downloadTiktok } = require('@mrnima/tiktok-downloader');


cmd({
  pattern: 'fbdl',
  alias: ["facebook"],
  desc: "Download Facebook videos", 
  category: "download",
  filename: __filename
}, async (conn, message, msg, { from, quoted, body, isCmd, command, args, q, isGroup, sender, senderNumber, botNumber2, botNumber, pushname, isMe, isOwner, groupMetadata, groupName, participants, groupAdmins, isBotAdmins, isAdmins, reply }) => {
  try {
    if (!q || !q.startsWith("https://")) {
      return conn.sendMessage(from, { text: "*`Need URL`*" }, { quoted: quoted || {} });
    }

    if (quoted?.key) {
      await conn.sendMessage(from, { react: { text: '⏳', key: quoted.key } });
    }

    const fbData = await facebook(q);

    const caption = `〔 *✧FREDI MD✧* 〕\n▸╭───────────\n▸┃๏ *FB DOWNLOADER*\n▸└───────────···๏\n╰────────────────┈⊷\n╭━━━❐━⪼\n┇๏ *Duration* - ${fbData.result.duration} \n╰━━━❐━⪼\n╭━❮ *Download Video* ❯━┈⊷\n▸╭─────────────·๏\n▸┃๏ *1.1*     ┃  *SD Quality*\n▸┃๏ *1.2*     ┃  *HD Quality*\n▸└────────────┈⊷\n╰━━━━━━━━━━━━━━━⪼\n╭━❮ *Download Audio* ❯━┈⊷\n┃▸╭─────────────·๏\n▸┃๏ *2.1*     ┃  *Audio*\n▸┃๏ *2.2*     ┃  *Document*\n▸┃๏ *2.3*     ┃  *Voice*\n▸└────────────┈⊷\n╰━━━━━━━━━━━━━━━⪼\n> *© credits FrediEzra*`;

    const sentMessage = await conn.sendMessage(from, {
      image: { url: fbData.result.thumbnail },
      caption: caption
    }, { quoted: quoted || {} });

    const messageId = sentMessage.key.id;

    conn.ev.on("messages.upsert", async msgUpdate => {
      try {
        const newMsg = msgUpdate.messages[0];
        if (!newMsg.message) return;

        const userText = newMsg.message.conversation || newMsg.message.extendedTextMessage?.text;
        const userId = newMsg.key.remoteJid;
        const isReplyToBot = newMsg.message.extendedTextMessage?.contextInfo?.stanzaId === messageId;

        if (isReplyToBot) {
          await conn.sendMessage(userId, { react: { text: '⬇️', key: newMsg.key } });

          const fbResult = fbData.result;

          if (userText === "1.1") {
            await conn.sendMessage(userId, { video: { url: fbResult.links.SD }, caption: "*© regards frediezra*" }, { quoted: newMsg });
          } else if (userText === "1.2") {
            await conn.sendMessage(userId, { video: { url: fbResult.links.HD }, caption: "*© regards frediezra*" }, { quoted: newMsg });
          } else if (userText === "2.1") {
            await conn.sendMessage(userId, { audio: { url: fbResult.links.SD }, mimetype: "audio/mpeg" }, { quoted: newMsg });
          } else if (userText === "2.2") {
            await conn.sendMessage(userId, { document: { url: fbResult.links.SD }, mimetype: "audio/mpeg", fileName: "FREDI/FBDL.mp3", caption: "*© regards frediezra*" }, { quoted: newMsg });
          } else if (userText === "2.3") {
            await conn.sendMessage(userId, { audio: { url: fbResult.links.SD }, mimetype: "audio/mp4", ptt: true }, { quoted: newMsg });
          }
        }
      } catch (innerError) {
        console.error("Error in message handling:", innerError);
      }
    });
  } catch (error) {
    console.error("Error:", error);
    reply('An error occurred: ' + error.message);
  }
});



  

// Register the 'tt' command for TikTok video downloading
cmd({
    pattern: 'tt',
    alias: ['tt'],
    react: '🎥',
    desc: 'Download tiktok videos',
    category: 'video',
    filename: __filename
}, async (conn, message, msg, { from, quoted, body, isCmd, command, args, q, isGroup, sender, senderNumber, botNumber2, botNumber, pushname, isMe, isOwner, groupMetadata, groupName, participants, groupAdmins, isBotAdmins, isAdmins, reply }) => {
    try {
        if (!q && !q.startsWith('https://')) return reply('*`Need URL`*');
        msg.react('⬇️');
        
        let tiktokResult = await downloadTiktok(q);
        let caption = `╭━━━〔 *KHAN-MD* 〕━━━┈⊷\n┃▸╭───────────\n┃▸┃๏ *TIKTOK DOWNLOADER*\n┃▸└───────────···๏\n╰────────────────┈⊷\n╭━━━❐━⪼\n┇๏ *Title* - ${tiktokResult.result.title}\n\n> *© Powered BY JawadTechX*`;
        
        const sentMessage = await conn.sendMessage(from, {
            image: { url: tiktokResult.result.thumbnail },
            caption: caption
        });
        
        const messageId = sentMessage.key.id;
        
        conn.ev.on('messages.upsert', async msgUpdate => {
            const newMsg = msgUpdate.messages[0];
            if (!newMsg.message) return;
            
            const userText = newMsg.message.conversation || newMsg.message.extendedTextMessage?.text;
            const remoteJid = newMsg.key.remoteJid;
            const isReplyToBot = newMsg.message.extendedTextMessage && newMsg.message.extendedTextMessage.contextInfo.stanzaId === messageId;
            
            if (isReplyToBot) {
                await conn.sendMessage(remoteJid, { react: { text: '⬇️', key: newMsg.key } });
                
                let result = tiktokResult.result;
                await conn.sendMessage(remoteJid, { react: { text: '⬆️', key: newMsg.key } });
                
                if (userText === '1') {
                    await conn.sendMessage(remoteJid, { video: { url: result.dl_link.SD }, caption: '*© Powered BY JawadTechX*' }, { quoted: newMsg });
                } else if (userText === '2') {
                    await conn.sendMessage(remoteJid, { video: { url: result.dl_link.HD }, caption: '*© Powered BY JawadTechX*' }, { quoted: newMsg });
                } else if (userText === '3') {
                    await conn.sendMessage(remoteJid, { audio: { url: result.dl_link.audio }, mimetype: 'audio/mpeg' }, { quoted: newMsg });
                }
            }
        });
    } catch (error) {
        console.error(error);
        reply('*Error !!*');
    }
});

// Register the 'fb' command for Facebook video downloading
cmd({
    pattern: 'fb3',
    alias: ['facebook'],
    desc: 'Download Facebook videos',
    category: 'video',
    filename: __filename
}, async (conn, message, msg, { from, quoted, body, isCmd, command, args, q, isGroup, sender, senderNumber, botNumber2, botNumber, pushname, isMe, isOwner, groupMetadata, groupName, participants, groupAdmins, isBotAdmins, isAdmins, reply }) => {
    try {
        if (!q || !q.startsWith('https://')) return conn.sendMessage(from, { text: '*`Need URL`*' }, { quoted: message });
        
        await conn.sendMessage(from, { react: { text: '⏳', key: message.key } });
        
        const facebookResult = await facebook(q);
        let caption = `╭━━━〔 *KHAN-MD* 〕━━━┈⊷\n┃▸╭───────────\n┃▸┃๏ *FB DOWNLOADER*\n┃▸└───────────···๏\n╰────────────────┈⊷\n╭━━━❐━⪼\n┇๏ *Title* - ${facebookResult.result.title}\n\n> *© Powered BY JawadTechX*`;
        
        const sentMessage = await conn.sendMessage(from, {
            image: { url: facebookResult.result.thumbnail },
            caption: caption
        }, { quoted: message });
        
        const messageId = sentMessage.key.id;
        
        conn.ev.on('messages.upsert', async msgUpdate => {
            const newMsg = msgUpdate.messages[0];
            if (!newMsg.message) return;
            
            const userText = newMsg.message.conversation || newMsg.message.extendedTextMessage?.text;
            const remoteJid = newMsg.key.remoteJid;
            const isReplyToBot = newMsg.message.extendedTextMessage && newMsg.message.extendedTextMessage.contextInfo.stanzaId === messageId;
            
            if (isReplyToBot) {
                await conn.sendMessage(remoteJid, { react: { text: '⬇️', key: newMsg.key } });
                
                let result = facebookResult.result;
                await conn.sendMessage(remoteJid, { react: { text: '⬆️', key: newMsg.key } });
                
                if (userText === '1.1') {
                    await conn.sendMessage(remoteJid, { video: { url: result.links.SD }, caption: '*© Powered BY JawadTechX*' }, { quoted: newMsg });
                } else if (userText === '1.2') {
                    await conn.sendMessage(remoteJid, { video: { url: result.links.HD }, caption: '*© Powered BY JawadTechX*' }, { quoted: newMsg });
                } else if (userText === '2.1') {
                    await conn.sendMessage(remoteJid, { audio: { url: result.links.SD }, mimetype: 'audio/mpeg' }, { quoted: newMsg });
                } else if (userText === '2.2') {
                    await conn.sendMessage(remoteJid, { document: { url: result.links.SD }, mimetype: 'audio/mpeg', fileName: 'KHAN/FBDL.mp3', caption: '*© Powered BY JawadTechX*' }, { quoted: newMsg });
                } else if (userText === '2.3') {
                    await conn.sendMessage(remoteJid, { audio: { url: result.links.SD }, mimetype: 'audio/mp4', ptt: true }, { quoted: newMsg });
                }
            }
        });
    } catch (error) {
        console.error(error);
        reply('*Error !!*');
    }
});
