const { cmd, commands } = require('../command');

const forwardCommand = {
    pattern: "fo",
    desc: "Forward messages",
    alias: ['fo'],
    category: "owner",
    use: ".forward <Jid address>",
    filename: __filename
};

cmd(forwardCommand, async (
    conn, // Represents the connection
    mek, // Message object
    store, // Store for additional information
    {
        from, // Origin of the message
        quoted, // Quoted message object
        q, // Query parameter (target JID)
        isOwner, // If the sender is the bot owner
        reply // Function to reply to the sender
    }
) => {
    // Ensure the command is executed by the owner
    if (!isOwner) {
        return reply("Owner Only ❌");
    }

    // Validate the input
    if (!q) {
        return reply("Please provide a target JID address ❌");
    }

    if (!quoted) {
        return reply("Please reply to a message you want to forward ❌");
    }

    // Extract the quoted message object correctly, handling possible variations
    const forwardMessage = quoted.fakeObj || quoted; // Use quoted.fakeObj if it exists, else fallback to quoted

    try {
        // Forward the message to the target JID
        await conn.sendMessage(q, { forward: forwardMessage });

        // Send a confirmation to the owner
        return reply(`Message forwarded successfully to:\n\n${q}`);
    } catch (error) {
        // Handle errors and provide more details about what went wrong
        console.error(error); // Log the error for debugging
        return reply(`Failed to forward the message ❌\nError: ${error.message || error}`);
    }
});
