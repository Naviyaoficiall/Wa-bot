const { cmd, commands } = require('../command');
const fetch = require('node-fetch');
const axios = require('axios');

cmd({
    pattern: "fb",
    desc: "Download a Facebook video.",
    category: "tools",
    react: "📥",
    filename: __filename
},
async (conn, message, m, { from, quoted, body, isCmd, command, args, q, isGroup, sender, senderNumber, botNumber2, botNumber, pushname, isMe, isOwner, groupMetadata, groupName, participants, groupAdmins, isBotAdmins, isAdmins, reply }) => {
    const text = args.join(' ');

    if (!text) {
        return reply(`*Please provide a Facebook URL or video link.*`);
    }

    try {
        // React to the message
        await conn.sendMessage(from, { react: { text: `⏳`, key: m?.key } });

        // Call the API to download the Facebook video
        const apiResponse = await axios.get(`https://api.davidcyriltech.my.id/facebook`, {
            params: { url: text }
        });

        const { status, success, video } = apiResponse.data;

        if (status === 200 && success && video) {
            const { downloads, thumbnail } = video;
            const hdDownload = downloads.find(item => item.quality.toLowerCase().includes('hd')) || downloads[0];

            if (hdDownload) {
                const { downloadUrl, quality } = hdDownload;

                // React with a download emoji
                await conn.sendMessage(from, { react: { text: `📥`, key: m?.key } });

                // Send the video file
                await conn.sendMessage(from, {
                    video: { url: downloadUrl },
                    mimetype: 'video/mp4',
                    caption: `\n> ᴘᴏᴡᴇʀᴇᴅ ʙʏ ᴅᴀᴠɪᴅ ᴄʏʀɪʟ ᴛᴇᴄʜ ${quality}\n`,
                    thumbnail: { url: thumbnail },
                }, { quoted: m });

                // React with a success emoji
                await conn.sendMessage(from, { react: { text: `✅`, key: m?.key } });
            } else {
                reply(`*❌ No downloadable video found. Please check the link and try again.*`);
            }
        } else {
            reply(`*❌ Failed to download the video. Please check the link and try again.*`);
        }
    } catch (error) {
        console.error("Error in Facebook Downloader:", error);
        reply(`*An error occurred while processing your request. Please try again later.*`);
    }
});



cmd({
    pattern: "gpt",
    desc: "Ask a question to the ChatGPT AI.",
    category: "tools",
    react: "🤖",
    filename: __filename
},
async (conn, message, m, { from, quoted, body, isCmd, command, args, q, isGroup, sender, senderNumber, botNumber2, botNumber, pushname, isMe, isOwner, groupMetadata, groupName, participants, groupAdmins, isBotAdmins, isAdmins, reply }) => {
    const text = args.join(' ');

    if (!text) {
        return reply('Please ask me something!');
    }

    try {
        // Construct the API URL with the user-provided query
        const apiUrl = `https://api.davidcyriltech.my.id/ai/chatbot?query=${encodeURIComponent(text)}`;

        // Fetch the response from the API
        const response = await fetch(apiUrl);
        const jsonData = await response.json();

        if (jsonData.success && jsonData.result) {
            reply(jsonData.result); 
        } else {
            reply('Failed to fetch response from the API. Please try again later.');
        }
    } catch (error) {
        console.error('Error fetching API response:', error);
        reply('An error occurred while fetching the AI response. Please try again later.');
    }
});


