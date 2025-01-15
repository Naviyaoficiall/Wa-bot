const { cmd } = require('../command');

// Rest of the news database remains same...

function getRotatingNews(username) {
    const now = new Date();
    const sriLankaTime = new Date(now.getTime() + (5.5 * 60 * 60 * 1000)); // Convert to Sri Lanka time
    newsIndex = (newsIndex + 1) % 5;
    
    let newsMsg = `*📰 NAVIYA NEWS UPDATE*\n`;
    newsMsg += `➖➖➖➖➖➖➖➖➖➖➖\n\n`;
    
    // Add personalized header
    newsMsg += `👋 Welcome, *${username}*!\n`;
    newsMsg += `🗓️ ${sriLankaTime.toLocaleDateString()}\n`;
    newsMsg += `⏰ ${sriLankaTime.toLocaleTimeString()}\n\n`;
    
    newsMsg += `*🌟 TODAY'S HEADLINES*\n`;
    newsMsg += `➖➖➖➖➖➖➖➖➖➖➖\n\n`;
    
    newsMsg += `*💻 තාක්ෂණික පුවත්*\n`;
    newsMsg += `• ${newsDatabase.tech[newsIndex]}\n\n`;
    
    newsMsg += `*⚽ ක්‍රීඩා පුවත්*\n`;
    newsMsg += `• ${newsDatabase.sports[newsIndex]}\n\n`;
    
    newsMsg += `*🏛️ දේශීය පුවත්*\n`;
    newsMsg += `• ${newsDatabase.local[newsIndex]}\n\n`;
    
    newsMsg += `*💹 ව්‍යාපාරික පුවත්*\n`;
    newsMsg += `• ${newsDatabase.business[newsIndex]}\n\n`;
    
    newsMsg += `➖➖➖➖➖➖➖➖➖➖➖\n`;
    newsMsg += `📱 Powered by *NAVIYA MD*\n`;
    newsMsg += `🔄 Auto-Updated News Service\n`;
    newsMsg += `👨‍💻 Created by: ${username}`;
    
    return newsMsg;
}

cmd({
    pattern: "news",
    desc: "Get latest news updates",
    category: "news",
    react: "📰",
    filename: __filename,
}, async (conn, message, m, { reply }) => {
    try {
        const username = message.pushName || "User"; // Get user's name
        await conn.sendMessage(message.key.remoteJid, { 
            text: getRotatingNews(username),
            quoted: message 
        });
    } catch (error) {
        console.error("Error:", error);
        await reply("❌ පුවත් ලබාගැනීමේ දෝෂයක් ඇති විය");
    }
});

// Auto update command
let updateInterval;
let startTime;

cmd({
    pattern: "autostart",
    desc: "Start auto news updates",
    category: "news",
    filename: __filename,
}, async (conn, message, m, { reply }) => {
    try {
        if (updateInterval) {
            return await reply("⚠️ Auto-updates already running!");
        }

        startTime = new Date();
        const username = message.pushName || "User";

        updateInterval = setInterval(async () => {
            try {
                await conn.sendMessage(message.key.remoteJid, { 
                    text: getRotatingNews(username),
                    quoted: message 
                });
            } catch (err) {
                console.error("Auto update error:", err);
            }
        }, 60000);

        await reply(`*📰 NAVIYA NEWS AUTO-UPDATE*\n\n` +
                   `✅ Status: Active\n` +
                   `👤 User: ${username}\n` +
                   `⏱️ Interval: 60 seconds\n` +
                   `🕐 Started: ${startTime.toLocaleTimeString()}`);
        
    } catch (error) {
        console.error("Error:", error);
        await reply("❌ Error starting auto updates");
    }
});

cmd({
    pattern: "autostop",
    desc: "Stop auto news updates",
    category: "news",
    filename: __filename,
}, async (conn, message, m, { reply }) => {
    try {
        if (!updateInterval) {
            return await reply("⚠️ No auto-updates running!");
        }

        clearInterval(updateInterval);
        updateInterval = null;
        
        const runTime = Math.round((new Date() - startTime) / 1000);
        const username = message.pushName || "User";

        await reply(`*📰 NAVIYA NEWS AUTO-UPDATE*\n\n` +
                   `❌ Status: Stopped\n` +
                   `👤 User: ${username}\n` +
                   `⏱️ Run Time: ${runTime} seconds\n` +
                   `🕐 Stopped: ${new Date().toLocaleTimeString()}`);
        
    } catch (error) {
        console.error("Error:", error);
        await reply("❌ Error stopping auto updates");
    }
});
