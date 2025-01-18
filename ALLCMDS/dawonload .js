const fs = require('fs');
const path = require('path');
const cheerio = require('cheerio');
const axios = require('axios');
const { cmd, commands } = require('../command');
const { sinhalaSub } = require('mrnima-moviedl'); // Replace with the actual path to the sinhalaSub module

// Command to download APK files
cmd({
  'pattern': 'apk',
  'alias': ['apkdl'],
  'react': '📑',
  'category': 'download',
  'desc': 'Download APK files from Aptoide',
  'filename': __filename
}, async (conn, message, msg, { from, q, reply }) => {
  try {
    if (!q) return await reply('Please provide an app name!');
    
    const searchUrl = `http://ws75.aptoide.com/api/7/apps/search/query=${encodeURIComponent(q)}&limit=1`;
    const searchResult = await axios.get(searchUrl);
    const appDetails = searchResult.data.datalist.list[0];
    const appSizeMB = (appDetails.size / 1048576).toFixed(2);
    
    let caption = `
╭━━━〔 *KHAN-MD* 〕━━━┈⊷
┃▸╭───────────
┃▸┃๏ *APK DOWNLOADER*
┃▸└───────────···๏
╰────────────────┈⊷
╭━━━❐━⪼
┇๏ *Name* - ${appDetails.name}
┇๏ *Size* - ${appSizeMB} MB
┇๏ *Package* - ${appDetails.package}
┇๏ *Updated On* - ${appDetails.updated}
┇๏ *Developer* - ${appDetails.developer.name}
╰━━━❐━⪼
> *© Powered By KhanX-Ai ♡*
`;
    
    await msg.react('⬆');
    await conn.sendMessage(from, {
      'document': { 'url': appDetails.file.path },
      'fileName': appDetails.name,
      'mimetype': 'application/vnd.android.package-archive',
      'caption': caption
    }, { 'quoted': message });
    await msg.react('✅');
  } catch (error) {
    console.error(error);
    reply('' + error);
  }
});

