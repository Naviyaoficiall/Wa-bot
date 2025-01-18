const { fetchJson } = require('../lib/functions');
const domain = `https://manu-ofc-api-site-6bfcbe0e18f6.herokuapp.com/`
const api_key =`Manul-Official-Key-3467`
const groupJid = "120363360393198498@g.us"; // Change this to your group JID

async function fetchAndSendNews(conn) {
    try {
        const response = await fetchJson(`${domain}itn-news?apikey=${api_key}`);
        if (response.status) {
            const title = response.result.title;
            const image = response.result.image;
            const date = response.result.date;
            const url = response.result.url;
            const desc = response.result.desc;
            
            const message = `            
𝐌𝐚𝐧𝐮-𝐌𝐃 𝐈𝐓𝐍 𝐍𝐄𝐖𝐒 📰
            
*News Title:* ${title}
*Date:* ${date}
*Description:* ${desc}
*Read More:* ${url}

> *⚖️𝐏𝐨𝐰𝐞𝐫𝐞𝐝 𝐁𝐲 - : ©𝐌𝐑 𝐌𝐀𝐍𝐔𝐋 𝐎𝐅𝐂 💚*
            `;

            await conn.sendMessage(groupJid, { image: { url: image }, caption: message });
        } else {
            console.log('Sorry, no news available at the moment.');
        }
    } catch (e) {
        console.log(e);
    }
}

// Schedule the fetchAndSendNews function to run every 2 minutes (120000 milliseconds)
module.exports = (conn) => {
    setInterval(() => {
        fetchAndSendNews(conn);
    }, 120000); // 2 minutes in milliseconds
          }





async function fetchAndSendNews(conn) {
    try {
        const response = await fetchJson(`${domain}hiru-news?apikey=${api_key}`);
        if (response.status) {
            const title = response.result.title;
            const image = response.result.image;
            const date = response.result.date;
            const url = response.result.url;
            const desc = response.result.desc;
            
            const message = `            
𝐌𝐚𝐧𝐮-𝐌𝐃 𝐈𝐓𝐍 𝐍𝐄𝐖𝐒 📰
            
*News Title:* ${title}
*Date:* ${date}
*Description:* ${desc}
*Read More:* ${url}

> *⚖️𝐏𝐨𝐰𝐞𝐫𝐞𝐝 𝐁𝐲 - : ©𝐌𝐑 𝐌𝐀𝐍𝐔𝐋 𝐎𝐅𝐂 💚*
            `;

            await conn.sendMessage(groupJid, { image: { url: image }, caption: message });
        } else {
            console.log('Sorry, no news available at the moment.');
        }
    } catch (e) {
        console.log(e);
    }
}

// Schedule the fetchAndSendNews function to run every 2 minutes (120000 milliseconds)
module.exports = (conn) => {
    setInterval(() => {
        fetchAndSendNews(conn);
    }, 120000); // 2 minutes in milliseconds
        }
