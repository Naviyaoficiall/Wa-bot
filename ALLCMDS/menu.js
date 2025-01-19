


const axios = require('axios');
const { BufferJSON, WA_DEFAULT_EPHEMERAL, generateWAMessageFromContent, proto, generateWAMessageContent, generateWAMessage, prepareWAMessageMedia, downloadContentFromMessage, areJidsSameUser, getContentType } = require('@whiskeysockets/baileys')
const {cmd , commands} = require('../command')




cmd({
    pattern: "menu3",
    desc: "Download Song Menu",
    category: "Download",
    filename: __filename
},
async (conn, mek, m, { from, reply }) => {
    try {
        // ප්‍රධාන පණිවිඩය
        const menuText = `🌟 *SUPUN MD MENU* 🌟
        
        🔹 *Select an Option Below:*
        
        1️⃣ `.alive` - Check if the bot is working.
        2️⃣ `.ping` - Check server response.
        3️⃣ **WhatsApp Channel** - Join official WhatsApp Channel.
        4️⃣ **GitHub Repository** - Visit the GitHub repo for this bot.

        ⚡ _Powered By SUPUN FERNANDO_
        `;

        // බටන්  සකස් කිරීම
        const buttons = [
            {
                buttonId: '.alive',
                buttonText: { displayText: '✅ Alive' },
                type: 1
            },
            {
                buttonId: '.ping',
                buttonText: { displayText: '📶 Ping' },
                type: 1
            },
            {
                buttonId: 'https://whatsapp.com/channel/0029VaXRYlrKwqSMF7Tswi38',
                buttonText: { displayText: '🏮 WhatsApp Channel' },
                type: 2
            },
            {
                buttonId: 'https://github.com/mrsupunfernando12/SUPUN-MD',
                buttonText: { displayText: '🌐 GitHub Repository' },
                type: 2
            }
        ];

        // පින්තූර එකතු කිරීම
        const menuImage = await prepareWAMessageMedia({ image: { url: "https://i.ibb.co/bHXBV08/9242c844b83f7bf9.jpg" } }, { upload: conn.waUploadToServer });

        // menu content එක relay කිරීම
        const message = generateWAMessageFromContent(
            from,
            {
                templateMessage: {
                    hydratedTemplate: {
                        hydratedContentText: menuText,
                        hydratedFooterText: "© SUPUN FERNANDO",
                        hydratedButtons: buttons,
                        ...menuImage // පින්තූරය එකතු කිරීම
                    }
                }
            },
            { quoted: mek }
        );

        await conn.relayMessage(from, message.message, { messageId: message.key.id });

    } catch (error) {
        console.error(error);
        reply("❌ An error occurred.");
    }
});
