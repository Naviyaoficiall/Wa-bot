const { cmd } = require('../command');

cmd({
    pattern: "fw",
    desc: "Forward replied message to specific JIDs.",
    category: "utilities",
    react: "📤",
    filename: __filename
},
async (conn, mek, m, { from, quoted, args, reply }) => {
    try {
        // Check if the command is used correctly
        if (!quoted) {
            return reply("⚠️ Please reply to a message to forward it.\n\n*Usage:* .foward <JID>");
        }
        if (args.length === 0) {
            return reply("⚠️ Please provide the JID(s) to forward the message.\n\n*Usage:* .foward <JID1,JID2,...>");
        }

        const targetJIDs = args[0].split(",").map(jid => jid.trim());
        reply("⏳ Forwarding...");

        // Forward the quoted message to each specified JID
        for (const jid of targetJIDs) {
            await conn.copyNForward(jid, mek, true);
        }

        reply(`✅ Message forwarded successfully to:\n${targetJIDs.join("\n")}`);
    } catch (error) {
        console.error(error);
        reply("❌ Failed to forward the message. Please check the input and try again.");
    }
});


cmd({
    pattern: "jixd",
    alias: ["getjid", "activeid"],
    react: "📋",
    desc: "Get JID and mark it active",
    category: "utility",
    filename: __filename
},
async (conn, mek, m, { from, reply, isGroup, groupMetadata }) => {
    try {
        let jidInfo = isGroup
            ? `🔹 *Group JID:* ${from}\n\n👥 *Group Name:* ${groupMetadata.subject || 'Unknown'}`
            : `🔹 *User JID:* ${from}`;

        // Mark the JID as active (Here you can add additional logic)
        reply(`✅ JID is now active:\n\n${jidInfo}`);
        
        // Optionally save the JID to a database or perform another action
        // Example: Save the JID
        console.log(`Active JID: ${from}`);
        
    } catch (e) {
        console.error(e);
        reply("⚠️ An error occurred while retrieving JID.");
    }
});



cmd({
    pattern: "id",
    alias: ["getid"],
    react: "📋",
    desc: "Get JID of a group or user",
    category: "utility",
    filename: __filename
},
async (conn, mek, m, { from, reply, isGroup, groupMetadata }) => {
    try {
        // Check if it's a group
        if (isGroup) {
            reply(`🔹 *Group JID:* ${from}`);
        } else {
            // Individual chat
            reply(`🔹 *User JID:* ${from}`);
        }
    } catch (e) {
        console.log(e);
        reply("⚠️ An error occurred.");
    }
});



cmd({
    pattern: "jid",
    alias: ["getjid", "idj"],
    react: "🆔",
    desc: "Get the JID (Jabber ID) of the chat or user",
    category: "utility",
    use: ".jid",
    filename: __filename
},
async (conn, mek, m, { from, isGroup, sender, reply }) => {
    try {
        // Detecting Group or Individual JID
        const jidType = isGroup ? "Group JID" : "Individual JID";
        const jid = from;

        // Sender JID
        const senderJid = sender;

        // JID Response
        const message = `
🔹 *JID Information* 🔹
📌 *Chat Type:* ${jidType}
🆔 *Chat JID:* ${jid}
🙍‍♂️ *Your JID:* ${senderJid}
        `;
        await reply(message);
    } catch (error) {
        console.error("Error in JID command:", error);
        await reply("⚠️ An error occurred while fetching the JID.");
    }
});

