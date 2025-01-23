const axios = require('axios');
const { cmd } = require('../command');
const cheerio = require('cheerio');
const fs = require('fs');
const path = require('path');

cmd({
    pattern: 'bs6',
    react: '🎬',
    category: 'download',
    desc: 'Search movies on baiscope.lk and get download links',
    filename: __filename,
}, async (bot, message, args, details) => {
    const { from, q, reply } = details;

    try {
        // Check if the query is provided
        if (!q || q.trim() === '') return await reply('Please provide a search query!');

        // Search URL
        const searchUrl = `https://www.baiscope.lk/?s=${encodeURIComponent(q)}`;

        // Fetch the search results
        const response = await axios.get(searchUrl, {
            headers: {
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36',
            },
        });

        // Parse the search results
        const $ = cheerio.load(response.data);
        let searchResults = [];

        $('article.elementor-post').each((index, element) => {
            const title = $(element).find('h5.elementor-post__title > a').text().trim();
            const episodeLink = $(element).find('h5.elementor-post__title > a').attr('href');
            const imgUrl = $(element).find('.elementor-post__thumbnail img').attr('src');
            if (title && episodeLink && imgUrl) {
                searchResults.push({ title, episodeLink, imgUrl });
            }
        });

        // Check if results are found
        if (searchResults.length === 0) return await reply('No results found for: ' + q);

        // Prepare the response message
        let responseText = `🎥 *Baiscope Search Results for:* ${q}\n\n`;
        searchResults.forEach((result, index) => {
            responseText += `*${index + 1}.* ${result.title}\n🔗 Link: ${result.episodeLink}\n\n`;
        });

        const sentMessage = await bot.sendMessage(from, { text: responseText }, { quoted: message });
        const sentMessageId = sentMessage.key.id;

        // Handle user reply
        bot.ev.on('messages.upsert', async (upsert) => {
            const incomingMessage = upsert.messages[0];
            if (!incomingMessage.message) return;

            const text = incomingMessage.message.conversation || incomingMessage.message.extendedTextMessage?.text;
            const isReplyToSentMessage = incomingMessage.message.extendedTextMessage?.contextInfo.stanzaId === sentMessageId;

            if (isReplyToSentMessage && /^[0-9]+$/.test(text)) {
                const selectedIndex = parseInt(text.trim()) - 1;

                if (selectedIndex >= 0 && selectedIndex < searchResults.length) {
                    const selectedResult = searchResults[selectedIndex];
                    
                    // Fetch the episode page
                    const episodeResponse = await axios.get(selectedResult.episodeLink, {
                        headers: {
                            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36',
                        },
                    });

                    const $episode = cheerio.load(episodeResponse.data);
                    const downloadUrl = $episode('div#player-holder iframe').attr('src');

                    if (downloadUrl) {
                        // Notify the user and send the download
                        await bot.sendMessage(from, {
                            image: { url: selectedResult.imgUrl },
                            caption: `🎬 *${selectedResult.title}*\n🔗 Link: ${selectedResult.episodeLink}\n⬇️ Downloading...`,
                            quoted: incomingMessage,
                        });

                        const filePath = path.join(__dirname, `${selectedResult.title}.mp4`);
                        const fileStream = fs.createWriteStream(filePath);

                        const videoResponse = await axios({
                            url: downloadUrl,
                            method: 'GET',
                            responseType: 'stream',
                        });

                        videoResponse.data.pipe(fileStream);

                        fileStream.on('finish', async () => {
                            await bot.sendMessage(from, {
                                document: { url: filePath },
                                mimetype: 'application/zip',
                                fileName: `${selectedResult.title}.mp4`,
                                caption: '🎬 Your download is ready!',
                            }, { quoted: incomingMessage });

                            fs.unlinkSync(filePath); // Delete the file after sending
                        });

                        fileStream.on('error', (error) => {
                            console.error('Error downloading the file:', error);
                            reply('An error occurred while downloading the file.');
                        });
                    } else {
                        await reply('Download link not found for the selected episode.');
                    }
                } else {
                    await reply('Invalid selection. Please choose a valid number.');
                }
            }
        });
    } catch (error) {
        console.error(error);

        if (error.response && error.response.status === 403) {
            await reply('The request was blocked (403). Please try again later.');
        } else {
            await reply('An error occurred while processing your request.');
        }
    }
});
