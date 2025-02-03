const { cmd } = require('../command');
const { delay } = require('../lib/functions'); // Delay function for simulation

cmd({
    pattern: "fakereact",
    alias: ["fr"],
    category: "fun",
    desc: "Send fake reactions to a WhatsApp channel",
    filename: __filename
}, async (conn, mek, m, { from, quoted, body, args, reply }) => {
    try {
        // Check if the command is properly formatted
        if (!args[0] || !args[1]) {
            return reply("*❌ Please provide a WhatsApp channel link and the number of reactions!*\nExample: `.fr https://whatsapp.com/channel/0029VaxwOyB2v1IscQP8Ko2F/107 50`");
        }

        const channelLink = args[0]; // WhatsApp channel link
        const reactionCount = parseInt(args[1]); // Number of reactions to send
        const emoji = args[2] || "🤡"; // Custom emoji (default: 🤡)

        // Validate reaction count
        if (isNaN(reactionCount) || reactionCount <= 0) {
            return reply("*❌ Invalid reaction count! Please provide a positive number.*");
        }

        // Extract channel ID from the link
        const channelId = channelLink.split('/').pop();
        if (!channelId) {
            return reply("*❌ Invalid WhatsApp channel link!*");
        }

        // Simulate sending reactions
        reply(`✅ Sending *${reactionCount}* fake reactions (${emoji}) to the channel...`);

        for (let i = 1; i <= reactionCount; i++) {
            await conn.sendMessage(channelId, {
                react: {
                    text: emoji,
                    key: { id: `fake-reaction-${i}` } // Fake message ID
                }
            });

            // Add a delay to simulate real reactions
            await delay(1000); // 1-second delay between reactions

            // Delete the reaction after a short delay (fake effect)
            await conn.sendMessage(channelId, {
                react: {
                    text: "", // Empty string to remove reaction
                    key: { id: `fake-reaction-${i}` }
                }
            });
        }

        // Confirm completion
        reply(`✅ Successfully sent *${reactionCount}* fake reactions (${emoji}) to the channel!`);

    } catch (error) {
        console.error(error);
        reply("*❌ Failed to send fake reactions!*");
    }
});
