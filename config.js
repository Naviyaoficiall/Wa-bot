const fs = require('fs');
if (fs.existsSync('config.env')) require('dotenv').config({ path: './config.env' });

function convertToBool(text, fault = 'true') {
    return text === fault ? true : false;
}
module.exports = {
SESSION_ID: process.env.SESSION_ID || "NAVIYA-MD=mFkhRKja#1DuX8ghkuX4SQFswO44b8b_GdR5Ls1LcxtE18dsoxF4",
MONGODB: process.env.MONGODB || "mongodb+srv://cisoler713:lTVe7bnXQ8ahr5Ks@cluster0.gomfl.mongodb.net",
OMDB_API_KEY: process.env.OMDB_API_KEY || "8748dc2e",
AUTO_RECORDING:process.env.AUTO_RECORDING || "true",
AUTO_NEWS:process.env.AUTO_NEWS || "false"
};





