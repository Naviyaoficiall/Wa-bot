const fg = require('api-dylux');
const axios = require('axios');
const mime = require('mime-types');  
const cheerio = require('cheerio');
const fetch = (...args) => import("node-fetch").then(({ default: fetch }) => fetch(...args));
const fs = require('fs-extra');
const config = require('../config');
const {
  cmd,
  commands
} = require('../command');
const { getBuffer, getGroupAdmins, getRandom, h2k, isUrl, Json, runtime, sleep, fetchJson, fetchApi} = require('../lib/functions');

//================================= BAISCOPE CMD ================================
cmd({
    pattern: "b2",
    react: '📑',
    category: "search",
    desc: "pirate movie downloader",
    filename: __filename
},
async (conn, m, mek, { from, q, reply }) => { // !isDev ඉවත් කලා
try {
        if (!q) return await reply('*please give me text !..*');
        const url = `${q}`;
        const response = await axios.get(url);
        const $ = cheerio.load(response.data);
        let results = [];
        $('article.elementor-post').each((index, element) => {
            const titleElement = $(element).find('h5 > a');
            const title = titleElement.text().trim();
            const link = titleElement.attr('href');
            const img = $(element).find('img').attr('src');
            results.push({ title, link, img });
        });

        if (results.length < 1) return await conn.sendMessage(from, { text: 'error!' }, { quoted: mek });
        let rows = results.map(result => ({
            header: '',
            title: result.title,
            description: result.title,
            id: `.bidl ${result.link}`
        }));

        let buttons = [{
            name: "single_select",
            buttonParamsJson: JSON.stringify({
                title: 'Download Movie 📥',
                sections: [{
                    title: 'Search By Baiscope',
                    highlight_label: 'T.C MOVIE-DL',
                    rows: rows
                }]
            }),
        }];
        const info = `⏳ Search A Movie Name: ${q}
📲 Search top 10 Movies\nbaiscope`;
        let opts = {
            image: results[0].img,
            header: '_*T.C BAISCOPE DL*_',
            footer: 'MOVIE DOWNLOADER BY TC',
            body: info,
        };
        return await conn.sendButtonMessage(from, buttons, m, opts);
    } catch (e) {
        reply('*Error!*');
        console.error(e);
    }
});
