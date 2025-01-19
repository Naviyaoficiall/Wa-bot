const { cmd, commands } = require('../command');
const { fetchJson } = require('../lib/functions');

// Define the AI command
cmd({
    'pattern': 'ai',
    'alias': ['bot', 'dj'],
    'react': '🤖',
    'desc': 'Please ask Rhodvick a question or provide input for the AI.',
    'category': 'main',
    'filename': __filename
}, async (_0x5deaf5, _0x13d15e, _0x2e4560, { from, quoted, body, isCmd, command, args, q, isGroup, sender, senderNumber, botNumber2, botNumber, pushname, isMe, isOwner, groupMetadata, groupName, participants, groupAdmins, isBotAdmins, isAdmins, reply }) => {
    try {
        if (!q) return reply('Please ask Rhodvick a question or provide input for the AI.');
        const response = await fetchJson('https://api.davidcyriltech.my.id/ai/gpt3?text=' + q);
        console.log(response);
        if (!response.message) return reply('No response from the AI.');
        return reply('' + response.message);
    } catch (error) {
        console.error(error);
        reply('An error occurred: ' + error.message);
    }
});

// Define the Mistra AI command
cmd({
    'pattern': 'mistra',
    'alias': ['mistraai', 'zimai'],
    'react': '🪄',
    'desc': 'Please ask Rhodvick a question or provide input for the AI.',
    'category': 'main',
    'filename': __filename
}, async (_0x432d02, _0x52f391, _0x21f332, { from, quoted, body, isCmd, command, args, q, isGroup, sender, senderNumber, botNumber2, botNumber, pushname, isMe, isOwner, groupMetadata, groupName, participants, groupAdmins, isBotAdmins, isAdmins, reply }) => {
    try {
        if (!q) return reply('Please ask a question or provide input for the AI.');
        const response = await fetchJson('https://pikabotzapi.vercel.app/ai/mistral/?apikey=anya-md&message=' + q);
        console.log(response);
        if (!response.message) return reply('No response from the AI.');
        return reply('🧚 *✦QUENN SENAYA MD✦ MISTRA AI:*\n\n' + response.message);
    } catch (error) {
        console.error(error);
        reply('An error occurred: ' + error.message);
    }
});

// Define the GPT-3 command
cmd({
    'pattern': 'gpt3',
    'alias': ['gptturbo', 'chatgpt3'],
    'react': '😇',
    'desc': 'AI chat.',
    'category': 'main',
    'filename': __filename
}, async (_0x2248c5, _0x2b3fc9, _0x193d18, { from, quoted, body, isCmd, command, args, q, isGroup, sender, senderNumber, botNumber2, botNumber, pushname, isMe, isOwner, groupMetadata, groupName, participants, groupAdmins, isBotAdmins, isAdmins, reply }) => {
    try {
        if (!q) return reply('Please ask Rhodvick a question or provide input for the AI.');
        const response = await fetchJson('https://api.davidcyriltech.my.id/ai/gpt3?text=' + q);
        console.log(response);
        if (!response.message) return reply('No response from the AI.');
        return reply('🧚 *✦QUENN SENAYA MD ✦ CHATGPT 3:*\n\n' + response.message);
    } catch (error) {
        console.error(error);
        reply('An error occurred: ' + error.message);
    }
});

// Define the GPT-4 command
cmd({
    'pattern': 'gpt4',
    'alias': ['gpt4o', 'gpt4omini'],
    'react': '🪄',
    'desc': 'Please ask Rhodvick a question or provide input for the AI.',
    'category': 'main',
    'filename': __filename
}, async (_0x35d6c6, _0x2ffb05, _0x1ccc4f, { from, quoted, body, isCmd, command, args, q, isGroup, sender, senderNumber, botNumber2, botNumber, pushname, isMe, isOwner, groupMetadata, groupName, participants, groupAdmins, isBotAdmins, isAdmins, reply }) => {
    try {
        if (!q) return reply('Please ask Rhodvick a question or provide input for the AI.');
        const response = await fetchJson('https://api.davidcyriltech.my.id/ai/gpt4omini?text=' + q);
        console.log(response);
        if (!response.message) return reply('No response from the AI.');
        return reply('🧚 *✦QUENN SENAYA MD✦ CHATGPT 4:*\n\n' + response.message);
    } catch (error) {
        console.error(error);
        reply('An error occurred: ' + error.message);
    }
});

