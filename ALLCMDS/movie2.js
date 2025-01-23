const axios = require('axios');
const { cmd, commands } = require('../command');
const fs = require('fs');
const path = require('path');
const cheerio = require('cheerio');

cmd({
    'pattern': 'bs6',
    'react': '☠️',
    'category': 'download',
    'desc': 'Search movies on baiscope.lk and get download links',
    'filename': __filename
}, async (bot, message, args, details) => {
    const { from, q, reply } = details;
    try {
        // Check if search query is provided
        if (!q) return await reply('Please provide a search query!');

        // Construct the search URL
        const searchUrl = 'https://www.baiscope.lk/?s=' + encodeURIComponent(q);
        
        // Fetch the search results page
        const response = await axios.get(searchUrl);
        
        // Load the HTML response into cheerio for parsing
        const $ = cheerio.load(response.data);
        
        // Array to store search results
        let searchResults = [];
        
        // Parse the search results
        $('article.elementor-post').each((index, element) => {
            const title = $(element).find('h5.elementor-post__title > a').text().trim();
            const episodeLink = $(element).find('h5.elementor-post__title > a').attr('href');
            const imgUrl = $(element).find('.elementor-post__thumbnail img').attr('src');
            if (title && episodeLink && imgUrl) {
                searchResults.push({ title, episodeLink, imgUrl });
            }
        });
        
        // Check if there are any results
        if (searchResults.length === 0) return await reply('No results found for: ' + q);

        // Construct the response text
        let responseText = '📺 Search Results for *' + q + '*:\n\n';
        searchResults.forEach((result, index) => {
            responseText += '*' + (index + 1) + '.* ' + result.title + '\n🔗 Link: ' + result.episodeLink + '\n\n';
        });

        // Send the search results to the user
        const sentMessage = await bot.sendMessage(from, { 'text': responseText }, { 'quoted': message });
        const sentMessageId = sentMessage.key.id;

        // Listen for user replies to the search results
        bot.ev.on('messages.upsert', async upsert => {
            const incomingMessage = upsert.messages[0];
            if (!incomingMessage.message) return;

            const text = incomingMessage.message.conversation || incomingMessage.message.extendedTextMessage?.text;
            const isReplyToSentMessage = incomingMessage.key.id === sentMessageId;

            if (isReplyToSentMessage) {
                const selectedNumber = parseInt(text.trim());
                if (!isNaN(selectedNumber) && selectedNumber > 0 && selectedNumber <= searchResults.length) {
                    const selectedResult = searchResults[selectedNumber - 1];
                    
                    // Fetch the selected episode page
                    const episodeResponse = await axios.get(selectedResult.episodeLink);
                    const $episode = cheerio.load(episodeResponse.data);
                    
                    // Find the download URL
                    const downloadUrl = $episode('div#player-holder iframe').attr('src');
                    
                    if (downloadUrl) {
                        // Send the image and details about the selected episode
                        await bot.sendMessage(from, {
                            'image': { 'url': selectedResult.imgUrl },
                            'caption': '🎬 *' + selectedResult.title + '*\n🔗 Link: ' + selectedResult.episodeLink + '\n⬇️ Download will follow.',
                            'quoted': incomingMessage
                        });

                        // Define the path to save the downloaded file
                        const filePath = path.join(__dirname, 'downloaded_episode.zip');
                        const fileStream = fs.createWriteStream(filePath);

                        // Fetch the video file
                        const videoResponse = await axios({
                            url: downloadUrl,
                            method: 'GET',
                            responseType: 'stream'
                        });

                        // Pipe the data to the file
                        videoResponse.data.pipe(fileStream);

                        // Once the file is downloaded, send it to the user
                        fileStream.on('finish', async () => {
                            await bot.sendMessage(from, {
                                'document': { 'url': filePath },
                                'mimetype': 'application/zip',
                                'fileName': selectedResult.title + '.mp4',
                                'caption': '*' + selectedResult.title + '*\n\n© CREATED BY SADEESHA CODER',
                                'contextInfo': {
                                    'mentionedJid': ['94779062397@s.whatsapp.net'],
                                    'groupMentions': [],
                                    'forwardingScore': 1,
                                    'isForwarded': true,
                                    'forwardedNewsletterMessageInfo': {
                                        'newsletterJid': '120363192254044294@newsletter',
                                        'newsletterName': 'LARA MD ✻',
                                        'serverMessageId': 999
                                    },
                                    'externalAdReply': {
                                        'title': 'LARA MD',
                                        'body': 'SADEESHA THARUMIN',
                                        'mediaType': 1,
                                        'sourceUrl': 'https://github.com/sadiyamin',
                                        'thumbnailUrl': 'https://raw.githubusercontent.com/tharumin/Alexa_Voice/refs/heads/main/20241214_204755.jpg',
                                        'renderLargerThumbnail': false,
                                        'showAdAttribution': true
                                    }
                                }
                            }, { 'quoted': incomingMessage });

                            // Remove the downloaded file from the server
                            fs.unlinkSync(filePath);
                        });

                        fileStream.on('error', error => {
                            console.error('Error downloading the episode ZIP file:', error);
                            reply('*Error downloading the episode ZIP file.*');
                        });
                    } else {
                        await reply('*Download link not found for the selected episode.*');
                    }
                } else {
                    await reply('*Invalid selection. Please choose a valid number.*');
                }
            }
        });
    } catch (error) {
        console.error(error);
        await reply('*An error occurred while scraping the data.*');
    }
});
