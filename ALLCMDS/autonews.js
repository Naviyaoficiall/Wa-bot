const { cmd } = require('../command');

cmd({
    pattern: "news",
    desc: "Get latest news updates",
    category: "news",
    react: "📰",
    filename: __filename,
}, async (conn, message, m, { args, reply }) => {
    try {
        // Get current time
        const now = new Date();
        const timeStr = now.toLocaleTimeString();

        let newsMsg = `*📰 Latest News Updates*\n`;
        newsMsg += `⏰ Time: ${timeStr}\n\n`;
        
        // Add static news content
        newsMsg += await getNewsContent();
        
        // Simple text message without any external requests
        await conn.sendMessage(message.key.remoteJid, { 
            text: newsMsg,
            quoted: message 
        });
        
    } catch (error) {
        console.error("Error:", error);
        await reply("❌ Error sending news");
    }
});

// Simple news generator function
function getNewsContent() {
    const news = [
        "*1. තාක්ෂණික පුවත්*\n" +
        "🔹 නව තාක්ෂණික සංවර්ධන\n" +
        "🔹 AI තාක්ෂණයේ දියුණුව\n\n",
        
        "*2. ක්‍රීඩා පුවත්*\n" +
        "🔹 ක්‍රිකට් තරඟ ප්‍රතිඵල\n" +
        "🔹 ක්‍රීඩා පුහුණු වැඩසටහන්\n\n",
        
        "*3. දේශීය පුවත්*\n" +
        "🔹 ආර්ථික සංවර්ධන වැඩසටහන්\n" +
        "🔹 නව ව්‍යාපෘති ආරම්භය\n\n"
    ];
    
    return news.join('') + "\n📱 Powered by Naviya MD Bot";
}

// Auto update command
let updateInterval;

cmd({
    pattern: "autostart",
    desc: "Start auto news updates",
    category: "news",
    filename: __filename,
}, async (conn, message, m, { reply }) => {
    try {
        if (updateInterval) {
            return await reply("⚠️ Auto updates already running!");
        }

        updateInterval = setInterval(async () => {
            try {
                const newsMsg = `*📰 Auto News Update*\n\n${await getNewsContent()}`;
                await conn.sendMessage(message.key.remoteJid, { 
                    text: newsMsg,
                    quoted: message 
                });
            } catch (err) {
                console.error("Auto update error:", err);
            }
        }, 60000); // 1 minute

        await reply("✅ Auto news started! Updates every minute");
        
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
            return await reply("⚠️ No auto updates running!");
        }

        clearInterval(updateInterval);
        updateInterval = null;
        await reply("✅ Auto news stopped!");
        
    } catch (error) {
        console.error("Error:", error);
        await reply("❌ Error stopping auto updates");
    }
});
