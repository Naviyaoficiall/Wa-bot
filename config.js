const fs = require('fs');
if (fs.existsSync('config.env')) require('dotenv').config({ path: './config.env' });

function convertToBool(text, fault = 'true') {
    return text === fault ? true : false;
}
module.exports = {
SESSION_ID: process.env.SESSION_ID || "NAVIYA-MD=uIFTnbCR#4uw7xLtSewj2xtiGBlvEz6FwwT8-78Pp6Xum_StBJ8M",
MONGODB: process.env.MONGODB || "mongodb://mongo:RPmQBwWeNBIgZqSWdyimGchxmrZsySkd@autorack.proxy.rlwy.net:49458",
OMDB_API_KEY: process.env.OMDB_API_KEY || "8748dc2e"
};



