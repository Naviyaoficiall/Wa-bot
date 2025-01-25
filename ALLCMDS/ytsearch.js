const { cmd, commands } = require('../command');
const yts = require('yt-search');
const {
    BufferJSON, WA_DEFAULT_EPHEMERAL, generateWAMessageFromContent, proto,
    getBinaryNodeChildren, generateWAMessageContent, generateWAMessage,
    prepareWAMessageMedia, areJidsSameUser, getContentType,
    downloadContentFromMessage
} = require('@whiskeysockets/baileys');

function decodeUrl(encodedUrl) {
    const parts = encodedUrl.split('|');
    const url = parts[1];
    return Buffer.from(url, 'base64').toString('utf-8');
}

cmd({
    pattern: 'ytsearch',
    alias: 'yt',
    desc: 'Search for YouTube videos',
    react: '📨',
    category: 'download',
    filename: __filename
}, async (conn, message, msg, { from, quoted, body, isCmd, command, args, q, isGroup, sender, senderNumber, botNumber2, botNumber, pushname, isMe, isOwner, groupMetadata, groupName, participants, groupAdmins, isBotAdmins, isAdmins, reply }) => {
    try {
        if (!q) return reply('*Need title*');

        let searchResults = await yts(q);
        let videos = searchResults.all;

        console.log(videos);

        if (!videos || videos.length === 0) {
            reply('No video found');
            return;
        }

        const randomCount = Math.floor(Math.random() * 10) + 1;
        const selectedVideos = [];

        while (selectedVideos.length < randomCount) {
            const randomIndex = Math.floor(Math.random() * videos.length);
            const selectedVideo = videos.splice(randomIndex, 1)[0];
            selectedVideos.push(selectedVideo);
        }

        let messageContent = [];
        for (let i = 0; i < selectedVideos.length; i++) {
            let video = selectedVideos[i];
            let videoText = `ᴛɪᴛʟᴇ : ${video.title}\nᴜʀʟ : ${video.url}\nᴠɪᴇᴡꜱ : ${video.views}\nᴀɢᴏ : ${video.ago}`;
            let footerText = '© ᴄʀᴇᴀᴛᴇᴅ ʙʏ ꜱᴀᴅᴇᴇꜱʜᴀ ᴄᴏᴅᴇʀ · · ·';

            const mediaMessage = await prepareWAMessageMedia({ image: { url: video.thumbnail } }, { upload: conn.waUploadToServer });

            messageContent.push({
                body: proto.Message.InteractiveMessage.Body.fromObject({ text: videoText }),
                footer: proto.Message.InteractiveMessage.Footer.fromObject({ text: footerText }),
                header: proto.Message.InteractiveMessage.Header.create({ title: 'Video ' + (i + 1), subtitle: '', hasMediaAttachment: true, ...mediaMessage }),
                nativeFlowMessage: proto.Message.InteractiveMessage.NativeFlowMessage.fromObject({
                    buttons: [{ name: 'cta_copy', buttonParamsJson: `{"display_text":"Copy Url 📑","id":"1234","copy_code":"${video.url}"}` }]
                })
            });
        }

        let headerText = 'LARA - MD';
        let footerText = 'ꜱᴀᴅᴇᴇꜱʜᴀ ᴄᴏᴅᴇʀ · · ·';

        const finalMessage = generateWAMessageFromContent(from, {
            viewOnceMessage: {
                message: {
                    messageContextInfo: {
                        deviceListMetadata: {},
                        deviceListMetadataVersion: 2
                    },
                    interactiveMessage: proto.Message.InteractiveMessage.fromObject({
                        body: proto.Message.InteractiveMessage.Body.fromObject({ text: headerText }),
                        footer: proto.Message.InteractiveMessage.Footer.fromObject({ text: footerText }),
                        header: proto.Message.InteractiveMessage.Header.fromObject({ hasMediaAttachment: false }),
                        carouselMessage: proto.Message.InteractiveMessage.CarouselMessage.fromObject({ cards: messageContent }),
                        contextInfo: {
                            mentionedJid: ['94779062397@s.whatsapp.net'],
                            forwardingScore: 999,
                            isForwarded: true,
                            forwardedNewsletterMessageInfo: {
                                newsletterJid: '120363192254044294@newsletter',
                                newsletterName: 'Lααɾα',
                                serverMessageId: 143
                            }
                        }
                    })
                }
            }
        }, { quoted: message });

        await conn.relayMessage(from, finalMessage.message, { messageId: finalMessage.key.id });
        console.log('Button Send Success');
    } catch (error) {
        console.log(error);
        reply('' + error);
    }
});
