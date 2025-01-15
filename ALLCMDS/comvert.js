const { cmd, commands } = require('../command');

cmd({
    pattern: "flux",
    desc: "Generate an image using Flux Image Generator.",
    category: "tools",
    react: "🎨",
    filename: __filename
},
async (conn, message, m, { from, quoted, body, isCmd, command, args, q, isGroup, sender, senderNumber, botNumber2, botNumber, pushname, isMe, isOwner, groupMetadata, groupName, participants, groupAdmins, isBotAdmins, isAdmins, reply }) => {
    const text = args.join(' ');

    if (!text) {
        return reply(`*Usage:* /flux <prompt>\n\n*Example:* /flux cat`);
    }

    try {
        // Construct the API URL with the user-provided prompt
        const apiUrl = `https://api.davidcyriltech.my.id/flux?prompt=${encodeURIComponent(text)}`;

        // Send the generated image to the chat
        await conn.sendMessage(from, {
            image: { url: apiUrl },
            caption: `🎨 *Flux Image Generator*\n\n📄 *Prompt:* ${text}\n\n> ᴘᴏᴡᴇʀᴇᴅ ʙʏ ᴅᴀᴠɪᴅ ᴄʏʀɪʟ ᴛᴇᴄʜ`,
        }, { quoted: m });
    } catch (error) {
        console.error('Error in Flux command:', error);
        reply(`*AN ERROR OCCURRED!! MESSAGE :*\n\n> ${error.message}`);
    }
});
