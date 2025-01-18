const { cmd } = require("../command");

cmd({
    pattern: "jid", // Command name
    alias: ["channeljid"],
    react: "📡",
    category: "utility",
    desc: "Get the JID of a WhatsApp channel",
    filename: __filename,
}, async (conn, mek, m, { from, reply }) => {
    try {
        if (!mek.message) {
            return reply("*No message found! Please use this command in a channel.*");
        }

        // Extract the JID from the message
        const channelJid = mek.key.remoteJid;

        if (!channelJid) {
            return reply("*❌ Failed to retrieve the channel JID.*");
        }

        // Send the channel JID back to the user
        await reply(`✅ *Channel JID:* \n\`${channelJid}\``);
    } catch (error) {
        console.error(error);
        reply(`❌ *An error occurred!*\n\n${error.message || error}`);
    }
});
