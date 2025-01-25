const axios = require("axios");
const FormData = require("form-data");
const fs = require('fs');
const os = require('os');
const path = require('path');
const { cmd } = require("../command");

cmd({
  'pattern': "tourl",
  'alias': ["imgtourl", "img2url", "url"],
  'react': '🖇',
  'desc': "Convert an image to a URL using imgbb.",
  'category': "utility",
  'use': ".tourl",
  'filename': __filename
}, async (bot, message, args, details) => { // Updated variable names for clarity
  const { from, quoted, reply, sender } = details; // Destructure details for easier access
  try {
    const quotedMessage = message.quoted ? message.quoted : message; // Check if the message is a reply to another message
    const mimeType = (quotedMessage.msg || quotedMessage).mimetype || ''; // Get the mime type of the quoted message

    // Debugging image mime type
    console.log("Image mime type: ", mimeType);

    if (!mimeType || !mimeType.startsWith("image")) { // Check if the mime type is an image
      throw "🌻 Please reply to an image.";
    }

    // Download the image
    const imageBuffer = await quotedMessage.download();
    const tempImagePath = path.join(os.tmpdir(), "temp_image");
    fs.writeFileSync(tempImagePath, imageBuffer);

    // Debugging: Check file size and existence
    console.log("Temporary file saved at:", tempImagePath);
    console.log("Image size: ", imageBuffer.length, "bytes");

    // Prepare image for upload
    const formData = new FormData();
    formData.append("image", fs.createReadStream(tempImagePath));

    // Send image to imgbb
    const response = await axios.post("https://api.imgbb.com/1/upload?key=97e6e1853e3a631fd261c720d6cdfc1e", formData, {
      'headers': {
        ...formData.getHeaders()
      }
    });

    // Debugging API response
    console.log("API Response:", response.data);

    if (!response.data || !response.data.data || !response.data.data.url) { // Check if the response contains a URL
      throw "❌ Failed to upload the file.";
    }

    const imageUrl = response.data.data.url;
    
    // Clean up the temporary file
    fs.unlinkSync(tempImagePath);

    const contextInfo = {
      'mentionedJid': [sender],
      'forwardingScore': 999,
      'isForwarded': true,
      'forwardedNewsletterMessageInfo': {
        'newsletterJid': '120363389254621003@newsletter',
        'newsletterName': "Qᴜᴜᴇɴ x ꜱᴇɴᴀʏᴀ ᴍᴅ 🧚",
        'serverMessageId': 143
      }
    };

    // Send the URL as a reply
    await bot.sendMessage(from, {
      'text': `*Image Uploaded Successfully 📸*\nSize: ${imageBuffer.length} Byte(s)\n*URL:* ${imageUrl}\n\n> ⚖️ Uploaded via ✦Qᴜᴇᴇɴ x ꜱᴇɴᴀʏᴀ ᴍᴅ✦`,
      'contextInfo': contextInfo
    });

  } catch (error) {
    // Handle errors and log them
    reply("Error: " + error);
    console.error("Error occurred:", error);
  }
});


      
