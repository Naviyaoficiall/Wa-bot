const fs = require('fs');
if (fs.existsSync('config.env')) require('dotenv').config({ path: './config.env' });

function convertToBool(text, fault = 'true') {
    return text === fault ? true : false;
}
module.exports = {
SESSION_ID: process.env.SESSION_ID || "NAVIYA-MD=aywSVJ4K#9e6XYqthZLFCyjNU4E9A2ssOmmsGAiDHfWRBOEn_YsI",
MONGODB: process.env.MONGODB || "mongodb+srv://athulakumara604:qBwvqo6IM64eT1SL@cluster0.wr7rx.mongodb.net/",
OMDB_API_KEY: process.env.OMDB_API_KEY || "8748dc2e"
};



