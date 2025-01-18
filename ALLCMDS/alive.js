const fs = require('fs');
const path = require('path');
const axios = require('axios');
const cheerio = require('cheerio');
const { cmd, commands } = require('../command');
const os = require('os');
const { runtime } = require('../lib/functions');

cmd({
    pattern: 'alive',
    alias: ['status', 'uptime', 'runtime'],
    desc: 'Check uptime and system status',
    category: 'main',
    react: '⌚',
    filename: __filename
}, async (conn, mek, m, { from, quoted, body, isCmd, command, args, q, isGroup, sender, senderNumber, botNumber2, botNumber, pushname, isMe, isOwner, groupMetadata, groupName, participants, groupAdmins, isBotAdmins, isAdmins, reply }) => {
    try {
        const uptime = runtime(process.uptime());
        const memoryUsage = (process.memoryUsage().heapUsed / 1024 / 1024).toFixed(2);
        const totalMemory = (os.totalmem() / 1024 / 1024).toFixed(2);
        const hostname = os.hostname();
        const imageUrl = 'https://i.ibb.co/d2SPH4n/IMG-20250116-WA0021-2.jpg';

        const message = `╭━━〔 *✦ RHODVICKEZ MD ✦* 〕━━┈⊷
┃🦄╭─────────────·๏
┃🦄┃• *⏳Uptime*: ${uptime}
┃🦄┃• *📟 Ram usage*: ${memoryUsage} GB / ${totalMemory} GB
┃🦄┃• *⚙️ HostName*: ${hostname}
┃🦄┃• *👨‍💻 Owner*: NAVIYA ㋡
┃🦄┃• *🧬 Version*: 1.0.0
✦ QUENN X SENAYA MD ✦
╰──────────────┈⊷
> © ✦ QUENN X SENAYA MD ✦`;

        await conn.sendMessage(from, { image: { url: imageUrl }, caption: message, contextInfo: { mentionedJid: [m.sender], forwardingScore: 1000, isForwarded: true, forwardedNewsletterMessageInfo: { newsletterJid: '120363389254621003@newsletter', newsletterName: 'QUENN x SENAYA MD', serverMessageId: 143 } } }, { quoted: mek });
    } catch (error) {
        console.error('Error in alive command:', error);
        reply('An error occurred: ' + error.message);
    }
});
