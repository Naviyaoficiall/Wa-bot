const { cmd, commands } = require("../command");
const { fetchJson } = require("../lib/functions");

cmd({
  pattern: "logo",
  desc: "Create logos",
  react: '🎗',
  category: "other",
  filename: __filename
}, async (conn, message, msg, { from, quoted, body, isCmd, command, args, q, isGroup, sender, senderNumber, botNumber2, botNumber, pushname, isMe, isOwner, groupMetadata, groupName, participants, groupAdmins, isBotAdmins, isAdmins, reply }) => {
  try {
    if (!args[0]) {
      return reply("*_Please give me a text._*");
    }

    let text = q;
    let logoMenu = `*✧FREDI MD✧💎 LOGO MAKER 💫*\n\n` +
      `╼╼╼╼╼╼╼╼╼╼╼╼╼╼╼╼╼➻\n` +
      `*◈ᴛᴇxᴛ :* ${text}\n` +
      `╼╼╼╼╼╼╼╼╼╼╼╼╼╼╼╼╼➻\n\n` +
      `*🔢 Rᴇᴘʟʏ Tʜᴇ alphabet Yᴏᴜ Wᴀɴᴛ ➠*\n\n` +
      ` A ➠ Bʟᴀᴄᴋ Pɪɴᴋ\n` +
      ` B ➠ Bʟᴀᴄᴋ Pɪɴᴋ 2\n` +
      ` C ➠ Fredi 3ᴅ\n` +
      ` D ➠ Nᴀʀᴜᴛᴏ\n` +
      ` E ➠ Dɪɢɪᴛᴀʟ Gʟɪᴛᴄʜ\n` +
      ` F ➠ Pɪxᴇʟ Gʟɪᴛᴄʜ\n` +
      ` G ➠ Cᴏᴍɪᴄ Sᴛʏʟᴇ\n` +
      ` H ➠ Nᴇᴏɴ Lɪɢʜᴛ\n` +
      ` I ➠ Fʀᴇᴇ Bᴇᴀʀ\n` +
      ` J ➠ Dᴇᴠɪʟ Wɪɴɢꜱ\n` +
      ` K ➠ Sᴀᴅ Gɪʀʟ\n` +
      ` L ➠ Lᴇᴀᴠᴇꜱ\n` +
      ` M ➠ Dʀᴀɢᴏɴ Bᴀʟʟ\n` +
      ` N ➠ Hᴀɴᴅ Wʀɪᴛᴛᴇɴ\n` +
      ` O ➠ Nᴇᴏɴ Lɪɢʜᴛ\n` +
      ` P ➠ 3ᴅ Cᴀꜱᴛʟᴇ Pᴏᴘ\n` +
      ` Q ➠ Fʀᴏᴢᴇɴ ᴄʀɪꜱᴛᴍᴀꜱꜱ\n` +
      ` R ➠ 3ᴅ Fᴏɪʟ Bᴀʟʟᴏᴏɴꜱ\n` +
      ` S ➠ 3ᴅ Cᴏʟᴏᴜʀꜰᴜʟ Pᴀɪɴᴛ\n` +
      ` T ➠ Aᴍᴇʀɪᴄᴀɴ Fʟᴀɢ 3ᴅ\n\n` +
      `> *✧FREDI MD✧*`;

    const contextInfo = {
      'mentionedJid': [msg.sender],
      'forwardingScore': 999,
      'isForwarded': true,
      'forwardedNewsletterMessageInfo': {
        'newsletterJid': '120363313124070136@newsletter',
        'newsletterName': "✧FREDI MD✧",
        'serverMessageId': 999
      }
    };

    const logoMessage = {
      'text': logoMenu,
      'contextInfo': contextInfo
    };

    let sentMessage = await conn.sendMessage(from, logoMessage, { quoted: message });

    conn.ev.on('messages.upsert', async chatUpdate => {
      const receivedMessage = chatUpdate.messages[0];
      if (!receivedMessage.message || !receivedMessage.message.extendedTextMessage) {
        return;
      }

      const receivedText = receivedMessage.message.extendedTextMessage.text.trim();
      if (receivedMessage.message.extendedTextMessage.contextInfo && receivedMessage.message.extendedTextMessage.contextInfo.stanzaId === sentMessage.key.id) {
        let logoUrl = '';
        let apiUrl = 'https://api-pink-venom.vercel.app/api/logo?url=';

        switch (receivedText) {
          case 'A':
            logoUrl = `${apiUrl}https://en.ephoto360.com/create-a-blackpink-style-logo-with-members-signatures-810.html&name=${text}`;
            break;
          case 'B':
            logoUrl = `${apiUrl}https://en.ephoto360.com/online-blackpink-style-logo-maker-effect-711.html&name=${text}`;
            break;
          case 'C':
            logoUrl = `${apiUrl}https://en.ephoto360.com/create-glossy-silver-3d-text-effect-online-802.html&name=${text}`;
            break;
          case 'D':
            logoUrl = `${apiUrl}https://en.ephoto360.com/naruto-shippuden-logo-style-text-effect-online-808.html&name=${text}`;
            break;
          case 'E':
            logoUrl = `${apiUrl}https://en.ephoto360.com/create-digital-glitch-text-effects-online-767.html&name=${text}`;
            break;
          case 'F':
            logoUrl = `${apiUrl}https://en.ephoto360.com/create-pixel-glitch-text-effect-online-769.html&name=${text}`;
            break;
          case 'G':
            logoUrl = `${apiUrl}https://en.ephoto360.com/create-online-3d-comic-style-text-effects-817.html&name=${text}`;
            break;
          case 'H':
            logoUrl = `${apiUrl}https://en.ephoto360.com/create-colorful-neon-light-text-effects-online-797.html&name=${text}`;
            break;
          case 'I':
            logoUrl = `${apiUrl}https://en.ephoto360.com/free-bear-logo-maker-online-673.html&name=${text}`;
            break;
          case 'J':
            logoUrl = `${apiUrl}https://en.ephoto360.com/neon-devil-wings-text-effect-online-683.html&name=${text}`;
            break;
          case 'K':
            logoUrl = `${apiUrl}https://en.ephoto360.com/write-text-on-wet-glass-online-589.html&name=${text}`;
            break;
          case 'L':
            logoUrl = `${apiUrl}https://en.ephoto360.com/create-typography-status-online-with-impressive-leaves-357.html&name=${text}`;
            break;
          case 'M':
            logoUrl = `${apiUrl}https://en.ephoto360.com/create-dragon-ball-style-text-effects-online-809.html&name=${text}`;
            break;
          case 'N':
            logoUrl = `${apiUrl}https://en.ephoto360.com/handwritten-text-on-foggy-glass-online-680.html&name=${text}`;
            break;
          case 'O':
            logoUrl = `${apiUrl}https://en.ephoto360.com/create-colorful-neon-light-text-effects-online-797.html&name=${text}`;
            break;
          case 'P':
            logoUrl = `${apiUrl}https://en.ephoto360.com/create-a-3d-castle-pop-out-mobile-photo-effect-786.html&name=${text}`;
            break;
          case 'Q':
            logoUrl = `${apiUrl}https://en.ephoto360.com/create-a-frozen-christmas-text-effect-online-792.html&name=${text}`;
            break;
          case 'R':
            logoUrl = `${apiUrl}https://en.ephoto360.com/beautiful-3d-foil-balloon-effects-for-holidays-and-birthday-803.html&name=${text}`;
            break;
          case 'S':
            logoUrl = `${apiUrl}https://en.ephoto360.com/create-3d-colorful-paint-text-effect-online-801.html&name=${text}`;
            break;
          case 'T':
            logoUrl = `${apiUrl}https://en.ephoto360.com/free-online-american-flag-3d-text-effect-generator-725.html&name=${text}`;
            break;
          default:
            return reply("*_Invalid Alphabet. Please reply with a valid alphabet._*");
        }

        let logoResponse = await fetchJson(logoUrl);
        await conn.sendMessage(from, {
          'image': { 'url': logoResponse.result.download_url },
          'caption': "> *✧FREDI MD✧*"
        }, { 'quoted': message });
      }
    });
  } catch (error) {
    console.log(error);
    reply('' + error);
  }
});
