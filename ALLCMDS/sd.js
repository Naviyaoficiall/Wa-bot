const axios = require('axios');
const config = require('../config');
const fs = require('fs').promises;
const path = require('path');
const { fetchJson } = require('../lib/functions');
const { sinhalaSub } = require('../lib/sinhalasub');
const { cmd, commands } = require('../command');
const { SinhalaSub } = require('../lib/sinhalasub');
const { PixaldrainDL } = require('../lib/pixaldrain');

const apiUrl = 'https://www.dark-yasiya-api.site/movie/sinhalasub/movie?url=';

// Function to decode obfuscated strings
function _0x4809(_0x1d2138, _0x2cb85b) {
    const _0x2488d6 = _0x2488();
    return _0x4809 = function (_0x480969, _0x369a96) {
        _0x480969 = _0x480969 - 0x1dc;
        let _0x2d6306 = _0x2488d6[_0x480969];
        return _0x2d6306;
    }, _0x4809(_0x1d2138, _0x2cb85b);
}

// Array of actual strings used in the code
function _0x2488() {
    const _0x28a5f0 = ['...']; // Actual strings here
    _0x2488 = function () { return _0x28a5f0; };
    return _0x2488();
}

let baseUrl;

// Fetch base URL asynchronously
(async () => {
    let data = await fetchJson('https://raw.githubusercontent.com/prabathLK/PUBLIC-URL-HOST-DB/main/public/url.json');
    baseUrl = data.url;
})();

const yourName = '❗මෙය වෙබ් පිටපතක් වන අතර,සිංහල උපසිරැසි වෙනම එකතු කරගැනීමට *සිංහල උපසිරැසි* Button එක click කරන්න.\n\n> *ꜱᴜᴘᴜɴ ᴍᴅ ᴍᴏᴠɪᴇ ᴅᴏᴡɴʟᴏᴀᴅᴇʀ*\n\n 🎬*ꜱᴜᴘᴜɴ ᴍᴅ ᴍᴏᴠɪᴇ ᴅᴏᴡɴʟᴏᴀᴅᴇʀ*🎬​';

// Command to search SinhalaSub movies
cmd({
    pattern: 'sinhalasub',
    alias: ['.sinhalasub'],
    react: '📑',
    category: 'movies',
    desc: 'Download sinhalasub movie.',
    filename: __filename
}, async (_349a23, _cee029, _29dbb1, { from, q, reply }) => {
    try {
        if (!q) return await reply('Please provide a search query! (e.g., Deadpool)');
        const sinhalaSubInstance = await sinhalaSub();
        const searchResults = await sinhalaSubInstance.search(q);
        const limitedResults = searchResults.results.slice(0, 10);

        if (!limitedResults.length) return await reply('No results found for: ' + q);

        let message = '📽️ *Search Results for* "' + q + '":\n\n';
        limitedResults.forEach((result, index) => {
            message += '*' + (index + 1) + '* | ' + result.title + ' | ' + result.link + '\n\n';
        });

        const sentMessage = await _349a23.sendMessage(from, { text: message }, { quoted: _29dbb1 });
        const sentMessageId = sentMessage.key.id;

        _349a23.ev.on('messages.upsert', async event => {
            const message = event.messages[0];

            if (!message.message) return;

            const messageContent = message.message.conversation || message.message.extendedTextMessage?.text;
            const isReplyToSentMessage = message.message.extendedTextMessage && message.message.extendedTextMessage.contextInfo.stanzaId === sentMessageId;

            if (isReplyToSentMessage) {
                const selectedNumber = parseInt(messageContent.trim());

                if (!isNaN(selectedNumber) && selectedNumber > 0 && selectedNumber <= limitedResults.length) {
                    const selectedMovie = limitedResults[selectedNumber - 1];
                    const movieUrl = apiUrl + encodeURIComponent(selectedMovie.link);

                    try {
                        const response = await axios.get(movieUrl);
                        const downloadLinks = response.data.results.dl_links || [];

                        if (!downloadLinks.length) return await reply('No download options found.');

                        let downloadMessage = '*🎩 MOVIE DOWNLOAD SYSTEM 🎥*\n\n*Title:* ' + response.data.results.title + '\n\n*Available PixelDrain Download Links:*\n';
                        downloadLinks.forEach((link, index) => {
                            downloadMessage += '*' + (index + 1) + '* | ' + link.quality + ' | ' + link.link + '\n\n';
                        });

                        const downloadSentMessage = await _349a23.sendMessage(from, { text: downloadMessage }, { quoted: message });
                        const downloadSentMessageId = downloadSentMessage.key.id;

                        _349a23.ev.on('messages.upsert', async downloadEvent => {
                            const downloadMessage = downloadEvent.messages[0];

                            if (!downloadMessage.message) return;

                            const downloadMessageContent = downloadMessage.message.conversation || downloadMessage.message.extendedTextMessage?.text;
                            const isReplyToDownloadMessage = downloadMessage.message.extendedTextMessage && downloadMessage.message.extendedTextMessage.contextInfo.stanzaId === downloadSentMessageId;

                            if (isReplyToDownloadMessage) {
                                const downloadSelectedNumber = parseInt(downloadMessageContent.trim());

                                if (!isNaN(downloadSelectedNumber) && downloadSelectedNumber > 0 && downloadSelectedNumber <= downloadLinks.length) {
                                    const selectedLink = downloadLinks[downloadSelectedNumber - 1];
                                    const fileName = response.data.results.title + ' | ' + selectedLink.quality + '.mp4';
                                    const fileUrl = 'https://ssl.sinhalasub01.workers.dev/' + selectedLink.link.split('/').pop();

                                    await _349a23.sendMessage(from, { react: { text: '⬇️', key: _29dbb1.key } });
                                    await _349a23.sendMessage(from, {
                                        document: { url: fileUrl },
                                        mimetype: 'video/mp4',
                                        fileName: fileName,
                                        caption: response.data.results.title + ' | ' + selectedLink.quality + '\n> ᴘᴀᴡᴇʀᴇᴅ ʙʏ ꜱᴜᴘᴜɴ ᴍᴅ',
                                        contextInfo: {
                                            mentionedJid: [],
                                            externalAdReply: {
                                                title: response.data.results.title,
                                                body: '> ᴘᴀᴡᴇʀᴇᴅ ʙʏ ꜱᴜᴘᴜɴ ᴍᴅ',
                                                mediaType: 1,
                                                sourceUrl: selectedMovie.link,
                                                thumbnailUrl: response.data.result.image
                                            }
                                        }
                                    }, { quoted: downloadMessage });

                                    await _349a23.sendMessage(from, { react: { text: '✅', key: _29dbb1.key } });
                                } else {
                                    await reply('Invalid selection. Please reply with a valid number.');
                                }
                            }
                        });
                    } catch (error) {
                        console.log('Error fetching movie details:', error);
                        await reply('An error occurred while fetching movie details. Please try again.');
                    }
                } else {
                    await reply('Invalid selection. Please reply with a valid number.');
                }
            }
        });
    } catch (error) {
        console.log('Error during search:', error);
        await reply('*An error occurred while searching!*');
    }
});