// Command to search movies on SinhalaSub and get download links
cmd({
  'pattern': 'movies',
  'alias': ['movie'],
  'react': '📑',
  'category': 'download',
  'desc': 'Search movies on sinhalasub and get download links',
  'filename': __filename
}, async (conn, message, msg, { from, q, reply }) => {
  try {
    if (!q) return await reply('Please provide a search query!');
    
    const sinhalaSubInstance = await sinhalaSub();
    const searchResults = await sinhalaSubInstance.search(q);
    const movies = searchResults.result.slice(0, 10);
    
    if (!movies || movies.length === 0) return await reply(`No results found for: ${q}`);
    
    let responseText = `Movies found for ${q}:\n\n`;
    movies.forEach((movie, index) => {
      responseText += `*${index + 1}.* ${movie.title}\nLink: ${movie.link}\n\n`;
    });
    
    const sentMessage = await conn.sendMessage(from, { 'text': responseText }, { 'quoted': message });
    const messageId = sentMessage.key.id;
    
    conn.ev.on('messages.upsert', async chatUpdate => {
      const m = chatUpdate.messages[0];
      if (!m.message) return;
      const text = m.message.conversation || m.message.extendedTextMessage?.text;
      const remoteJid = m.key.remoteJid;
      const isQuoted = m.message.extendedTextMessage && m.message.extendedTextMessage.contextInfo.stanzaId === messageId;
      
      if (isQuoted) {
        const selection = parseInt(text.trim());
        if (!isNaN(selection) && selection > 0 && selection <= movies.length) {
          const selectedMovie = movies[selection - 1];
          const movieApiUrl = `https://api-site-2.vercel.app/api/sinhalasub/movie?url=${encodeURIComponent(selectedMovie.link)}`;
          
          try {
            const movieDetails = await axios.get(movieApiUrl);
            const movieData = movieDetails.data.result;
            const downloadLinks = movieData.downloadLinks || [];
            
            if (downloadLinks.length === 0) return await reply('No downloadable link found for this movie.');
            
            let downloadText = `🎥 *${movieData.title}*\n\nDownload Links:\n`;
            downloadLinks.forEach((link, index) => {
              downloadText += `*${index + 1}.* Quality: ${link.quality} - Size: ${link.size}\nLink: ${link.link}\n\n`;
            });
            
            const downloadMessage = await conn.sendMessage(from, { 'text': downloadText }, { 'quoted': m });
            const downloadMessageId = downloadMessage.key.id;
            
            conn.ev.on('messages.upsert', async downloadChatUpdate => {
              const downloadMessage = downloadChatUpdate.messages[0];
              if (!downloadMessage.message) return;
              const downloadText = downloadMessage.message.conversation || downloadMessage.message.extendedTextMessage?.text;
              const downloadRemoteJid = downloadMessage.key.remoteJid;
              const isDownloadQuoted = downloadMessage.message.extendedTextMessage && downloadMessage.message.extendedTextMessage.contextInfo.stanzaId === downloadMessageId;
              
              if (isDownloadQuoted) {
                const downloadSelection = parseInt(downloadText.trim());
                if (!isNaN(downloadSelection) && downloadSelection > 0 && downloadSelection <= downloadLinks.length) {
                  const selectedLink = downloadLinks[downloadSelection - 1];
                  const fileName = selectedLink.link.split('/').pop();
                  await conn.sendMessage(from, { 'react': { 'text': '⬇️', 'key': message.key } });
                  const downloadUrl = `https://api.fgmods.xyz/api/downloader/gdrive?url=${selectedLink.link}`;
                  const downloadResponse = await axios.get(downloadUrl);
                  const downloadData = downloadResponse.data.result.downloadUrl;
                  
                  if (downloadData) {
                    await conn.sendMessage(from, { 'react': { 'text': '⬆️', 'key': message.key } });
                    await conn.sendMessage(from, {
                      'document': { 'url': downloadData },
                      'mimetype': 'application/zip',
                      'fileName': `${movieData.title} - ${selectedLink.quality}.zip`,
                      'caption': `${movieData.title}\nQuality: ${selectedLink.quality}`,
                      'contextInfo': {
                        'mentionedJid': [],
                        'externalAdReply': {
                          'title': movieData.title,
                          'body': 'Download from SinhalaSub',
                          'mediaType': 1,
                          'sourceUrl': selectedMovie.link,
                          'thumbnailUrl': movieData.thumbnail
                        }
                      }
                    }, { 'quoted': downloadMessage });
                    await conn.sendMessage(from, { 'react': { 'text': '✅', 'key': message.key } });
                  } else {
                    await reply('Failed to retrieve the download link for this movie.');
                  }
                } else {
                  await reply('Invalid selection. Please reply with a valid number.');
                }
              }
            });
          } catch (error) {
            console.error('Error fetching the download link:', error);
            await reply('An error occurred while trying to fetch the download link.');
          }
        } else {
          await reply('Invalid selection. Please reply with a valid number.');
        }
      }
    });
  } catch (error) {
    console.error(error);
    await reply('*An error occurred while searching!*');
  }
});

// Command to download Gdrive files
cmd({
  'pattern': 'gdrivee',
  'desc': 'To download Gdrive files.',
  'react': '🌐',
  'category': 'download',
  'filename': __filename
}, async (conn, message, msg, { from, quoted, body, isCmd, command, args, q, isGroup, sender, senderNumber, botNumber2, botNumber, pushname, isMe, isOwner, groupMetadata, groupName, participants, groupAdmins, isBotAdmins, isAdmins, reply }) => {
  try {
    await conn.sendMessage(from, { 'react': { 'text': '⬇️', 'key': message.key } });
    if (!q) return msg.reply('Please Give Me a valid Link...');
    const downloadUrl = `https://api.fgmods.xyz/api/downloader/gdrive?url=${q}`;
    const result = await axios.get(downloadUrl);
    const downloadLink = result.data.result.downloadUrl;
    if (downloadLink) {
      await conn.sendMessage(from, { 'react': { 'text': '⬆️', 'key': message.key } });
      await conn.sendMessage(from, {
        'document': { 'url': downloadLink },
        'mimetype': result.data.result.mimetype,
        'fileName': result.data.result.fileName,
        'caption': 'Downloaded from Gdrive'
      }, { 'quoted': message });
      await conn.sendMessage(from, { 'react': { 'text': '✅', 'key': message.key } });
    }
  } catch (error) {
    console.error(error);
  }
});
