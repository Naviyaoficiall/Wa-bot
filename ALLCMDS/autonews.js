const { cmd } = require('../command');
const axios = require('axios');

// Store last update time
let lastUpdate = new Date();

cmd({
    pattern: "news",
    desc: "Get latest news updates",
    category: "news",
    react: "📰",
    filename: __filename,
}, async (conn, message, m, { args, reply }) => {
    try {
        // Get current date and time in Sri Lanka time
        const now = new Date();
        const sriLankaTime = new Date(now.getTime() + (5.5 * 60 * 60 * 1000));
        const timeStr = sriLankaTime.toLocaleTimeString('si-LK');

        let newsMsg = `*📰 පුවත් අලුත්වීම් - ${timeStr}*\n\n`;

        // Add latest news
        const newsItems = await getLatestNews();
        newsMsg += newsItems;

        // Add footer
        newsMsg += `\n📱 Auto-Updated News | By Naviya MD Bot`;
        
        await reply(newsMsg);
        lastUpdate = now;
        
    } catch (error) {
        console.error("Error:", error);
        await reply("❌ Error: " + error.message);
    }
});

async function getLatestNews() {
    // Simulated news with frequent updates
    const newsTypes = [
        {
            titles: [
                "රට පුරා වැසි තත්වය - කාලගුණ දෙපාර්තමේන්තුව අනතුරු අඟවයි",
                "දිවයිනේ විවිධ ප්‍රදේශවල තද වැසි",
                "නිරිතදිග මෝසම් වැසි තත්වය ඉදිරි දින කිහිපයේදී",
            ],
            source: "කාලගුණ දෙපාර්තමේන්තුව"
        },
        {
            titles: [
                "නව අධ්‍යාපන ප්‍රතිසංස්කරණ යෝජනා",
                "පාසල් විභාග ප්‍රතිඵල නිකුත් කෙරේ",
                "අධ්‍යාපන ක්ෂේත්‍රයේ නව වැඩපිළිවෙล"
            ],
            source: "අධ්‍යාපන අමාත්‍යාංශය"
        },
        {
            titles: [
                "ක්‍රිකට් කණ්ඩායම ජයග්‍රහණය කරයි",
                "නව ක්‍රීඩා පුහුණු මධ්‍යස්ථාන විවෘත කෙරේ",
                "ජාතික ක්‍රීඩා උළෙල ඉදිරියේදී"
            ],
            source: "ක්‍රීඩා අමාත්‍යාංශය"
        }
    ];

    let newsText = "";
    const currentMinute = new Date().getMinutes();
    
    // Select different news based on current time
    for(let i = 0; i < 3; i++) {
        const newsType = newsTypes[i];
        const titleIndex = (currentMinute + i) % newsType.titles.length;
        newsText += `*${i + 1}. ${newsType.titles[titleIndex]}*\n`;
        newsText += `⏰ යාවත්කාලීන කළේ: දැන්\n`;
        newsText += `🔖 මූලාශ්‍රය: ${newsType.source}\n\n`;
    }

    return newsText;
}

// Auto-update variables
let autoUpdateInterval;

cmd({
    pattern: "autostart",
    desc: "Start auto news updates",
    category: "news",
    filename: __filename,
}, async (conn, message, m, { reply }) => {
    try {
        if (autoUpdateInterval) {
            return await reply("❌ Auto updates දැනටමත් ක්‍රියාත්මකයි!");
        }

        // Update every 1 minute
        autoUpdateInterval = setInterval(async () => {
            try {
                const now = new Date();
                const sriLankaTime = new Date(now.getTime() + (5.5 * 60 * 60 * 1000));
                const timeStr = sriLankaTime.toLocaleTimeString('si-LK');
                
                let newsMsg = `*📰 පුවත් අලුත්වීම් - ${timeStr}*\n\n`;
                newsMsg += await getLatestNews();
                newsMsg += `\n📱 Auto-Updated News | By Naviya MD Bot`;
                
                await conn.sendMessage(message.key.remoteJid, { text: newsMsg });
            } catch (error) {
                console.error("Auto update error:", error);
            }
        }, 60 * 1000); // 1 minute interval

        await reply("✅ Auto news updates ආරම්භ විය! හැම විනාඩියකටම update වේ.");
    } catch (error) {
        console.error("Error:", error);
        await reply("❌ Error: " + error.message);
    }
});

cmd({
    pattern: "autostop",
    desc: "Stop auto news updates",
    category: "news",
    filename: __filename,
}, async (conn, message, m, { reply }) => {
    try {
        if (!autoUpdateInterval) {
            return await reply("❌ Auto updates ක්‍රියාත්මක නැත!");
        }

        clearInterval(autoUpdateInterval);
        autoUpdateInterval = null;
        await reply("✅ Auto news updates නතර විය!");
    } catch (error) {
        console.error("Error:", error);
        await reply("❌ Error: " + error.message);
    }
});
