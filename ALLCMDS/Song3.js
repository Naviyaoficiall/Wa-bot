// YTMP3 DL PLUGIN
/*
Please Give Credit 🙂❤️
⚖️𝐏𝐨𝐰𝐞𝐫𝐞𝐝 𝐁𝐲 - : ©𝐌𝐑 𝐌𝐀𝐍𝐔𝐋 𝐎𝐅𝐂 💚
*/
//===========================================
const config = require('../config');
const { cmd } = require('../command');
const { ytsearch, ytmp3 } = require('@dark-yasiya/yt-dl.js'); // request package.json "@dark-yasiya/yt-dl.js": "latest"
//===========================================
cmd({
    pattern: "song3",
    alias: ["ytmp3", "ytsong"],
    react: "🎶",
    desc: "Download Youtube song",
    category: "download",
    use: '.song < Yt url or Name >',
    filename: __filename
},
async (conn, mek, m, { from, prefix, quoted, q, reply }) => {
    try {
        if (!q) return await reply("Please give me Yt url or Name");

        const yt = await ytsearch(q);
        if (yt.results.length < 1) return reply("Results not found!");

        let yts = yt.results[0];
        const ytdl = await ytmp3(yts.url);

        let ytmsg = `*◈ 𝐀𝐔𝐃𝐈𝐎 𝐃𝐎𝐖𝐍𝐋𝐎𝐀𝐃𝐄𝐑*

◈=======================◈
╭──────────────╮
┃ 🎵 \`𝙏𝙞𝙩𝙡𝙚\` : ${yts.title}
┃
┃ ⏱️ \`𝘿𝙪𝙧𝙖𝙩𝙞𝙤𝙣\` : ${yts.timestamp}
┃
┃ 📅 \`𝙍𝙚𝙡𝙚𝙖𝙨𝙚\` : ${yts.ago}
┃
┃ 📊 \`𝙑𝙞𝙚𝙬𝙨\` : ${yts.views}
┃
┃ 🔗 \`𝙇𝙞𝙣𝙠\` : ${yts.url}
┃
┃ ✍️ \`𝐀𝐔𝐓𝐇𝐎𝐑\` : ${yts.author.name}
╰──────────────╯

⦁⦂⦁*━┉━┉━┉━┉━┉━┉━┉━⦁⦂⦁

*🔢 Choose the download option below:*

1 │❯❯◦ Audio File 🎶
2 │❯❯◦ Document File 📂

*㋛  𝐏𝐎𝐖𝐄𝐑𝐃 𝐁𝐘  𝐍𝐀𝐕𝐈𝐘𝐀  〽️Ｄ*
`;

        // Send message with buttons
        const sentMsg = await conn.sendMessage(from, {
            image: { url: yts.thumbnail || yts.image || '' },
            caption: `${ytmsg}`,
            buttons: [
                { buttonId: '1', buttonText: { displayText: 'Audio File 🎶' }, type: 1 },
                { buttonId: '2', buttonText: { displayText: 'Document File 📂' }, type: 1 }
            ],
            footer: 'Powered by Naviya'
        }, { quoted: mek });

        // Handle button responses
        conn.ev.on('messages.upsert', async (msgUpdate) => {
            const msg = msgUpdate.messages[0];
            if (!msg.message || !msg.message.buttonMessage) return;

            const selectedOption = msg.message.buttonMessage.selectedButtonId;

            if (msg.message.buttonMessage.contextInfo && msg.message.buttonMessage.contextInfo.stanzaId === sentMsg.key.id) {
                switch (selectedOption) {
                    case '1':
                        await conn.sendMessage(from, { audio: { url: ytdl.download.url }, mimetype: "audio/mpeg" }, { quoted: mek });
                        break;

                    case '2':
                        await conn.sendMessage(from, {
                            document: { url: ytdl.download.url },
                            mimetype: "audio/mpeg",
                            fileName: yts.title + ".mp3",
                            caption: "> Powered by Naviya"
                        }, { quoted: mek });
                        break;

                    default:
                        reply("Invalid option. Please select a valid option 💗");
                }
            }
        });

    } catch (e) {
        console.log(e);
        reply('An error occurred while processing your request.');
    }
});
