const path = require('path');
const axios = require("axios");
const cheerio = require("cheerio");
const { File } = require("megajs");
const config = require("../config");
const fs = require('fs').promises;
const { fetchJson } = require("../lib/functions");
const { sinhalaSub } = require('mrnima-moviedl');
const { cmd, commands } = require("../command");
const { SinhalaSub } = require("@sl-code-lords/movie-api");
const { PixaldrainDL } = require('pixaldrain-sinhalasub');

// Command to search movies on Fire Movies Hub
cmd({
  pattern: "firemovie",
  alias: ['moviefire2', 'moviesearch'],
  react: '💓',
  desc: "Search Movies on Fire Movies Hub",
  category: "media",
  use: ".firemovie <movie name>",
  filename: __filename
}, async (msg, chat, args, { from, reply, args, q }) => {
  try {
    if (!q) {
      return await reply("\n*🎬 SUPUN FIRE MOVIE SEARCH*\n\nUsage: .firemovie <movie name>\n\nExamples:\n.firemovie Iron Man\n.firemovie Avengers\n.firemovie Spider-Man\n\n*Tips:*\n- Be specific with movie name\n- Use full movie titles");
    }
    await chat.react('🔍');
    const encodedQuery = encodeURIComponent(q);
    const searchResponse = await axios.get("https://www.dark-yasiya-api.site/movie/firemovie/search?text=" + encodedQuery);
    if (!searchResponse.data || !searchResponse.data.status) {
      return await reply("❌ No movies found or API error.");
    }
    const movies = searchResponse.data.result.data;
    if (movies.length === 0) {
      return await reply("❌ No movies found for \"" + q + "\".");
    }
    let searchResultsMessage = "\n╭─────── MOVIE SEARCH ───────●●►\n\n" + movies.map((movie, index) => '*' + (index + 1) + ". " + movie.title + " (" + movie.year + ")*\n   📄 Type: " + movie.type + "\n   🔗 Link: " + movie.link + "\n").join("\n") + "\n\n╰─────────────────────●●►\n*REPLY THE NUMBER FOR DETAILS* \n\n*Choose a number to get movie details*\n\n> ᴘᴀᴡᴇʀᴇᴅ ʙʏ ꜱᴜᴘᴜɴ ᴍᴅ*";
    const sentMessage = await msg.sendMessage(from, {
      text: searchResultsMessage,
      contextInfo: {
        externalAdReply: {
          title: "SUPUN-MD Movie Search",
          body: "Search results for: " + q,
          thumbnailUrl: movies[0].image,
          sourceUrl: movies[0].link,
          mediaType: 1,
          renderLargerThumbnail: true
        }
      }
    }, {
      quoted: chat
    });
    const sentMessageId = sentMessage.key.id;
    msg.ev.on("messages.upsert", async messageEvent => {
      const newMessage = messageEvent.messages[0];
      if (!newMessage.message) {
        return;
      }
      const userResponse = newMessage.message.conversation || newMessage.message.extendedTextMessage?.text;
      const isReplyToOriginalMessage = newMessage.message.extendedTextMessage && newMessage.message.extendedTextMessage.contextInfo.stanzaId === sentMessageId;
      if (isReplyToOriginalMessage) {
        const selectedIndex = parseInt(userResponse) - 1;
        if (selectedIndex >= 0 && selectedIndex < movies.length) {
          const selectedMovie = movies[selectedIndex];
          try {
            const movieDetailsResponse = await axios.get('https://www.dark-yasiya-api.site/movie/firemovie/movie?url=' + encodeURIComponent(selectedMovie.link));
            if (!movieDetailsResponse.data || !movieDetailsResponse.data.status) {
              return await reply("❌ Failed to fetch movie details.");
            }
            const movieDetails = movieDetailsResponse.data.result.data;
            await msg.sendMessage(from, {
              react: {
                text: '🎬',
                key: newMessage.key
              }
            });
            global.movieDownloadDetails = {
              links: movieDetails.dl_links,
              title: movieDetails.title
            };
          } catch (error) {
            console.error("Movie Detail Fetch Error:", error);
            await reply("❌ Failed to fetch movie details.");
          }
        } else {
          await msg.sendMessage(from, {
            react: {
              text: '❓',
              key: newMessage.key
            }
          });
          reply("Please enter a valid movie number!");
        }
      } else {
        if (global.movieDownloadDetails) {
          const downloadIndex = parseInt(userResponse) - 1;
          if (downloadIndex >= 0 && downloadIndex < global.movieDownloadDetails.links.length) {
            const downloadLink = global.movieDownloadDetails.links[downloadIndex];
            await msg.sendMessage(from, {
              react: {
                text: '📥',
                key: newMessage.key
              }
            });
            const preparingMessage = await reply("🔄 Preparing download for " + global.movieDownloadDetails.title + "...");
            try {
              const downloadResponse = await axios({
                method: 'get',
                url: downloadLink.link,
                responseType: 'arraybuffer',
                maxContentLength: Infinity,
                maxBodyLength: Infinity,
                headers: {
                  'User-Agent': "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36"
                }
              });
              const sanitizedTitle = global.movieDownloadDetails.title.replace(/[^a-zA-Z0-9]/g, '_').replace(/__+/g, '_').substring(0, 50);
              const fileName = sanitizedTitle + '_' + downloadLink.quality + ".mp4";
              const filePath = path.join(__dirname, "temp", fileName);
              await fs.mkdir(path.join(__dirname, "temp"), { recursive: true });
              await fs.writeFile(filePath, downloadResponse.data);
              await msg.sendMessage(from, { delete: preparingMessage.key });
              await reply("✅ *Download Complete*\n📥 File: " + fileName);
              setTimeout(async () => {
                try {
                  await fs.unlink(filePath);
                } catch (cleanupError) {
                  console.log("Temp file cleanup error:", cleanupError);
                }
              }, 300000);
              await msg.sendMessage(from, {
                react: {
                  text: '✅',
                  key: newMessage.key
                }
              });
            } catch (downloadError) {
              console.error("Movie Download Error:", downloadError);
              await msg.sendMessage(from, { delete: preparingMessage.key });
              let errorMessage = "❌ Download failed. ";
              if (downloadError.response) {
                switch (downloadError.response.status) {
                  case 404:
                    errorMessage += "Download link is no longer valid.";
                    break;
                  case 403:
                    errorMessage += "Access to the file is restricted.";
                    break;
                  case 500:
                    errorMessage += "Server error occurred.";
                    break;
                  default:
                    errorMessage += "HTTP Error: " + downloadError.response.status;
                }
              } else if (downloadError.code) {
                switch (downloadError.code) {
                  case "ECONNABORTED":
                    errorMessage += "Download timed out.";
                    break;
                  case "ENOTFOUND":
                    errorMessage += "Unable to connect to download server.";
                    break;
                  default:
                    errorMessage += "Network Error: " + downloadError.code;
                }
              } else {
                errorMessage += "An unexpected error occurred.";
              }
              await reply(errorMessage);
              await msg.sendMessage(from, {
                react: {
                  text: '❌',
                  key: newMessage.key
                }
              });
            }
            delete global.movieDownloadDetails;
          }
        }
      }
    });
  } catch (searchError) {
    console.error("Movie Search Error:", searchError);
    await reply("❌ An error occurred during the movie search.");
  }
});
