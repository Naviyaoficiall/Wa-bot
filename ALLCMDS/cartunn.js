const {cmd , commands} = require('../command')
const puppeteer = require('puppeteer');
const axios = require('axios');
const fs = require('fs');
const path = require('path');

cmd({
    pattern: "cartoon",
    desc: "Search and download cartoons",
    category: "scraper",
    filename: __filename,
    use: '.cartoon <cartoon name>'
}, async (conn, mek, m, { reply, q }) => {
    try {
        if (!q) {
            return reply(`
❌ *Please provide a cartoon name!*

📝 *Usage:* .cartoon <cartoon name>
📌 *Example:* .cartoon Doraemon`);
        }

        const cartoonName = q.trim();
        await reply('⏳ Searching for the cartoon, please wait...');

        // Launch Puppeteer
        const browser = await puppeteer.launch({ headless: true });
        const page = await browser.newPage();
        await page.goto('https://ginisisilacartoon.net/');

        // Search for the cartoon
        await page.type('input[type="search"]', cartoonName); // Adjust selector as needed
        await page.keyboard.press('Enter');
        await page.waitForTimeout(3000); // Wait for search results to load

        // Scrape the first result details page
        const cartoonDetails = await page.evaluate(() => {
            const firstResult = document.querySelector('.post-title a'); // Selector for cartoon link
            if (firstResult) {
                return {
                    title: firstResult.innerText.trim(),
                    link: firstResult.href,
                };
            }
            return null;
        });

        if (!cartoonDetails) {
            await browser.close();
            return reply(`❌ *No results found for:* ${cartoonName}`);
        }

        // Navigate to the cartoon details page
        await page.goto(cartoonDetails.link);

        // Scrape details and download link
        const fullDetails = await page.evaluate(() => {
            const title = document.querySelector('.post-title')?.innerText.trim() || 'N/A';
            const thumbnail = document.querySelector('.post-thumbnail img')?.src || null; // Thumbnail URL
            const description = document.querySelector('.post-content')?.innerText.trim() || 'Description not available';
            const downloadLinks = Array.from(document.querySelectorAll('.download-links a')).map(el => ({
                quality: el.innerText.trim(),
                link: el.href,
            })) || [];

            return { title, thumbnail, description, downloadLinks };
        });

        if (!fullDetails.downloadLinks.length) {
            await browser.close();
            return reply(`❌ No download links available for: *${cartoonName}*`);
        }

        // Send details and ask user for confirmation
        let detailsMessage = `🎥 *Cartoon Found!*\n\n` +
            `📌 *Title:* ${fullDetails.title}\n` +
            `📝 *Description:* ${fullDetails.description}\n\n` +
            `🌐 *Available Qualities:*\n` +
            fullDetails.downloadLinks.map((link, index) => `🔹 ${index + 1}. ${link.quality}`).join('\n') +
            `\n\n> Reply *yes* to start downloading in the best available quality.`;

        await reply(detailsMessage);

        // Wait for user confirmation
        conn.onceReply(m.chat, async (userResponse) => {
            const userReply = userResponse.body?.toLowerCase();
            if (userReply === 'yes') {
                await reply('📥 Downloading the cartoon, please wait...');

                // Select the best quality link (e.g., 1080p or 720p)
                const bestLink = fullDetails.downloadLinks.find(link => link.quality.includes('1080p')) || fullDetails.downloadLinks[0];
                const downloadUrl = bestLink.link;

                // Download the cartoon file
                const filePath = path.resolve(__dirname, `${fullDetails.title.replace(/[^a-zA-Z0-9]/g, '_')}.mp4`);
                const writer = fs.createWriteStream(filePath);

                const response = await axios({
                    url: downloadUrl,
                    method: 'GET',
                    responseType: 'stream',
                });

                response.data.pipe(writer);

                await new Promise((resolve, reject) => {
                    writer.on('finish', resolve);
                    writer.on('error', reject);
                });

                // Send the file with thumbnail
                await conn.sendMessage(m.chat, {
                    video: { url: filePath },
                    caption: `🎥 *Title:* ${fullDetails.title}\n📌 *Quality:* ${bestLink.quality}\n\n> Powered by Ginisisila Cartoon`,
                    thumbnail: { url: fullDetails.thumbnail },
                }, { quoted: m });

                // Delete the file after sending
                fs.unlinkSync(filePath);
                await reply('✅ Cartoon downloaded and sent successfully!');
            } else {
                await reply('❌ Download cancelled.');
            }
        });

        await browser.close();
    } catch (error) {
        console.error('Error processing cartoon command:', error);
        reply('❌ An error occurred while processing your request. Please try again later.');
    }
});
