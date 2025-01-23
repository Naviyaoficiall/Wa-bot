const axios = require('axios');
const { wrapper } = require('axios-cookiejar-support');
const { CookieJar } = require('tough-cookie');
const cheerio = require('cheerio');
const puppeteer = require('puppeteer');
const { cmd } = require('../command');

// Wrap axios to support cookies
const jar = new CookieJar();
const axiosInstance = wrapper(axios.create({ jar }));

cmd({
    pattern: 'bs6',
    react: '📑',
    category: 'download',
    desc: 'Search movies on baiscope.lk and get download links',
    filename: __filename,
}, async (bot, message, args, details) => {
    const { from, q, reply } = details;

    if (!q) return await reply('Please provide a search query!');

    const searchUrl = `https://www.baiscope.lk/?s=${encodeURIComponent(q)}`;

    try {
        // Step 1: Try using Axios with headers
        const response = await axiosInstance.get(searchUrl, {
            headers: {
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36',
                'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,*/*;q=0.8',
                'Accept-Language': 'en-US,en;q=0.5',
                'Connection': 'keep-alive',
            },
            withCredentials: true,
        });

        // Step 2: Parse the response with Cheerio
        const $ = cheerio.load(response.data);
        const searchResults = [];

        $('article.elementor-post').each((index, element) => {
            const title = $(element).find('h5.elementor-post__title > a').text().trim();
            const episodeLink = $(element).find('h5.elementor-post__title > a').attr('href');
            const imgUrl = $(element).find('.elementor-post__thumbnail img').attr('src');

            if (title && episodeLink && imgUrl) {
                searchResults.push({ title, episodeLink, imgUrl });
            }
        });

        if (searchResults.length === 0) {
            return await reply(`No results found for: *${q}*`);
        }

        // Step 3: Display the search results
        let responseText = `📺 *Search Results for:* ${q}\n\n`;
        searchResults.forEach((result, index) => {
            responseText += `*${index + 1}.* ${result.title}\n🔗 Link: ${result.episodeLink}\n\n`;
        });

        await bot.sendMessage(from, { text: responseText }, { quoted: message });

    } catch (axiosError) {
        // If Axios fails, fallback to Puppeteer
        console.error('Axios request failed:', axiosError.message);

        try {
            await reply('Axios request failed. Switching to Puppeteer...');
            const browser = await puppeteer.launch();
            const page = await browser.newPage();

            await page.goto(searchUrl, { waitUntil: 'domcontentloaded' });
            const content = await page.content();

            const $ = cheerio.load(content);
            const searchResults = [];

            $('article.elementor-post').each((index, element) => {
                const title = $(element).find('h5.elementor-post__title > a').text().trim();
                const episodeLink = $(element).find('h5.elementor-post__title > a').attr('href');
                const imgUrl = $(element).find('.elementor-post__thumbnail img').attr('src');

                if (title && episodeLink && imgUrl) {
                    searchResults.push({ title, episodeLink, imgUrl });
                }
            });

            if (searchResults.length === 0) {
                await browser.close();
                return await reply(`No results found for: *${q}*`);
            }

            let responseText = `📺 *Search Results (Fallback Mode) for:* ${q}\n\n`;
            searchResults.forEach((result, index) => {
                responseText += `*${index + 1}.* ${result.title}\n🔗 Link: ${result.episodeLink}\n\n`;
            });

            await browser.close();
            await bot.sendMessage(from, { text: responseText }, { quoted: message });

        } catch (puppeteerError) {
            console.error('Puppeteer fallback failed:', puppeteerError.message);
            await reply('*Error:* Unable to fetch results. Please try again later.');
        }
    }
});