// Additional commands defined similarly
cmd({
    pattern: 'sinhalasub2',
    react: '🎥',
    alias: ['.sinhalasub'],
    desc: 'Download sinhalasub movie.',
    category: 'movies',
    use: '.sinhalasub < Movie name >',
    filename: __filename
}, async (_487430, _3ccc17, _4fd1f8, { from, q, reply }) => {
    try {
        if (!q) return reply('Please provide a movie name.');
        const response = await fetchJson(apiUrl + 'search?text=' + q);
        let message = 'Search Results:\n\n';
        for (let i = 0; i < response.results.data.length; i++) {
            message += (i + 1) + '. ' + response.result.data[i].title + '\n';
            message += response.result.data[i].link + '\n\n';
        }
        await _487430.sendMessage(from, { text: message }, { quoted: _3ccc17 });
    } catch (error) {
        await _487430.sendMessage(from, { react: { text: '❌', key: _3ccc17.key } });
        console.log(error);
        reply('An error occurred!');
    }
});

// Another command for fetching movie details using a different pattern
cmd({
    pattern: 'firemovie',
    react: '🎥',
    alias: ['.firemovie'],
    desc: 'Fetch detailed information about a movie.',
    category: 'movies',
    use: '.firemovie < Movie name >',
    filename: __filename
}, async (_3ee1bf, _5e6846, _94fb9c, { from, q, reply }) => {
    try {
        const response = await fetchJson(apiUrl + 'movie?text=' + q);
        let message = '*Movie Information*\n\n';
        message += '*Title:* ' + response.result.data.title + '\n';
        message += '*Date:* ' + response.result.data.date + '\n';
        message += '*Rating:* ' + response.result.data.rating + '\n';
        message += '*Description:* ' + response.result.data.description + '\n\n';
        message += '======DOWNLOAD URL======\n\n';
        for (let i = 0; i < response.result.data.dl_links.length; i++) {
            message += (i + 1) + '. ' + response.result.data.dl_links[i].quality + ' (' + response.result.data.dl_links[i].size + ')\n';
            message += response.result.data.dl_links[i].link + '\n\n';
        }
        await _3ee1bf.sendMessage(from, {
            image: { url: response.result.data.poster[0] || response.result.data.mainImage },
            caption: message
        }, { quoted: _5e6846 });
    } catch (error) {
        await _3ee1bf.sendMessage(from, { react: { text: '❌', key: _5e6846.key } });
        console.log(error);
        reply('An error occurred!');
    }
});
