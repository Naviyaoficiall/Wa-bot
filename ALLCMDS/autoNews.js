const { fetchJson } = require('../lib/functions');
const domain = `https://manu-ofc-api-site-6bfcbe0e18f6.herokuapp.com/`
const api_key =`Manul-Official-Key-3467`
const groupJid = "120363360393198498@g.us"; // Change this to your group JID

async function fetchAndSendNews(conn) {
    try {
         
        const itnResponse = await fetchJson(`${domain}itn-news?apikey=${api_key}`);
        if (itnResponse.status) {
            const itnTitle = itnResponse.result.title;
            const itnImage = itnResponse.result.image;
            const itnDate = itnResponse.result.date;
            const itnUrl = itnResponse.result.url;
            const itnDesc = itnResponse.result.desc;

            const itnMessage = `            
𝐌𝐚𝐧𝐮-𝐌𝐃 𝐈𝐓𝐍 𝐍𝐄𝐖𝐒 📰
            
*News Title:* ${itnTitle}
*Date:* ${itnDate}
*Description:* ${itnDesc}
*Read More:* ${itnUrl}

> *⚖️𝐏𝐨𝐰𝐞𝐫𝐞𝐝 𝐁𝐲 - : ©𝐌𝐑 𝐌𝐀𝐍𝐔𝐋 𝐎𝐅𝐂 💚*
            `;

            await conn.sendMessage(groupJid, { image: { url: itnImage }, caption: itnMessage });
        } else {
            console.log('ITN news not available at the moment.');
        }

        // Fetching Hiru news
        const hiruResponse = await fetchJson(`${domain}api/hiru-news?apikey=${api_key}`);
        if (hiruResponse.status) {
            const hiruTitle = hiruResponse.data.title;
            const hiruImage = hiruResponse.data.img;
            const hiruDate = hiruResponse.data.date;
            const hiruUrl = hiruResponse.data.link;
            const hiruDesc = hiruResponse.data.desc;

            const hiruMessage = `
𝐌𝐚𝐧𝐮-𝐌𝐃 𝐇𝐈𝐑𝐔 𝐍𝐄𝐖𝐒 ⭐
            
*News Title:* ${hiruTitle}
*Date:* ${hiruDate}
*Description:* ${hiruDesc}
*Read More:* ${hiruUrl}

> *⚖️𝐏𝐨𝐰𝐞𝐫𝐞𝐝 𝐁𝐲 - : ©𝐌𝐑 𝐌𝐀𝐍𝐔𝐋 𝐎𝐅𝐂 💚*
            `;

            await conn.sendMessage(groupJid, { image: { url: hiruImage }, caption: hiruMessage });
        } else {
            console.log('Hiru news not available at the moment.');
        }

        // Fetching Lankadeepa news
        const lankadeepaResponse = await fetchJson(`${domain}lankadeepa-news?apikey=${api_key}`);
        if (lankadeepaResponse.status) {
            const lankadeepaTitle = lankadeepaResponse.data.title;
            const lankadeepaImage = lankadeepaResponse.data.image;
            const lankadeepaDate = lankadeepaResponse.data.date;
            const lankadeepaUrl = lankadeepaResponse.data.url;
            const lankadeepaDesc = lankadeepaResponse.data.desc;

            const lankadeepaMessage = `
𝐌𝐚𝐧𝐮-𝐌𝐃 𝐋𝐀𝐍𝐊𝐀𝐃𝐄𝐄𝐏𝐀 𝐍𝐄𝐖𝐒 😎
            
*News Title:* ${lankadeepaTitle}
*Date:* ${lankadeepaDate}
*Description:* ${lankadeepaDesc}
*Read More:* ${lankadeepaUrl}

> *⚖️𝐏𝐨𝐰𝐞𝐫𝐞𝐝 𝐁𝐲 - : ©𝐌𝐑 𝐌𝐀𝐍𝐔𝐋 𝐎𝐅𝐂 💚*
            `;

            await conn.sendMessage(groupJid, { image: { url: lankadeepaImage }, caption: lankadeepaMessage });
        } else {
            console.log('Lankadeepa news not available at the moment.');
        }

        // Fetching Siyatha news
        const siyathaResponse = await fetchJson(`${domain}siyatha-news?apikey=${api_key}`);
        if (siyathaResponse.status) {
            const siyathaTitle = siyathaResponse.result.title;
            const siyathaImage = siyathaResponse.result.image !== "Image not found" ? siyathaResponse.result.image : null;
            const siyathaDate = siyathaResponse.result.date;
            const siyathaUrl = siyathaResponse.result.url;
            const siyathaDesc = siyathaResponse.result.desc;

            const siyathaMessage = `
𝐌𝐚𝐧𝐮-𝐌𝐃 𝐒𝐈𝐘𝐀𝐓𝐇𝐀 𝐍𝐄𝐖𝐒 📄
            
*News Title:* ${siyathaTitle}
*Date:* ${siyathaDate}
*Description:* ${siyathaDesc}
*Read More:* ${siyathaUrl}

> *⚖️𝐏𝐨𝐰𝐞𝐫𝐞𝐝 𝐁𝐲 - : ©𝐌𝐑 𝐌𝐀𝐍𝐔𝐋 𝐎𝐅𝐂 💚*
            `;

            if (siyathaImage) {
                await conn.sendMessage(groupJid, { image: { url: siyathaImage }, caption: siyathaMessage });
            } else {
                await conn.sendMessage(groupJid, { text: siyathaMessage });
            }
        } else {
            console.log('Siyatha news not available at the moment.');
        }

        // Fetching Sirasa news
        const sirasaResponse = await fetchJson(`${domain}sirasa-news?apikey=${api_key}`);
        if (sirasaResponse.status) {
            const sirasaTitle = sirasaResponse.result.title;
            const sirasaImage = sirasaResponse.result.image !== "Image not found" ? sirasaResponse.result.image : null;
            const sirasaDate = sirasaResponse.result.date;
            const sirasaUrl = sirasaResponse.result.url;
            const sirasaDesc = sirasaResponse.result.desc;

            const sirasaMessage = `
𝐌𝐚𝐧𝐮-𝐌𝐃 𝐒𝐈𝐑𝐀𝐒𝐀 𝐍𝐄𝐖𝐒 ♦
            
*News Title:* ${sirasaTitle}
*Date:* ${sirasaDate}
*Description:* ${sirasaDesc}
*Read More:* ${sirasaUrl}

> *⚖️𝐏𝐨𝐰𝐞𝐫𝐞𝐝 𝐁𝐲 - : ©𝐌𝐑 𝐌𝐀𝐍𝐔𝐋 𝐎𝐅𝐂 💚*
            `;

            if (sirasaImage) {
                await conn.sendMessage(groupJid, { image: { url: sirasaImage }, caption: sirasaMessage });
            } else {
                await conn.sendMessage(groupJid, { text: sirasaMessage });
            }
        } else {
            console.log('Sirasa news not available at the moment.');
        }

        // Fetching Ada news
        const adaResponse = await fetchJson(`${domain}ada-news?apikey=${api_key}`);
        if (adaResponse.status) {
            const adaTitle = adaResponse.data.result.title;
            const adaImage = adaResponse.data.result.image !== "Image not found" ? adaResponse.data.result.image : null;
            const adaDate = adaResponse.data.result.date;
            const adaTime = adaResponse.data.result.time;
            const adaUrl = adaResponse.data.result.url;
            const adaDesc = adaResponse.data.result.desc;

            const adaMessage = `
𝐌𝐚𝐧𝐮-𝐌𝐃 𝐀𝐃𝐀 𝐍𝐄𝐖𝐒 🔊
            
*News Title:* ${adaTitle}
*Date:* ${adaDate}
*Time:* ${adaTime}
*Description:* ${adaDesc}
*Read More:* ${adaUrl}

> *⚖️𝐏𝐨𝐰𝐞𝐫𝐞𝐝 𝐁𝐲 - : ©𝐌𝐑 𝐌𝐀𝐍𝐔𝐋 𝐎𝐅𝐂 💚*
            `;

            if (adaImage) {
                await conn.sendMessage(groupJid, { image: { url: adaImage }, caption: adaMessage });
            } else {
                await conn.sendMessage(groupJid, { text: adaMessage });
            }
        } else {
            console.log('Ada news not available at the moment.');
        }

        // Fetching BBC news
        const bbcResponse = await fetchJson(`${domain}bbc-news?apikey=${api_key}`);
        if (bbcResponse.status) {
            const bbcTitle = bbcResponse.data.result.title;
            const bbcImage = bbcResponse.data.result.image;
            const bbcDate = bbcResponse.data.result.date || "Not provided";
            const bbcUrl = bbcResponse.data.result.url;
            const bbcDesc = bbcResponse.data.result.desc;

            const bbcMessage = `
𝐌𝐚𝐧𝐮-𝐌𝐃 𝐁𝐁𝐂 𝐍𝐄𝐖𝐒 🌌
            
*News Title:* ${bbcTitle}
*Date:* ${bbcDate}
*Description:* ${bbcDesc}
*Read More:* ${bbcUrl}

> *⚖️𝐏𝐨𝐰𝐞𝐫𝐞𝐝 𝐁𝐲 - : ©𝐌𝐑 𝐌𝐀𝐍𝐔𝐋 𝐎𝐅𝐂 💚*
            `;

            await conn.sendMessage(groupJid, { image: { url: bbcImage }, caption: bbcMessage });
        } else {
            console.log('BBC news not available at the moment.');
        }

        // Fetching Gagana news
        const gaganaResponse = await fetchJson(`${domain}gagana-news?apikey=${api_key}`);
        if (gaganaResponse.status) {
            const gaganaTitle = gaganaResponse.data.result.title;
            const gaganaImage = gaganaResponse.data.result.image;
            const gaganaUrl = gaganaResponse.data.result.url;
            const gaganaDesc = gaganaResponse.data.result.desc;

            const gaganaMessage = `
𝐌𝐚𝐧𝐮-𝐌𝐃 𝐆𝐀𝐆𝐀𝐍𝐀 𝐍𝐄𝐖𝐒 ✈️
            
*News Title:* ${gaganaTitle}
*Description:* ${gaganaDesc}
*Read More:* ${gaganaUrl}

> *⚖️𝐏𝐨𝐰𝐞𝐫𝐞𝐝 𝐁𝐲 - : ©𝐌𝐑 𝐌𝐀𝐍𝐔𝐋 𝐎𝐅𝐂 💚*
            `;

            await conn.sendMessage(groupJid, { image: { url: gaganaImage }, caption: gaganaMessage });
        } else {
            console.log('Gagana news not available at the moment.');
        }
    } catch (e) {
        console.log(e);
    }
}

// Schedule the fetchAndSendNews function to run every 1 minute (60000 milliseconds)
module.exports = (conn) => {
    setInterval(() => {
        fetchAndSendNews(conn);
    }, 60000); // 1 minute in milliseconds
}
