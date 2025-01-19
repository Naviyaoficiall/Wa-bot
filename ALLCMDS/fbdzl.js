const { facebook } = require('@mrnima/facebook-downloader'); // Import the package
const { cmd } = require('../command'); // Import the command handler

cmd({
    pattern: "fbdls", // Command trigger
    desc: "Download videos from Facebook", // Description
    category: "downloader", // Command categor// Reaction emoji
    filename: __filename // Required for dynamic help
},
async (conn, mek, m, { from, args, reply, isGroup }) => {
    try {
        if (args.length === 0) {
            return reply("Please provide a Facebook video link!\n\n*Usage:* .facebook <video_url>");
        }

        const fbUrl = args[0]; // Get the Facebook video URL from the user input

        // Inform the user the download process is starting
        reply("⏳ Downloading video, please wait...");

        // Fetch video details
        const result = await facebook(fbUrl);

        if (!result.success) {
            return reply("❌ Failed to fetch video. Please make sure the link is correct!");
        }

        const { title, thumbnail, download } = result; // Extract data

        // Send the video or download links to the user
        await conn.sendMessage(from, {
            text: `*🎥 Facebook Video Downloaded:*\n\n*Title:* ${title}\n\n📥 *Download Links:*\nHD: ${download.hd || "Not available"}\nSD: ${download.sd || "Not available"}\nAudio: ${download.audio || "Not available"}\n\n🔗 *Thumbnail:*`,
            image: { url: thumbnail }, // Send the thumbnail image
        });
    } catch (error) {
        console.error(error);
        reply("❌ An error occurred while processing your request.");
    }
});
