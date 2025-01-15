const { cmd, commands } = require('../command');
const yts = require('yt-search');
const axios = require('axios');

cmd({
    pattern: "video",
    desc: "Search and download a YouTube video.",
    category: "tools",
    react: "📽️",
    filename: __filename
},
async (conn, message, m, { from, quoted, body, isCmd, command, args, q, isGroup, sender, senderNumber, botNumber2, botNumber, pushname, isMe, isOwner, groupMetadata, groupName, participants, groupAdmins, isBotAdmins, isAdmins, reply }) => {
    const text = args.join(' ');

    if (!text) {
        return reply(`*Example*: ${command} Faded by Alan Walker`);
    }

    try {
        // React to the message
        await conn.sendMessage(from, { react: { text: `📽️`, key: m?.key } });

        // Search for the video on YouTube
        let search = await yts(text);
        let video = search.all[0];

        let body = `*QUEEN_ANITA-V4_VIDEO - PLAYER*\n` +
                   `> Title: *${video.title}*\n` +
                   `> Views: *${video.views}*\n` +
                   `> Duration: *${video.timestamp}*\n` +
                   `> Uploaded: *${video.ago}*\n` +
                   `> Url: *${video.url}*`;

        // Send the video details
        await conn.sendMessage(from, {
            image: { url: video.thumbnail },
            caption: body
        }, { quoted: m });

        // Call the API to download the video
        const apiUrl = `https://api.davidcyriltech.my.id/download/ytmp4`;
        const apiResponse = await axios.get(apiUrl, {
            params: { url: video.url }
        });

        if (apiResponse.data.success) {
            const { title, download_url } = apiResponse.data.result;

            // Send the video file directly
            await conn.sendMessage(from, {
                video: { url: download_url },
                mimetype: 'video/mp4',
                caption: `🎬 *Title:* ${title}\n\n> ᴘᴏᴡᴇʀᴇᴅ ʙʏ ᴅᴀᴠɪᴅ ᴄʏʀɪʟ ᴛᴇᴄʜ`
            }, { quoted: m });
        } else {
            reply(`*Error fetching the video! Please try again later.*`);
        }
    } catch (error) {
        console.error('Error during video command:', error);
        reply(`*An error occurred while processing your request.*`);
    }
});
