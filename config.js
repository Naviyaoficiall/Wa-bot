const fs = require('fs');
if (fs.existsSync('config.env')) require('dotenv').config({ path: './config.env' });

function convertToBool(text, fault = 'true') {
    return text === fault ? true : false;
}
module.exports = {
SESSION_ID: process.env.SESSION_ID || "NAVIYA-MD=OigBzAqS#G9UlFi9qJdhFF6-U8_vhcGcbviZmmsbbeR6duU8uYLA",
MONGODB: process.env.MONGODB || "mongodb://mongo:gUFbTNjMqxNDZukhBHUFxpIhfNlWgcAm@roundhouse.proxy.rlwy.net:20675",
OMDB_API_KEY: process.env.OMDB_API_KEY || "8748dc2e"
};