// Define the Llama-3 command
cmd({
    'pattern': 'llama3',
    'alias': ['llama', 'model3'],
    'react': '✅',
    'desc': 'Please ask Rhodvick a question or provide input for the AI.',
    'category': 'main',
    'filename': __filename
}, async (_0x5ce263, _0x25751d, _0x3bf73a, { from, quoted, body, isCmd, command, args, q, isGroup, sender, senderNumber, botNumber2, botNumber, pushname, isMe, isOwner, groupMetadata, groupName, participants, groupAdmins, isBotAdmins, isAdmins, reply }) => {
    try {
        if (!q) return reply('Please ask Rhodvick a question or provide input for the AI.');
        const response = await fetchJson('https://api.davidcyriltech.my.id/ai/llama3?text=' + q);
        console.log(response);
        if (!response.message) return reply('No response from the AI.');
        return reply('🧚 *✦QUENN SENAYA MD✦ LLAMA AI:*\n\n' + response.message);
    } catch (error) {
        console.error(error);
        reply('An error occurred: ' + error.message);
    }
});

// Define the Meta AI command
cmd({
    'pattern': 'metaai',
    'alias': ['meta', 'metai', 'gemini'],
    'react': '🔄',
    'desc': 'Please ask Rhodvick a question or provide input for the AI.',
    'category': 'main',
    'filename': __filename
}, async (_0x40025f, _0x2aeab5, _0x2ebb58, { from, quoted, body, isCmd, command, args, q, isGroup, sender, senderNumber, botNumber2, botNumber, pushname, isMe, isOwner, groupMetadata, groupName, participants, groupAdmins, isBotAdmins, isAdmins, reply }) => {
    try {
        if (!q) return reply('Please ask Rhodvick a question or provide input for the AI.');
        const response = await fetchJson('https://api.davidcyriltech.my.id/ai/metaai?text=' + q);
        console.log(response);
        if (!response.message) return reply('No response from the AI.');
        return reply('🧚 *✦QUENN SENAYA MD✦ META AI:*\n\n' + response.message);
    } catch (error) {
        console.error(error);
        reply('An error occurred: ' + error.message);
    }
});

// Define the Bing AI command
cmd({
    'pattern': 'bingai',
    'alias': ['bing', 'ai4'],
    'react': '🟢',
    'desc': 'Please ask Rhodvick a question or provide input for the AI.',
    'category': 'main',
    'filename': __filename
}, async (_0x47a99d, _0x5eb7a5, _0x2fd141, { from, quoted, body, isCmd, command, args, q, isGroup, sender, senderNumber, botNumber2, botNumber, pushname, isMe, isOwner, groupMetadata, groupName, participants, groupAdmins, isBotAdmins, isAdmins, reply }) => {
    try {
        if (!q) return reply('Please ask Rhodvick a question or provide input for the AI.');
        const response = await fetchJson('https://api.davidcyriltech.my.id/ai/gpt3?text=' + q);
        console.log(response);
        if (!response.message) return reply('No response from the AI.');
        return reply('🧚 *✦QUENN SENAYA MD✦ GOOGLE AI:*\n\n' + response.message);
    } catch (error) {
        console.error(error);
        reply('An error occurred: ' + error.message);
    }
});

// Define the Bard AI command
cmd({
    'pattern': 'bardai',
    'alias': ['bard', 'mistraai'],
    'react': '⏳',
    'desc': 'AI chat.',
    'category': 'main',
    'filename': __filename
}, async (_0x26acef, _0x52a488, _0x4e4144, { from, quoted, body, isCmd, command, args, q, isGroup, sender, senderNumber, botNumber2, botNumber, pushname, isMe, isOwner, groupMetadata, groupName, participants, groupAdmins, isBotAdmins, isAdmins, reply }) => {
    try {
        if (!q) return reply('Please ask Rhodvick a question or provide input for the AI.');
        const response = await fetchJson('https://api.davidcyriltech.my.id/ai/gpt3?text=' + q);
        console.log(response);
        if (!response.message) return reply('No response from the AI.');
        return reply(' 🧚 *✦QUENN SENAYA MD✦ MISTRA AI:*\n\n' + response.message);
    } catch (error) {
        console.error(error);
        reply('An error occurred: ' + error.message);
    }
});
