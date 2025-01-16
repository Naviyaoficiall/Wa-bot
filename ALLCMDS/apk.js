const axios = require('axios');
const { cmd } = require('../command');

cmd({
  pattern: "apk",
  desc: "Download apk.",
  category: "download",
  filename: __filename
}, async (conn, message, msg, { from, quoted, body, isCmd, command, args, q, isGroup, sender, senderNumber, botNumber2, botNumber, pushname, isMe, isOwner, groupMetadata, groupName, participants, groupAdmins, isBotAdmins, isAdmins, reply }) => {
  try {
    await msg.react('⬇');

    // Construct the URL for the Aptoide API call
    const searchUrl = 'http://ws75.aptoide.com/api/7/apps/search/query=' + q + "/limit=1";
    
    // Fetch data from the Aptoide API
    const response = await axios.get(searchUrl);
    const data = response.data;

    // Extract relevant information from the API response
    const appInfo = data.datalist.list[0];
    const appSizeInBytes = appInfo.size;
    const appSizeInMB = (appSizeInBytes / (1024 * 1024)).toFixed(2);
    const appDetails = {
      name: appInfo.name,
      size: appSizeInMB + " MB",
      package: appInfo.package,
      updated: appInfo.updated,
      developer: appInfo.developer.name,
      downloadUrl: appInfo.file.path_alt
    };

    // Construct the message caption with app details
    const caption = `〔 *FREDI APPSTORE* 〕\n▸╭───────────\n▸┃☞ *APK DOWNLOADER⁠*\n▸└───────────···๏\n╰────────────────┈⊷\n╭━━━❐━⪼\n┇☞ *Name* - ${appDetails.name}\n┇☞ *Size* - ${appDetails.size}\n┇☞ *Package* - ${appDetails.package}\n┇☞ *Updated On* - ${appDetails.updated}\n┇☞ *Developer* - ${appDetails.developer}\n╰━━━❐━⪼\n> *© Gᴇɴᴇʀᴀᴛᴇᴅ ʙʏ FREDI MD*`;

    await msg.react('⬆');

    // Send the APK file to the user
    await conn.sendMessage(from, {
      document: {
        url: appDetails.downloadUrl
      },
      fileName: appDetails.name,
      mimetype: "application/vnd.android.package-archive",
      caption: caption
    }, {
      quoted: message
    });

    await msg.react('✅');
  } catch (error) {
    console.log(error);
    reply('' + error);
  }
});
