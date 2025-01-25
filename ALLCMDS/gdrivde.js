const axios = require("axios");
const fs = require("fs");
const { cmd } = require("../command");

cmd({
  pattern: "gdrive",
  alias: ["gdl"],
  react: "📂",
  category: "download",
  desc: "Download files from Google Drive",
  filename: __filename
}, async (conn, message, msg, { from, q, reply }) => {
  try {
    if (!q) return await reply("*Please provide a Google Drive download link!*");

    // Extracting file ID from the Google Drive link
    const fileIdMatch = q.match(/id=([^&]+)/);
    if (!fileIdMatch) return await reply("*Invalid Google Drive link!*");

    const fileId = fileIdMatch[1];
    const downloadUrl = `https://drive.google.com/uc?export=download&id=${fileId}`;

    // Downloading the file
    const response = await axios({
      url: downloadUrl,
      method: "GET",
      responseType: "stream"
    });

    const filePath = `./downloads/${fileId}.file`; // Path where the file will be temporarily stored

    // Saving the file to the local file system
    const writer = fs.createWriteStream(filePath);
    response.data.pipe(writer);

    // Returning a promise that resolves when the file is fully downloaded
    await new Promise((resolve, reject) => {
      writer.on("finish", resolve);
      writer.on("error", reject);
    });

    // Sending the file to the user
    await conn.sendMessage(from, {
      document: { url: filePath },
      mimetype: response.headers["content-type"],
      fileName: `${fileId}.file`,
      caption: "Downloaded from Google Drive"
    }, { quoted: message });

    // Deleting the file after sending
    fs.unlinkSync(filePath);

  } catch (error) {
    console.error("Error during download:", error);
    reply("*An error occurred while downloading the file!*");
  }
});
