const axios = require("axios");
const puppeteer = require("puppeteer");
const { cmd } = require("../command");

cmd({
  pattern: "cinesubz",
  alias: ["cs"],
  react: "🎬",
  category: "download",
  desc: "Search movies on CineSubz and get download links",
  filename: __filename
}, async (conn, message, msg, { from, q, reply }) => {
  try {
    if (!q) return await reply("*Please provide a search query! (e.g., Deadpool)*");

    // Scraping movie search results from CineSubz
    const browser = await puppeteer.launch({
      headless: true,
      args: [
        "--no-sandbox",
        "--disable-setuid-sandbox",
        "--disable-gpu",
        "--disable-dev-shm-usage",
        "--single-process"
      ],
      executablePath: process.env.PUPPETEER_EXECUTABLE_PATH || "/usr/bin/google-chrome-stable"
    });

    const page = await browser.newPage();
    await page.goto(`https://cinesubz.co/?s=${encodeURIComponent(q)}`, { waitUntil: "domcontentloaded" });

    const movies = await page.evaluate(() => {
      const results = [];
      document.querySelectorAll(".result-item").forEach((item) => {
        const title = item.querySelector(".title a")?.textContent.trim();
        const link = item.querySelector(".title a")?.href;
        if (title && link) results.push({ title, link });
      });
      return results;
    });

    await browser.close();

    if (!movies.length) return await reply("No results found for: " + q);

    let resultMessage = `🎥 *Search Results for* "${q}":\n\n`;
    movies.forEach((movie, index) => {
      resultMessage += `*${index + 1}.* ${movie.title}\n🔗 Link: ${movie.link}\n\n`;
    });

    const sentMessage = await conn.sendMessage(from, { text: resultMessage }, { quoted: message });
    const messageId = sentMessage.key.id;

    conn.ev.on("messages.upsert", async msgUpdate => {
      const newMsg = msgUpdate.messages[0];
      if (!newMsg.message) return;

      const userText = newMsg.message.conversation || newMsg.message.extendedTextMessage?.text;
      const isReplyToBot = newMsg.message.extendedTextMessage && newMsg.message.extendedTextMessage.contextInfo.stanzaId === messageId;

      if (isReplyToBot) {
        const selectedNumber = parseInt(userText.trim());
        if (!isNaN(selectedNumber) && selectedNumber > 0 && selectedNumber <= movies.length) {
          const selectedMovie = movies[selectedNumber - 1];

          // Scraping movie details and download links
          const browser2 = await puppeteer.launch({
            headless: true,
            args: ["--no-sandbox", "--disable-setuid-sandbox"]
          });

          const page2 = await browser2.newPage();
          await page2.goto(selectedMovie.link, { waitUntil: "domcontentloaded" });

          const movieDetails = await page2.evaluate(() => {
            const title = document.querySelector(".post-title h1")?.textContent.trim() || "Unknown Title";
            const image = document.querySelector(".post-thumbnail img")?.src || "";
            const downloadLinks = [];
            document.querySelectorAll(".download-links a").forEach((a) => {
              const quality = a.textContent.trim();
              const link = a.href;
              if (quality && link) downloadLinks.push({ quality, link });
            });
            return { title, image, downloadLinks };
          });

          await browser2.close();

          if (!movieDetails.downloadLinks.length) return await reply("No download links found.");

          let linksMessage = `🎬 *${movieDetails.title}*\n\n`;
          linksMessage += "*Available Download Links:*\n";
          movieDetails.downloadLinks.forEach((link, index) => {
            linksMessage += `*${index + 1}.* ${link.quality}\n🔗 Link: ${link.link}\n\n`;
          });

          const downloadMessage = await conn.sendMessage(from, { text: linksMessage }, { quoted: newMsg });
          const downloadMessageId = downloadMessage.key.id;

          conn.ev.on("messages.upsert", async downloadMsgUpdate => {
            const downloadMsg = downloadMsgUpdate.messages[0];
            if (!downloadMsg.message) return;

            const downloadText = downloadMsg.message.conversation || downloadMsg.message.extendedTextMessage?.text;
            const isReplyToDownloadMessage = downloadMsg.message.extendedTextMessage && downloadMsg.message.extendedTextMessage.contextInfo.stanzaId === downloadMessageId;

            if (isReplyToDownloadMessage) {
              const downloadNumber = parseInt(downloadText.trim());
              if (!isNaN(downloadNumber) && downloadNumber > 0 && downloadNumber <= movieDetails.downloadLinks.length) {
                const selectedLink = movieDetails.downloadLinks[downloadNumber - 1];

                await conn.sendMessage(from, { react: { text: "⬇️", key: message.key } });

                await conn.sendMessage(from, {
                  document: { url: selectedLink.link },
                  mimetype: "video/mp4",
                  fileName: `${movieDetails.title} - ${selectedLink.quality}.mp4`,
                  caption: `${movieDetails.title}\nQuality: ${selectedLink.quality}\nDownloaded from CineSubz`,
                  contextInfo: {
                    mentionedJid: [],
                    externalAdReply: {
                      title: movieDetails.title,
                      body: "Download from CineSubz",
                      mediaType: 1,
                      sourceUrl: selectedMovie.link,
                      thumbnailUrl: movieDetails.image
                    }
                  }
                }, { quoted: downloadMsg });

                await conn.sendMessage(from, { react: { text: "✅", key: message.key } });
              } else {
                await reply("Invalid selection. Please reply with a valid number.");
              }
            }
          });
        } else {
          await reply("Invalid selection. Please reply with a valid number.");
        }
      }
    });
  } catch (error) {
    console.error("Error during search:", error);
    reply("*An error occurred while searching!*");
  }
});
