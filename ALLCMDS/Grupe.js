const { cmd, commands } = require('../command');
const MessageType = require('@whiskeysockets/baileys');
const { generateWAMessageFromContent } = require('@whiskeysockets/baileys');

cmd({
    pattern: "hidetag",
    desc: "Send a message and hide tags.",
    category: "group",
    react: "🔔",
    filename: __filename,
    group: true,
    admin: true
},
async (conn, message, m, { from, quoted, body, isCmd, command, args, q, isGroup, sender, senderNumber, botNumber2, botNumber, pushname, isMe, isOwner, groupMetadata, groupName, participants, groupAdmins, isBotAdmins, isAdmins, reply }) => {
    try {
        // Get the text to send
        const text = args.join(' ');
        
        // Get all participant JIDs
        let users = participants.map(u => conn.decodeJid(u.id));
        
        let q = m.quoted ? m.quoted : m;
        let c = m.quoted ? m.quoted : m.msg;
        
        // Generate the message content
        const msg = conn.cMod(m.chat,
            generateWAMessageFromContent(m.chat, {
                [c.toJSON ? q.mtype : 'extendedTextMessage']: c.toJSON ? c.toJSON() : {
                    text: c || ''
                }
            }, {
                quoted: m,
                userJid: conn.user.id
            }),
            text || q.text, conn.user.jid, { mentions: users }
        );
        
        // Relay the message
        await conn.relayMessage(m.chat, msg.message, { messageId: msg.key.id });
        
        // React with a success emoji
        await conn.sendMessage(from, { react: { text: '✅', key: m.key } });
    } catch (error) {
        // Log and handle any errors
        console.error('Error sending hidetag message:', error.message, error.stack);
        await reply('⚠️ An error occurred while processing the request. Please try again later.');
        await conn.sendMessage(from, { react: { text: '❌', key: m.key } });
    }
});
