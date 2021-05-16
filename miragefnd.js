const {Client} = require('discord.js');
const client = new Client();
require('dotenv').config()

client.on('ready', async () =>{
    console.log("BOT: Ready");
})

client.on('message', async (message) => {
    //Flash-n-dash
if (message.channel.id === "756354194818203688") {
    await message.delete({
        timeout: 60000
    })
    .catch(async error => {
        await console.log("Error: Message Not available to delete!")
    });
}
})

client.login(process.env.TOKEN);