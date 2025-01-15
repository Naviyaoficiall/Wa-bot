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
    pattern: "song",
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

        let ytmsg = ` *QUEEN SENAYA MD AUDIO DOWNLOADER 👑💘*
        
🎵 *TITLE :* ${yts.title}

🤵 *AUTHOR :* ${yts.author.name}

⏱ *RUNTIME :* ${yts.timestamp}

👀 *VIEWS :* ${yts.views}

🖇️ *URL :* ${yts.url}

Reply This Message With Nambars ❫►*

1. Audio 🎬
2. Document 🗂️

> *⚖️𝐏𝐨𝐰𝐞𝐫𝐞𝐝 𝐁𝐲 - : ©ᴅᴀʀᴋᴇ ɴᴀᴠɪʏᴀ *
`;

        // Send details
        const sentMsg = await conn.sendMessage(from, { image: { url: yts.thumbnail || yts.image || '' }, caption: `${ytmsg}` }, { quoted: mek });

        conn.ev.on('messages.upsert', async (msgUpdate) => {
            const msg = msgUpdate.messages[0];
            if (!msg.message || !msg.message.extendedTextMessage) return;

            const selectedOption = msg.message.extendedTextMessage.text.trim();

            if (msg.message.extendedTextMessage.contextInfo && msg.message.extendedTextMessage.contextInfo.stanzaId === sentMsg.key.id) {
                switch (selectedOption) {
                    case '1':
                        await conn.sendMessage(from, { audio: { url: ytdl.download.url }, mimetype: "audio/mpeg" }, { quoted: mek });
                        break;

                    case '2':
                        await conn.sendMessage(from, {
                            document: { url: ytdl.download.url },
                            mimetype: "audio/mpeg",
                            fileName: yts.title + ".mp3",
                            caption: "Naviya."
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
