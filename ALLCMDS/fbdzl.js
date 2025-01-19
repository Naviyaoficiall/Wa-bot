const { facebook } = require('@mrnima/facebook-downloader');
const { cmd } = require('../command');

cmd({
    pattern: "facebookk",
    desc: "Download videos from Facebook",
    category: "downloader",
    react: "📥",
    filename: __filename
},
async (conn, mek, m, { from, args, reply }) => {
    try {
        // Check if a URL is provided
        if (args.length === 0) {
            return reply("⚠️ Please provide a Facebook video link!\n\n*Example:* .facebook <video_url>");
        }

        const fbUrl = args[0];
        reply("⏳ Fetching the video, please wait...");

        // Fetch video details
        const result = await facebook(fbUrl);

        // Check if the download is successful
        if (!result.success) {
            return reply("❌ Failed to fetch video. Please ensure the link is correct and publicly accessible.");
        }

        // Extract details from the result
        const { title, thumbnail, download } = result;

        // Send the video links and thumbnail
        await conn.sendMessage(from, {
            text: `*🎥 Facebook Video Downloaded:*\n\n*Title:* ${title || "No title"}\n\n📥 *Download Links:*\n🔹 HD: ${download.hd || "Not available"}\n🔹 SD: ${download.sd || "Not available"}\n🔹 Audio: ${download.audio || "Not available"}\n\n🔗 *Thumbnail:*`,
            image: { url: thumbnail },
        });

        // Optional: Send the video directly if the HD or SD link is available
        if (download.hd) {
            await conn.sendMessage(from, { video: { url: download.hd }, caption: `*🎥 Downloaded Video (HD)*\n\n*Title:* ${title}` });
        } else if (download.sd) {
            await conn.sendMessage(from, { video: { url: download.sd }, caption: `*🎥 Downloaded Video (SD)*\n\n*Title:* ${title}` });
        } else {
            reply("⚠️ No downloadable video found in the provided link.");
        }
    } catch (error) {
        console.error(error);
        reply("❌ An error occurred while processing your request.");
    }
});
