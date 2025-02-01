/* Remove Credits....😒💐

 Ubale Siya.....*/




const { 
    BufferJSON, 
    WA_DEFAULT_EPHEMERAL, 
    generateWAMessageFromContent, 
    proto, 
    generateWAMessageContent, 
    generateWAMessage, 
    prepareWAMessageMedia, 
    downloadContentFromMessage, 
    areJidsSameUser, 
    getContentType 
} = require('@whiskeysockets/baileys')
const { cmd } = require('../command')
const { updateEnv, readEnv } = require('../lib/database');
const config = require("../config")

cmd({
    pattern: "settings2",
    alias: ["setting","s2"],
    desc: "Bot Settings Configuration",
    react: "⚙️",
    category: "owner",
    filename: __filename
},
async(conn, mek, m, {from, quoted, body, isCmd, command, args, q, isGroup, sender, senderNumber, botNumber2, botNumber, pushname, isMe, isOwner, groupMetadata, groupName, participants, groupAdmins, isBotAdmins, isAdmins, reply}) => {
try {
    if (!isOwner) return reply("*This command is only for bot owner!*");

    const currentConfig = await readEnv();

    async function createImage(url) {
        const { imageMessage } = await generateWAMessageContent({
            image: { url }
        }, {
            upload: conn.waUploadToServer
        });
        return imageMessage;
    }

    let settingsDetails = [];
    
    settingsDetails.push({
        body: proto.Message.InteractiveMessage.Body.fromObject({
            text: `⚙️ Bot Settings Configuration`
        }),
        footer: proto.Message.InteractiveMessage.Footer.fromObject({
            text: config.FOOTER
        }),
        header: proto.Message.InteractiveMessage.Header.fromObject({
            title: `Hello ${pushname}!`,
            hasMediaAttachment: true,
            imageMessage: await createImage('https://i.imgur.com/j5Iv2GE.png') // Replace with your image
        }),
        nativeFlowMessage: proto.Message.InteractiveMessage.NativeFlowMessage.fromObject({
            buttons: [
                {
                    "name": "single_select",
                    "buttonParamsJson": JSON.stringify({
                        "title": "Bot Configuration",
                        "sections": [
                            {
                                "title": "Bot Mode Settings",
                                "rows": [
                                    {
                                        "header": "🌐 Work Mode",
                                        "title": `Current: ${currentConfig.MODE}`,
                                        "description": "Change bot's operational mode",
                                        "id": "mode_settings"
                                    }
                                ]
                            },
                            {
                                "title": "Auto Features",
                                "rows": [
                                    {
                                        "header": "🎙️ Auto Voice",
                                        "title": `Status: ${currentConfig.AUTO_VOICE === 'true' ? 'ON' : 'OFF'}`,
                                        "description": "Toggle automatic voice messages",
                                        "id": "auto_voice"
                                    },
                                    {
                                        "header": "🖼️ Auto Sticker",
                                        "title": `Status: ${currentConfig.AUTO_STICKER === 'true' ? 'ON' : 'OFF'}`,
                                        "description": "Toggle automatic sticker creation",
                                        "id": "auto_sticker"
                                    },
                                    {
                                        "header": "💬 Auto Reply",
                                        "title": `Status: ${currentConfig.AUTO_REPLY === 'true' ? 'ON' : 'OFF'}`,
                                        "description": "Toggle automatic responses",
                                        "id": "auto_reply"
                                    }
                                ]
                            },
                            {
                                "title": "Notification Settings",
                                "rows": [
                                    {
                                        "header": "👀 Auto Read Status",
                                        "title": `Status: ${currentConfig.AUTO_READ_STATUS === 'true' ? 'ON' : 'OFF'}`,
                                        "description": "Toggle automatic status reading",
                                        "id": "auto_read"
                                    },
                                    {
                                        "header": "😊 Auto React",
                                        "title": `Status: ${currentConfig.AUTO_REACT === 'true' ? 'ON' : 'OFF'}`,
                                        "description": "Toggle automatic reactions",
                                        "id": "auto_react"
                                    }
                                ]
                            }
                        ]
                    })
                },
                {
                    "name": "quick_reply",
                    "buttonParamsJson": JSON.stringify({
                        "display_text": "Reset All",
                        "id": "reset_all"
                    })
                },
                {
                    "name": "cta_url",
                    "buttonParamsJson": JSON.stringify({
                        "display_text": "Bot Support",
                        "url": "https://wa.me/94767096711",
                        "merchant_url": "https://wa.me/94767096711"
                    })
                },
                {
                    "name": "quick_reply",
                    "buttonParamsJson": JSON.stringify({
                        "display_text": "MENU",
                        "id": ".menu"
                    })
                },
                {
                    "name": "quick_reply",
                    "buttonParamsJson": JSON.stringify({
                        "display_text": "ALIVE",
                        "id": ".alive"
                    })
                },
                {
                    "name": "quick_reply",
                    "buttonParamsJson": JSON.stringify({
                        "display_text": "PUBLIC",
                        "id": ".update MODE:public"
                    })
                }
            ]
        })
    });

    const msg = generateWAMessageFromContent(m.chat, {
        viewOnceMessage: {
            message: {
                interactiveMessage: proto.Message.InteractiveMessage.fromObject({
                    body: proto.Message.InteractiveMessage.Body.create({
                        text: 'Bot Settings Configuration\n\nSelect an option to modify'
                    }),
                    footer: proto.Message.InteractiveMessage.Footer.create({
                        text: config.FOOTER
                    }),
                    header: proto.Message.InteractiveMessage.Header.create({
                        hasMediaAttachment: false
                    }),
                    carouselMessage: proto.Message.InteractiveMessage.CarouselMessage.fromObject({
                        cards: settingsDetails
                    })
                })
            }
        }
    }, {});

    await conn.relayMessage(m.chat, msg.message, {
        messageId: msg.key.id
    });

    // Settings handler
    const settingsHandler = async (msgUpdate) => {
        try {
            const message = msgUpdate.messages[0];
            
            if (message.message?.interactiveResponseMessage?.selectedId) {
                const selectedOption = message.message.interactiveResponseMessage.selectedId;

                const toggleSetting = async (setting) => {
                    const newValue = currentConfig[setting] === 'true' ? 'false' : 'true';
                    await updateEnv(setting, newValue);
                    reply(`✅ ${setting} updated to ${newValue}`);
                };

                switch(selectedOption) {
                    case 'mode_settings':
                        reply(`Current Mode: ${currentConfig.MODE}
Available Modes:
1. public
2. private
3. groups
4. inbox

Reply with desired mode.`);
                        break;
                    case 'auto_voice':
                        await toggleSetting('AUTO_VOICE');
                        break;
                    case 'auto_sticker':
                        await toggleSetting('AUTO_STICKER');
                        break;
                    case 'auto_reply':
                        await toggleSetting('AUTO_REPLY');
                        break;
                    case 'auto_read':
                        await toggleSetting('AUTO_READ_STATUS');
                        break;
                    case 'auto_react':
                        await toggleSetting('AUTO_REACT');
                        break;
                    case 'reset_all':
                        reply('Resetting all settings to default...');
                        // Add your reset logic here
                        break;
                }

                              // Remove listener after processing
                              conn.ev.off('messages.upsert', settingsHandler);
                            }
                        } catch (error) {
                            console.error("Settings Handler Error:", error);
                            reply(`❌ An error occurred: ${error.message}`);
                        }
                    };
                
                    // Register the settings handler
                    conn.ev.on('messages.upsert', settingsHandler);
                
                } catch(e) {
                    console.log(e)
                    reply(`An error occurred: ${e}`)
                }
                })
