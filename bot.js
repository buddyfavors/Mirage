//Requirements and libs imports
require("dotenv").config();
const {
    Client,
    MessageEmbed,
    Util
} = require('discord.js');
const client = new Client();
const wait = require('util').promisify(setTimeout);
const fs = require('fs');
const schedule = require('node-schedule');
const ytdl = require('ytdl-core');
const queue = new Map();
const fetch = require('node-fetch');
const yts = require("yt-search");


//Database Import
const db = require('./database/database');
const verification = require('./models/VerificationModel');
const infracs = require('./models/InfracModel');    

//Global Variables
const prefix = "+"; //defines prefix for the bot
var MessageCount = 0;
var FreeMoney = 0;
var randomBonus = Math.floor(Math.random() * 75) + 75;

//File storage
var UserData = JSON.parse(fs.readFileSync('storage/userData.json', 'utf8'));
var InfracData = JSON.parse(fs.readFileSync('storage/MemberInfracs.json', 'utf-8'));
var tickets = JSON.parse(fs.readFileSync('storage/tickets.json', 'utf-8'));
var punishments = JSON.parse(fs.readFileSync('storage/punishments.json', 'utf-8'));
var games = JSON.parse(fs.readFileSync('storage/games.json', 'utf-8'));
var birthdaysData = JSON.parse(fs.readFileSync('storage/birthdays.json', 'utf8'));


//Run initial setup when client is ready
client.on('ready', async () => {
    //Connect to the Database for verifications
    await db.authenticate()
        .then(async () => {
            await console.log("Connected to Database");
        })
        .catch(async (err) => await console.log(err));

    try {
        //initialise all database models.
        await verification.init(db);
        await verification.sync();
        await infracs.init(db);
        await infracs.sync();
    } catch (err) {
        await console.log(err)
    };


    //Log that bot is ready
    await console.log(`BOT: Ready at ${client.readyAt}`);
    await console.log(`BOT: Random Message Interval set to ${randomBonus}`);

    //set bot status
    setInterval(async () => {
        //Set the presence of the bot
        await client.user.setPresence({
            status: 'online',
            activity: {
                name: 'My Sister Servers',
                type: 'WATCHING'
            }
        });
    }, 86400000);

    //Birthdays
    let rule = new schedule.RecurrenceRule();
    rule.dayOfWeek = [0, 1, 2, 3, 4, 5, 6];
    rule.hour = 0;
    rule.minute = 0;

    let birthdays = await schedule.scheduleJob(rule, async function () {
        birthdaysData = await JSON.parse(fs.readFileSync('storage/birthdays.json', 'utf8'));
        var members = Object.keys(birthdaysData);
        var todaysbirths = {};
        var length = Object.keys(birthdaysData).length;
        var todayDD = Date().toString().split(" ").slice(2, 3).join(" ");
        var todayMM = Date().toString().split(" ").slice(1, 2).join(" ");
        switch (todayMM) {
            case "Jan":
                todayMM = "1";
                break;
            case "Feb":
                todayMM = "2";
                break;
            case "Mar":
                todayMM = "3";
                break;
            case "Apr":
                todayMM = "4";
                break;
            case "May":
                todayMM = "5";
                break;
            case "Jun":
                todayMM = "6";
                break;
            case "Jul":
                todayMM = "7";
                break;
            case "Aug":
                todayMM = "8";
                break;
            case "Sep":
                todayMM = "9";
                break;
            case "Oct":
                todayMM = "10";
                break;
            case "Nov":
                todayMM = "11";
                break;
            case "Dec":
                todayMM = "12";
                break;
        }
        var i = 0
        var announce = ":tada:Todays Birthdays are:\n\n";
        await members.forEach(member => {
            if ((birthdaysData[member.replace("\"", "")].birthdate === `${todayDD}/${todayMM}`) || (birthdaysData[member.replace("\"", "")].birthdate === `0${todayDD}/0${todayMM}`) || (birthdaysData[member.replace("\"", "")].birthdate === `${todayDD}/0${todayMM}`) || (birthdaysData[member.replace("\"", "")].birthdate === `0${todayDD}/${todayMM}`)) {
                todaysbirths[i] = member;
                i++
                announce = announce + `${client.users.cache.get(member.replace("\"", ""))}\n`;
            }
        });
        if (Object.keys(todaysbirths).length === 0) {
            return;
        } else {
            client.channels.cache.get("715711014057934888").send(announce + "\n:cake:We here at Night visions wish them a happy birthday! :cake:");
        }
    });

    //NHIE
    {
        let hour = [0, 12];
        for (let i = 0; i < hour.length; i++) {
            let rulenhie = new schedule.RecurrenceRule();
            rulenhie.dayOfWeek = [0, 1, 2, 3, 4, 5, 6];
            rulenhie.hour = hour[i];
            rulenhie.minute = 0;

            let NHIE = await schedule.scheduleJob(rulenhie, async function () {
                var games = await JSON.parse(fs.readFileSync('storage/games.json', 'utf-8'));
                var i = await Math.floor(Math.random() * games["NHIE"].questions.length - 1) + 1;
                var qotd = games["NHIE"].questions[i];
                var role = await client.guilds.cache.get("715701127181631527").roles.cache.get("811309547514757121");
                var question = new MessageEmbed().setTitle("Never Have I ever").setDescription(qotd);
                await client.channels.cache.get("716828911727804487").send("<@&811309547514757121>");
                await client.channels.cache.get("716828911727804487").send(question);
            });
        }
    }

    //QOTD
    {
        let rulenhie = new schedule.RecurrenceRule();
        rulenhie.dayOfWeek = [0, 1, 2, 3, 4, 5, 6];
        rulenhie.hour = 0;
        rulenhie.minute = 0;

        let QOTD = await schedule.scheduleJob(rulenhie, async function () {
            var games = await JSON.parse(fs.readFileSync('storage/games.json', 'utf-8'));
            var i = await Math.floor(Math.random() * games["QOTD"].questions.length - 1) + 1;
            var qotd = games["QOTD"].questions[i];
            var question = new MessageEmbed().setTitle("Question of The Day").setDescription(qotd);
            await client.channels.cache.get("724777838619918459").send("<@&811309537331642378>");
            await client.channels.cache.get("724777838619918459").send(question);
        });
    }
});

//Error Handling
{
    client.on('shardError', error => {
        console.log("Websocket error", error);
    });
    process.on('unhandledRejection', async error => {
        await console.log('unhandled promise rejection', error);
    });
}

//All Main commands
client.on('message', async function (message) {
    if (message.author.bot) return;

    //Vent anon
    if (message.channel.type === 'dm' && message.content.toLowerCase().startsWith("vent")) {
        var embed = new MessageEmbed().setDescription(message.content.split(" ").slice(1).join(" "));
        await client.guilds.cache.get("715701127181631527").channels.cache.get("716825375187009546").send(embed);
        await embed.setTitle("Vent")
            .addField("User", message.author.username, true)
            .addField("User ID", message.author.id, true)
            .addField("Timestamp", message.createdAt, true);
        await message.react('<a:tick:794230124961988609>');
        await client.guilds.cache.get("715701127181631527").channels.cache.get("809849380806721556").send(embed);
        return;
    }

    //Confess anon
    if (message.channel.type === 'dm' && message.content.toLowerCase().startsWith("confess")) {
        var embed = new MessageEmbed().setDescription(message.content.split(" ").slice(1).join(" "));
        await client.guilds.cache.get("715701127181631527").channels.cache.get("794261160617967646").send(embed);
        await embed.setTitle("Confession")
            .addField("User", message.author.username, true)
            .addField("User ID", message.author.id, true)
            .addField("Timestamp", message.createdAt, true);
        await message.react('<a:tick:794230124961988609>');
        await client.guilds.cache.get("715701127181631527").channels.cache.get("809849380806721556").send(embed);
    }

    //+hubban <user> <reason>
    if (isValidCommand(message, "hubban") && (message.author.id === "468888532660912149" || message.author.id === "577539199708823573" || message.author.id === "584807729927946259" || message.author.id === "459110889526919168")){
        var userid = args[0];
        var reason = args.shift().join(' ');
        await client.guilds.cache.get("715701127181631527").members.ban(userid, {reason: reason})
        .then(await message.channel.send(`User ${userid} has been banned from Night Visions`));
        await message.react('<a:tick:794230124961988609>');
        }

    let AuthorRoleCache = await message.guild.members.cache.get(message.author.id).roles.cache;
    const isValidCommand = (message, cmdName) => message.content.toLowerCase().startsWith(prefix + cmdName);

    //Main NV Commands - Refactored
    if (message.guild === client.guilds.cache.get("715701127181631527") || message.guild === client.guilds.cache.get("806559513414991872") || message.guild === client.guilds.cache.get("789227902839422986")) {
        try {
            if (!message.content.startsWith("+") && !message.content.startsWith(".") && !message.content.startsWith("-") && !message.content.startsWith("s?") && !message.content.startsWith("d!"))
                await MessageCount++;
            if (MessageCount === 151) {
                MessageCount = 0;
            }

            //Utilities
            {

                //+help command - Need to add new commands and features - Paigination?
                if (isValidCommand(message, "help")) {
                    var embed = new MessageEmbed()
                        .setTitle("Help")
                        .setColor("#00ff00")
                        .setDescription("List of all available commands for Mira Bot can be found [here](https://github.com/skyethevixen/mirage). The server prefix is '+' and all commands must be prefaced with it.")
                    await message.channel.send(embed);
                }

                //+creds command
                if (isValidCommand(message, "creds")) {
                    var embed = new MessageEmbed()
                        .setAuthor("Mira Bot", "https://cdn.discordapp.com/embed/avatars/0.png")
                        .setTitle("Server Credentials")
                        .setDescription("Below is a list of all the credentials of those who helped make me and the server possible")
                        .setColor(15844)
                        .addField("Code and Development", "Skye The Vixen")
                        .addField("Bot Name And OC Idea", "Jace")
                        .addField("Bot Idea", "Jess")
                        .addField("Server Owner", "Jess")
                        .addField("Server Icon, Banner and Mira OC Design", "Taper")
                        .setThumbnail("https://cdn.discordapp.com/embed/avatars/0.png");
                    await message.channel.send(embed);
                }

                //Anon Advice
                if (message.channel.id === "814105814486876162") {
                    if (isValidCommand(message, "anon")) {
                        await message.delete();
                        var embed = new MessageEmbed()
                            .setTitle("Anon asked...")
                            .setDescription(await message.content.split(" ").slice(1).join(" "))
                            .setColor(41034);
                        await message.channel.send(embed);
                        await embed.setTitle("Advice")
                            .addField("User", message.author.username, true)
                            .addField("User ID", message.author.id, true)
                            .addField("TimeStamp", message.createdAt, true)
                            .setThumbnail(message.author.avatarURL);
                        await message.guild.channels.cache.get("809849380806721556").send(embed);
                    }
                }

                //Anon Lovense
                try {
                    if (message.channel.id === "787076723938295859" && isValidCommand(message, "anon")) {
                        await message.delete();
                        var embed = new MessageEmbed()
                            .setTitle("Play with me!")
                            .setDescription(message.content.split(" ").slice(1).join(" "))
                            .setColor(41034);
                        await message.channel.send(embed);
                    }
                } catch {
                    await message.channel.send("I do not have sufficient permissions to either send the confession, delete the inital message or log it. Please ensure i have this!!");
                }

                //+suggest <suggestion>
                if (isValidCommand(message, "suggest")) {
                    await message.delete();
                    var embed = new MessageEmbed()
                        .setAuthor(message.author.username)
                        .setTitle("New Suggestion...")
                        .setThumbnail(message.author.avatarURL({
                            size: 64,
                            dynamic: true
                        }))
                        .setDescription(message.content.split(" ").slice(1).join(" "));
                    await client.guilds.cache.get("715651719698186262").channels.cache.get("723369211585626212").send(embed);
                    await message.channel.send(embed).then(async msg => {
                        await msg.react("✅");
                        await msg.react("❌");
                    })
                }

                //+donate
                if (isValidCommand(message, "donate")) {
                    var embed = new MessageEmbed()
                        .setAuthor("Skye The Vixen#7084", message.guild.members.cache.get("577539199708823573").user.avatarURL, "https://vixendev.com")
                        .setTitle("Donate to us!")
                        .addField("Donate to the Developer!", "Donating allows me to continue working on developing Mirager! So thank you for considering it!\nTo donate, please go to https://ko-fi.com/skyethevixen");
                    await message.channel.send(embed);
                }

                //+poll <topic> <opt 1> <opt 2> [additional up to 9]
                try {
                    if (isValidCommand(message, "poll")) {
                        var args = message.content.split(' "').slice(1);
                        var topic = args[0];
                        var options = args.slice(0);
                        var embed = new MessageEmbed()
                            .setTitle(topic.substring(0, topic.length - 1))
                            .setFooter(`Asked by: ${message.author.username}`)
                            .setDescription("");
                        await message.delete();
                        for (var iCount = 1; iCount < options.length; iCount++) {
                            switch (iCount) {
                                case 1:
                                    await embed.setDescription(`${embed.description}\n1️⃣`)
                                    break;
                                case 2:
                                    await embed.setDescription(`${embed.description}\n2️⃣`)
                                    break;
                                case 3:
                                    await embed.setDescription(`${embed.description}\n3️⃣`);
                                    break;
                                case 4:
                                    await embed.setDescription(`${embed.description}\n4️⃣`);
                                    break;
                                case 5:
                                    await embed.setDescription(`${embed.description}\n5️⃣`);
                                    break;
                                case 6:
                                    await embed.setDescription(`${embed.description}\n6️⃣`);
                                    break;
                                case 7:
                                    await embed.setDescription(`${embed.description}\n7️⃣`)
                                    break;
                                case 8:
                                    await embed.setDescription(`${embed.description}\n8️⃣`);
                                    break;
                                case 9:
                                    await embed.setDescription(`${embed.description}\n9️⃣`);
                                    break;
                            }
                            await embed.setDescription(`${embed.description} ${options[iCount].substring(0, options[iCount].length - 1)}`);
                        };
                        await message.channel.send(embed).then(async msg => {
                            for (var iCount = 1; iCount < options.length; iCount++) {
                                switch (iCount) {
                                    case 1:
                                        await msg.react(`1️⃣`)
                                        break;
                                    case 2:
                                        await msg.react(`2️⃣`)
                                        break;
                                    case 3:
                                        await msg.react(`3️⃣`);
                                        break;
                                    case 4:
                                        await msg.react(`4️⃣`);
                                        break;
                                    case 5:
                                        await msg.react(`5️⃣`);
                                        break;
                                    case 6:
                                        await msg.react(`6️⃣`);
                                        break;
                                    case 7:
                                        await msg.react(`7️⃣`)
                                        break;
                                    case 8:
                                        await msg.react(`8️⃣`);
                                        break;
                                    case 9:
                                        await msg.react(`9️⃣`);
                                        break;
                                }
                            }
                        });
                    }
                } catch {
                    message.channel.send("An error occured whilst creating the poll. Please ensure you use the format of ```+poll \"Title for poll\" \"Option 1\" \"Option 2\"...```")
                }


            }

            //Currency
            {
                //Random Bonus
                if (MessageCount === randomBonus) {
                    randomBonus = await Math.floor(Math.random() * 75) + 75;
                    MessageCount = 0;
                    await console.log(`BOT: Random Message Interval set to ${randomBonus}`);
                    await console.log(`BOT: Message Count set to ${MessageCount}`);

                    await message.guild.channels.cache.get("715975331642867802").send("Free Money! Type +collect to collect it! https://cdn.discordapp.com/attachments/715651720201502813/802204543579848724/image0.gif")
                        .then(async msg => {
                            FreeMoney = 1;
                            await msg.delete({
                                    timeout: 15000
                                })
                                .then(async () => {
                                    await wait(15000).
                                    then(async () => {
                                        FreeMoney = 0;
                                        MessageCount = 0;

                                    })

                                });
                        }).catch(async error => {
                            await client.users.cache.get("577539199708823573").send("Random Bonus did not work with error: ", error);
                        });
                }

                //+collect
                if (FreeMoney === 1 && isValidCommand(message, "collect")) {
                    await message.delete();
                    await FreeMoney--;
                    MessageCount = 0;
                    if (!UserData[message.author.id]) {
                        UserData[message.author.id] = {
                            credits: 30,
                            bratPoints: 0
                        };
                        await message.channel.send(`${message.author} Collected 30 Credits`)
                            .then(async msg => {
                                await msg.delete({
                                    timeout: 10000
                                });
                            });
                        await writedata();
                        return;
                    }
                    var oldcreds = parseInt(UserData[message.author.id].credits);
                    var newcreds = oldcreds + 30;
                    UserData[message.author.id].credits = newcreds;
                    await writedata();
                    await message.channel.send(`${message.author} Collected 30 Credits`)
                        .then(async msg => {
                            await msg.delete({
                                timeout: 10000
                            });
                        });
                }

                //+bal
                if (isValidCommand(message, "bal")) {
                    await message.delete();
                    if (!UserData[message.author.id]) {
                        await message.channel.send("You do not have any credits!");
                        UserData[message.author.id] = {
                            credits: 0,
                            bratPoints: 0
                        }
                        await writedata();
                    } else if (UserData[message.author.id].credits === 0) {
                        await message.channel.send("You do not have any credits!");
                    } else if (UserData[message.author.id]) {
                        await message.channel.send(`${message.author} has ${UserData[message.author.id].credits} Credits left!`);
                    }
                }

                //+give
                try {
                    if (isValidCommand(message, "give") && !message.content.startsWith === "+givecredits") {
                        message.delete();
                        if (!UserData[message.author.id]) {
                            await message.channel.send("You do not have any credits!");
                            UserData[message.author.id] = {
                                credits: 0,
                                bratPoints: 0
                            }
                            await writedata();
                        }
                        let args = await message.content.split(" ");
                        let member = await message.mentions.members.first();
                        let credstogive = args[2];
                        if (UserData[message.author.id].credits < credstogive) {
                            await message.channel.send("Whoa! You dont have enough credits left to give!");
                            return;
                        }
                        UserData[message.author.id].credits -= credstogive;
                        if (!UserData[member.id]) {
                            UserData[member.id] = {
                                credits: credstogive,
                                bratPoints: 0
                            }
                            await writedata();
                        } else {
                            UserData[member.id].credits += credstogive;
                        }
                        await message.channel.send(`${message.author} has given ${member} ${credstogive} credits! How generous!`);
                    }
                } catch {
                    await message.channel.send("Something went wrong, did you Ping a user or enter a numerical amount of credits to give?\nCommand Syntax: +give @user 12");
                }

            }

            //Emotes
            if (message.channel.id === "752267223007232020" && message.content.startsWith(`+`) && !message.content.startsWith("+help")) {
                let args = message.content.split(' ').slice(1);
                var random;
                var member;
                //If no mention of user
                if (args[0] === undefined || args[0].includes("@") === false) {
                    message.channel.send("Too few arguments! Did you mention a user?");
                    return;
                } else {
                    random = await Math.floor(Math.random() * (9 - 1 + 1) + 1);
                    member = await message.guild.members.cache.get(await normaliseID(args[0]));
                }

                //+pounce @user
                if (isValidCommand(message, "pounce")) {
                    if (random === 1 || random === 4 || random === 7) {
                        var embed = new MessageEmbed()
                            .setImage(`https://i.postimg.cc/L80pDWtM/pounce3.gif`)
                            .setTitle(`${message.author.username} Pounced at ${member.user.username}`);
                        await message.channel.send(embed);
                    } else if (random === 2 || random === 5 || random === 8) {
                        var embed = new MessageEmbed()
                            .setImage(`https://i.postimg.cc/Y21t7bH1/pounce2.gif`)
                            .setTitle(`${message.author.username} Pounced at ${member.user.username}`);
                        await message.channel.send(embed);
                    } else {
                        var embed = new MessageEmbed()
                            .setImage(`https://i.postimg.cc/zGkNhBB3/pounce1.gif`)
                            .setTitle(`${message.author.username} Pounced at ${member.user.username}`);
                        await message.channel.send(embed);
                    }
                }

                //+Hug @user
                if (isValidCommand(message, "hug")) {
                    if (random === 1 || random === 4 || random === 7) {
                        var embed = new MessageEmbed()
                            .setImage(`https://i.postimg.cc/ncqmn5H5/1SSNieT.gif`)
                            .setTitle(`${message.author.username} hugged ${member.user.username}`);
                        await message.channel.send(embed);
                    } else if (random === 2 || random === 5 || random === 8) {
                        var embed = new MessageEmbed()
                            .setImage(`https://i.postimg.cc/HLvcS12J/IFWDYSp.gif`)
                            .setTitle(`${message.author.username} hugged ${member.user.username}`);
                        await message.channel.send(embed);
                    } else {
                        var embed = new MessageEmbed()
                            .setImage(`https://i.postimg.cc/xd8qNF29/p2qU1kO.gif`)
                            .setTitle(`${message.author.username} hugged ${member.user.username}`);
                        await message.channel.send(embed);
                    }
                }

                //+Kiss @user
                if (isValidCommand(message, "kiss")) {
                    if (random === 1 || random === 4 || random === 7) {
                        var embed = new MessageEmbed()
                            .setImage(`https://i.postimg.cc/XNKLPHWW/tenor-1.gif`)
                            .setTitle(`${message.author.username} kissed ${member.user.username}`);
                        await message.channel.send(embed);
                    } else if (random === 2 || random === 5 || random === 8) {
                        var embed = new MessageEmbed()
                            .setImage(`https://i.postimg.cc/NfgDv6GH/e34e31123f8f35d5c771a2d6a70bef52.gif`)
                            .setTitle(`${message.author.username} kissed ${member.user.username}`);
                        await message.channel.send(embed);
                    } else {
                        var embed = new MessageEmbed()
                            .setImage(`https://i.postimg.cc/hG9QGYpP/tenor.gif`)
                            .setTitle(`${message.author.username} kissed ${member.user.username}`);
                        await message.channel.send(embed);
                    }
                }

                //+slap @user
                if (isValidCommand(message, "slap")) {
                    if (random === 1 || random === 4 || random === 7) {
                        var embed = new MessageEmbed()
                            .setImage(`https://i.postimg.cc/dVN4BhYT/slap1.gif`)
                            .setTitle(`${message.author.username} Slapped ${member.user.username}`);
                        await message.channel.send(embed);
                    } else if (random === 2 || random === 5 || random === 8) {
                        var embed = new MessageEmbed()
                            .setImage(`https://i.postimg.cc/bJkgpL2Q/o2SJYUS.gif`)
                            .setTitle(`${message.author.username} Slapped ${member.user.username}`);
                        await message.channel.send(embed);
                    } else {
                        var embed = new MessageEmbed()
                            .setImage(`https://i.postimg.cc/Kj55gzfj/tenor.gif`)
                            .setTitle(`${message.author.username} Slapped ${member.user.username}`);
                        await message.channel.send(embed);
                    }
                }

                //+Bite @user
                if (isValidCommand(message, "bite")) {
                    if (random === 1 || random === 4 || random === 7) {
                        var embed = new MessageEmbed()
                            .setImage(`https://i.postimg.cc/LsvQGxLh/tenor.gif`)
                            .setTitle(`${message.author.username} bit ${member.user.username}`);
                        await message.channel.send(embed);
                    } else if (random === 2 || random === 5 || random === 8) {
                        var embed = new MessageEmbed()
                            .setImage(`https://i.postimg.cc/5NLVDM00/179a16220f6cf2712073ccdc759ff3e1.gif`)
                            .setTitle(`${message.author.username} bit ${member.user.username}`);
                        await message.channel.send(embed);
                    } else {
                        var embed = new MessageEmbed()
                            .setImage(`https://i.postimg.cc/1z51gnKn/np4.gif`)
                            .setTitle(`${message.author.username} bit ${member.user.username}`);
                        await message.channel.send(embed);
                    }
                }

                //+Cuddle @user
                if (isValidCommand(message, "cuddle")) {
                    if (random === 1 || random === 4 || random === 7) {
                        var embed = new MessageEmbed()
                            .setImage(`https://i.postimg.cc/fLYBqvWZ/cuddle3.gif`)
                            .setTitle(`${message.author.username} cuddled with ${member.user.username}`);
                        await message.channel.send(embed);
                    } else if (random === 2 || random === 5 || random === 8) {
                        var embed = new MessageEmbed()
                            .setImage(`https://i.postimg.cc/NF4bBfrz/cuddle2.gif`)
                            .setTitle(`${message.author.username} cuddled with ${member.user.username}`);
                        await message.channel.send(embed);
                    } else {
                        var embed = new MessageEmbed()
                            .setImage(`https://i.postimg.cc/6qwzkGTZ/cuddle1.gif`)
                            .setTitle(`${message.author.username} cuddled with ${member.user.username}`);
                        await message.channel.send(embed);
                    }
                }

                //+pat @user
                if (isValidCommand(message, "pat")) {
                    if (random === 1 || random === 4 || random === 7) {
                        var embed = new MessageEmbed()
                            .setImage(`https://i.postimg.cc/qvs85gy7/2e27d5d124bc2a62ddeb5dc9e7a73dd8.gif`)
                            .setTitle(`${message.author.username} pet ${member.user.username}`);
                        await message.channel.send(embed);
                    } else if (random === 2 || random === 5 || random === 8) {
                        var embed = new MessageEmbed()
                            .setImage(`https://i.postimg.cc/CdyqvVKD/1549373583-tenor.gif`)
                            .setTitle(`${message.author.username} pet ${member.user.username}`);
                        await message.channel.send(embed);
                    } else {
                        var embed = new MessageEmbed()
                            .setImage(`https://i.postimg.cc/cJJBt0t4/UWbKpx8.gif`)
                            .setTitle(`${message.author.username} pet ${member.user.username}`);
                        await message.channel.send(embed);
                    }
                }

                //+poke @user
                if (isValidCommand(message, "poke")) {
                    if (random === 1 || random === 4 || random === 7) {
                        var embed = new MessageEmbed()
                            .setImage(`https://i.postimg.cc/MHpSDgWh/poke-1.gif`)
                            .setTitle(`${message.author.username} poked ${member.user.username}`);
                        await message.channel.send(embed);
                    } else if (random === 2 || random === 5 || random === 8) {
                        var embed = new MessageEmbed()
                            .setImage(`https://i.postimg.cc/6Qfgmz1w/poke-2.gif`)
                            .setTitle(`${message.author.username} poked ${member.user.username}`);
                        await message.channel.send(embed);
                    } else {
                        var embed = new MessageEmbed()
                            .setImage(`https://i.postimg.cc/2jKJM1Tq/poke-3.gif`)
                            .setTitle(`${message.author.username} poked ${member.user.username}`);
                        await message.channel.send(embed);
                    }
                }

                //+Lick @user
                if (isValidCommand(message, "lick")) {
                    if (random === 1 || random === 4 || random === 7) {
                        var embed = new MessageEmbed()
                            .setImage(`https://i.postimg.cc/tTmrKcd0/lick-1.gif`)
                            .setTitle(`${message.author.username} licked ${member.user.username}`);
                        await message.channel.send(embed);
                    } else if (random === 2 || random === 5 || random === 8) {
                        var embed = new MessageEmbed()
                            .setImage(`https://i.postimg.cc/Vvr7mF4J/lick-2.gif`)
                            .setTitle(`${message.author.username} licked ${member.user.username}`);
                        await message.channel.send(embed);
                    } else {
                        var embed = new MessageEmbed()
                            .setImage(`https://i.postimg.cc/VkWPxYd3/lick-3.gif`)
                            .setTitle(`${message.author.username} licked ${member.user.username}`);
                        await message.channel.send(embed);
                    }
                }

                //+suck @user
                if (isValidCommand(message, "suck")) {
                    if (random === 1 || random === 4 || random === 7) {
                        var embed = new MessageEmbed()
                            .setImage(`https://i.postimg.cc/NFHWpt3C/suck-1.gif`)
                            .setTitle(`${message.author.username} sucked ${member.user.username}`);
                        await message.channel.send(embed);
                    } else if (random === 2 || random === 5 || random === 8) {
                        var embed = new MessageEmbed()
                            .setImage(`https://i.postimg.cc/d0VpgGMy/suck-2.gif`)
                            .setTitle(`${message.author.username} sucked ${member.user.username}`);
                        await message.channel.send(embed);
                    } else {
                        var embed = new MessageEmbed()
                            .setImage(`https://i.postimg.cc/SswPX5n6/suck-3.gif`)
                            .setTitle(`${message.author.username} sucked ${member.user.username}`);
                        await message.channel.send(embed);
                    }
                }

                //+spank @user
                if (isValidCommand(message, "spank")) {
                    if (random === 1 || random === 4 || random === 7) {
                        var embed = new MessageEmbed()
                            .setImage(`https://i.postimg.cc/Ls3MLmtH/spank-1.gif`)
                            .setTitle(`${message.author.username} spanked ${member.user.username}`);
                        await message.channel.send(embed);
                    } else if (random === 2 || random === 5 || random === 8) {
                        var embed = new MessageEmbed()
                            .setImage(`https://i.postimg.cc/rwWTy1zR/spank-2.gif`)
                            .setTitle(`${message.author.username} spanked ${member.user.username}`);
                        await message.channel.send(embed);
                    } else {
                        var embed = new MessageEmbed()
                            .setImage(`https://i.postimg.cc/FK44YYJW/spank-3.gif`)
                            .setTitle(`${message.author.username} spanked ${member.user.username}`);
                        await message.channel.send(embed);
                    }
                }

                //+fuck @user
                if (isValidCommand(message, "fuck")) {
                    if (random === 1 || random === 4 || random === 7) {
                        var embed = new MessageEmbed()
                            .setImage(`https://i.postimg.cc/269M7yVf/fuck-1.gif`)
                            .setTitle(`${message.author.username} fucked ${member.user.username}`);
                        await message.channel.send(embed);
                    } else if (random === 2 || random === 5 || random === 8) {
                        var embed = new MessageEmbed()
                            .setImage(`https://i.postimg.cc/MGxCWghg/fuck-2.gif`)
                            .setTitle(`${message.author.username} fucked ${member.user.username}`);
                        await message.channel.send(embed);
                    } else {
                        var embed = new MessageEmbed()
                            .setImage(`https://i.postimg.cc/63pFZn60/fuck-3.gif`)
                            .setTitle(`${message.author.username} fucked ${member.user.username}`);
                        await message.channel.send(embed);
                    }
                }

                //+anal @user
                if (isValidCommand(message, "anal")) {
                    if (random === 1 || random === 4 || random === 7) {
                        var embed = new MessageEmbed()
                            .setImage(`https://i.postimg.cc/8CHqstGc/anal-1.gif`)
                            .setTitle(`${message.author.username} fucked ${member.user.username} in the ass`);
                        await message.channel.send(embed);
                    } else if (random === 2 || random === 5 || random === 8) {
                        var embed = new MessageEmbed()
                            .setImage(`https://i.postimg.cc/Nj1hvQP1/anal-2.gif`)
                            .setTitle(`${message.author.username} fucked ${member.user.username} in the ass`);
                        await message.channel.send(embed);
                    } else {
                        var embed = new MessageEmbed()
                            .setImage(`https://i.postimg.cc/hvJwyndQ/anal-3.gif`)
                            .setTitle(`${message.author.username} fucked ${member.user.username} in the ass`);
                        await message.channel.send(embed);
                    }
                }
            }

            //Memes
            {
                //2+2=22
                if (message.content.includes("2+2")) {
                    await message.channel.send("It's 22");
                }
            }

            //Brat Based Commands
            {
                //+bratadd @user
                if (isValidCommand(message, "bratadd") && UserData[message.author.id].bpgiven === 0) {
                    try {
                        var args = message.content.split(' ').slice(1);
                        let member = await message.guild.members.cache.get(await normaliseID(args[0]));
                        if (await message.guild.members.cache.get(message.author.id).roles.cache.find(role => role.name === "Dom") || await AuthorRoleCache.find(role => role.name === "Switch")) {
                            //If the mentioned member is not a dom
                            if (!await member.roles.cache.find(role => role.name === "Dom")) {
                                //If the member does not yet exist in the data struct
                                if (!UserData[member.id]) UserData[member.id] = {
                                    credits: 0,
                                    bratPoints: 0,
                                    bpgiven: 0
                                }
                                //then add 1 brat point
                                await UserData[member.id].bratPoints++;
                                await writedata();
                                await message.channel.send(`Oh Dear! ${member} has been a brat and earnt themselves a brat point! They are now on ${UserData[member.id].bratPoints} Brat Points!`);
                                var points = UserData[member.id].bratPoints;
                                var multipleoffive = points % 5;
                                if (multipleoffive === 0) {
                                    random = Math.floor(Math.random() * (4 - 1 + 1) + 1);
                                    message.channel.send(`As a punishment, ${punishments[`${random}`].punishment}`);
                                }
                            } else {
                                await message.channel.send("Hey! Im not gonna give a dom brat points!");
                            }
                        } else {
                            await UserData[message.author.id].bratPoints++;
                            await writedata();
                            await message.channel.send(`${message.author} tried to give someone brat points however since they aren't a dom, I gave them a brat point instead! I hope this teaches you a lesson!`)
                            var points = UserData[message.author.id].bratPoints;
                            var multipleoffive = points % 5;
                            if (multipleoffive === 0) {
                                var random = Math.floor(Math.random() * (4 - 1 + 1) + 1);
                                message.channel.send(punishments[`${random}`].punishment);
                            }
                        }
                        await UserData[message.author.id].bpgiven++;
                        await writedata();
                        await setTimeout(async () => {
                            await UserData[message.author.id].bpgiven--;
                            await writedata();
                        }, 43200000);
                    } catch (err) {
                        await client.users.cache.get("577539199708823573").send(`+bratadd in ${message.channel} from ${message.author} did not work with error: `, err);
                    }

                } else if (isValidCommand(message, "bratadd") && UserData[message.author.id].bpgiven === 1) {
                    await message.channel.send("You are on cooldown! Please try again in a few hours (Note: Cooldown is 12 hours between point issues)")
                }

                //+bp
                if (isValidCommand(message, "bp")) {
                    let cache = message.guild.members.cache.get(message.author.id).roles.cache;
                    if (await cache.some(role => role.name === "Sub") || await cache.some(role => role.name === "Switch") && await UserData[message.author.id]) {
                        if (UserData[message.author.id].bratPoints === 0) {
                            await message.channel.send(`You have ${UserData[message.author.id].bratPoints} Brat Points. Good Job!`);

                        } else {
                            await message.channel.send(`You have ${UserData[message.author.id].bratPoints} Brat Points. Very naughty.`);
                        }
                    } else if (await cache.find(role => role.name == "Dom")) {
                        await message.channel.send("You are a dom and hence are immune to brat points! Thats great news!")
                    } else {
                        await message.channel.send("You do not have any brat points. Or a Dom, sub or switch role! Lucky you! I'm sure we can change that though...")
                    }
                }

                // //+bratboard
                // if(isValidCommand(message, "bratboard")){
                //     var embed = new MessageEmbed()
                //     .setTitle("Brat Board");
                //     var firstbratpoints = 0;
                //     var secondbratpoints = 0;
                //     var thirdbratpoints = 0;
                //     UserData.forEach(user => {
                //         if (user.bratPoints > firstbratpoints){

                //         }
                //     });
                // }
            }

            //Games
            {
                //+slots - Fixed dual reel only spin
                if (isValidCommand(message, "slots") && message.channel.id === "715768048099000333") {
                    if (UserData[message.author.id].credits >= 10) {
                        var slots = ["<:slot1:789229982580342885>", "<:Jackpot:789229982944591872>", "<:slot2:789229982941184080>"];
                        UserData[message.author.id].credits -= 10;
                        for (var i = 0; i <= 3; i++) {
                            random = await Math.floor((Math.random() * (512 - 1 + 1)) / 4);
                            switch (random) {
                                case 1:
                                    slots[i] = "<:Jackpot:789229982944591872>";
                                    break;
                                case 2:
                                    slots[i] = "<:slot1:789229982580342885>";
                                    break;
                                case 3:
                                    slots[i] = "<:slot2:789229982941184080>";
                                    break;
                                case 4:
                                    slots[i] = "<:slot4:789229982596595725>";
                                    break;
                                case 5:
                                    slots[i] = "<:slot7:789229983368609823>";
                                    break;
                                case 6:
                                    slots[i] = "<:slot5:789229982982340668>";
                                    break;
                                case 7:
                                    slots[i] = "<:slot3:789229983067275264>";
                                    break;
                                case 8:
                                    slots[i] = "<:slot1:789229982580342885>";
                                    break;
                                case 9:
                                    slots[i] = "<:slot5:789229982982340668>";
                                    break;
                                case 10:
                                    slots[i] = "<:slot3:789229983067275264>";
                                    break;
                                case 11:
                                    slots[i] = "<:slot5:789229982982340668>";
                                    break;
                                case 12:
                                    slots[i] = "<:slot3:789229983067275264>";
                                    break;
                                case 13:
                                    slots[i] = "<:slot4:789229982596595725>";
                                    break;
                                case 14:
                                    slots[i] = "<:slot5:789229982982340668>";
                                    break;
                                case 15:
                                    slots[i] = "<:slot6:789229983113019423>";
                                    break;
                                case 16:
                                    slots[i] = "<:slot5:789229982982340668>";
                                    break;
                                case 17:
                                    slots[i] = "<:slot5:789229982982340668>";
                                    break;
                                case 18:
                                    slots[i] = "<:slot1:789229982580342885>";
                                    break;
                                case 19:
                                    slots[i] = "<:slot3:789229983067275264>";
                                    break;
                                case 20:
                                    slots[i] = "<:slot7:789229983368609823>";
                                    break;
                                case 21:
                                    slots[i] = "<:slot3:789229983067275264>";
                                    break;
                                case 22:
                                    slots[i] = "<:slot5:789229982982340668>";
                                    break;
                                case 23:
                                    slots[i] = "<:slot5:789229982982340668>";
                                    break;
                                case 24:
                                    slots[i] = "<:slot5:789229982982340668>";
                                    break;
                                case 25:
                                    slots[i] = "<:slot5:789229982982340668>";
                                    break;
                                case 26:
                                    slots[i] = "<:slot1:789229982580342885>";
                                    break;
                                case 27:
                                    slots[i] = "<:slot7:789229983368609823>";
                                    break;
                                case 28:
                                    slots[i] = "<:slot5:789229982982340668>";
                                    break;
                                case 29:
                                    slots[i] = "<:slot3:789229983067275264>";
                                    break;
                                case 30:
                                    slots[i] = "<:slot2:789229982941184080>";
                                    break;
                                case 31:
                                    slots[i] = "<:slot3:789229983067275264>";
                                    break;
                                case 32:
                                    slots[i] = "<:slot5:789229982982340668>";
                                    break;
                                case 33:
                                    slots[i] = "<:slot4:789229982596595725>";
                                    break;
                                case 34:
                                    slots[i] = "<:slot1:789229982580342885>";
                                    break;
                                case 35:
                                    slots[i] = "<:slot3:789229983067275264>";
                                    break;
                                case 36:
                                    slots[i] = "<:slot3:789229983067275264>";
                                    break;
                                case 37:
                                    slots[i] = "<:slot3:789229983067275264>";
                                    break;
                                case 38:
                                    slots[i] = "<:slot5:789229982982340668>";
                                    break;
                                case 39:
                                    slots[i] = "<:slot5:789229982982340668>";
                                    break;
                                case 40:
                                    slots[i] = "<:slot5:789229982982340668>";
                                    break;
                                case 41:
                                    slots[i] = "<:slot5:789229982982340668>";
                                    break;
                                case 42:
                                    slots[i] = "<:slot1:789229982580342885>";
                                    break;
                                case 43:
                                    slots[i] = "<:slot7:789229983368609823>";
                                    break;
                                case 44:
                                    slots[i] = "<:slot3:789229983067275264>";
                                    break;
                                case 45:
                                    slots[i] = "<:slot3:789229983067275264>";
                                    break;
                                case 46:
                                    slots[i] = "<:slot3:789229983067275264>";
                                    break;
                                case 47:
                                    slots[i] = "<:slot4:789229982596595725>";
                                    break;
                                case 48:
                                    slots[i] = "<:slot6:789229983113019423>";
                                    break;
                                case 49:
                                    slots[i] = "<:slot5:789229982982340668>";
                                    break;
                                case 50:
                                    slots[i] = "<:slot1:789229982580342885>";
                                    break;
                                case 51:
                                    slots[i] = "<:slot5:789229982982340668>";
                                    break;
                                case 52:
                                    slots[i] = "<:slot3:789229983067275264>";
                                    break;
                                case 53:
                                    slots[i] = "<:slot3:789229983067275264>";
                                    break;
                                case 54:
                                    slots[i] = "<:slot5:789229982982340668>";
                                    break;
                                case 55:
                                    slots[i] = "<:slot5:789229982982340668>";
                                    break;
                                case 56:
                                    slots[i] = "<:slot5:789229982982340668>";
                                    break;
                                case 57:
                                    slots[i] = "<:slot5:789229982982340668>";
                                    break;
                                case 58:
                                    slots[i] = "<:slot1:789229982580342885>";
                                    break;
                                case 59:
                                    slots[i] = "<:slot2:789229982941184080>";
                                    break;
                                case 60:
                                    slots[i] = "<:slot4:789229982596595725>";
                                    break;
                                case 61:
                                    slots[i] = "<:slot5:789229982982340668>";
                                    break;
                                case 62:
                                    slots[i] = "<:slot2:789229982941184080>";
                                    break;
                                case 63:
                                    slots[i] = "<:slot5:789229982982340668>";
                                    break;
                                case 64:
                                    slots[i] = "<:Jackpot:789229982944591872>";
                                    break;
                                case 65:
                                    slots[i] = "<:slot7:789229983368609823>";
                                    break;
                                case 66:
                                    slots[i] = "<:slot3:789229983067275264>";
                                    break;
                                case 67:
                                    slots[i] = "<:slot3:789229983067275264>";
                                    break;
                                case 68:
                                    slots[i] = "<:slot5:789229982982340668>";
                                    break;
                                case 69:
                                    slots[i] = "<:slot5:789229982982340668>";
                                    break;
                                case 70:
                                    slots[i] = "<:slot5:789229982982340668>";
                                    break;
                                case 71:
                                    slots[i] = "<:slot5:789229982982340668>";
                                    break;
                                case 72:
                                    slots[i] = "<:slot1:789229982580342885>";
                                    break;
                                case 73:
                                    slots[i] = "<:slot4:789229982596595725>";
                                    break;
                                case 74:
                                    slots[i] = "<:slot5:789229982982340668>";
                                    break;
                                case 75:
                                    slots[i] = "<:slot3:789229983067275264>";
                                    break;
                                case 76:
                                    slots[i] = "<:slot3:789229983067275264>";
                                    break;
                                case 77:
                                    slots[i] = "<:slot5:789229982982340668>";
                                    break;
                                case 78:
                                    slots[i] = "<:slot4:789229982596595725>";
                                    break;
                                case 79:
                                    slots[i] = "<:slot6:789229983113019423>";
                                    break;
                                case 80:
                                    slots[i] = "<:slot1:789229982580342885>";
                                    break;
                                case 81:
                                    slots[i] = "<:slot5:789229982982340668>";
                                    break;
                                case 82:
                                    slots[i] = "<:slot5:789229982982340668>";
                                    break;
                                case 83:
                                    slots[i] = "<:slot5:789229982982340668>";
                                    break;
                                case 84:
                                    slots[i] = "<:slot5:789229982982340668>";
                                    break;
                                case 85:
                                    slots[i] = "<:slot5:789229982982340668>";
                                    break;
                                case 86:
                                    slots[i] = "<:slot3:789229983067275264>";
                                    break;
                                case 87:
                                    slots[i] = "<:slot4:789229982596595725>";
                                    break;
                                case 88:
                                    slots[i] = "<:slot1:789229982580342885>";
                                    break;
                                case 89:
                                    slots[i] = "<:slot7:789229983368609823>";
                                    break;
                                case 90:
                                    slots[i] = "<:slot5:789229982982340668>";
                                    break;
                                case 91:
                                    slots[i] = "<:slot5:789229982982340668>";
                                    break;
                                case 92:
                                    slots[i] = "<:slot2:789229982941184080>";
                                    break;
                                case 93:
                                    slots[i] = "<:slot4:789229982596595725>";
                                    break;
                                case 94:
                                    slots[i] = "<:slot1:789229982580342885>";
                                    break;
                                case 95:
                                    slots[i] = "<:slot5:789229982982340668>";
                                    break;
                                case 96:
                                    slots[i] = "<:slot3:789229983067275264>";
                                    break;
                                case 97:
                                    slots[i] = "<:slot5:789229982982340668>";
                                    break;
                                case 98:
                                    slots[i] = "<:slot5:789229982982340668>";
                                    break;
                                case 99:
                                    slots[i] = "<:slot2:789229982941184080>";
                                    break;
                                case 100:
                                    slots[i] = "<:slot3:789229983067275264>";
                                    break;
                                case 101:
                                    slots[i] = "<:slot4:789229982596595725>";
                                    break;
                                case 102:
                                    slots[i] = "<:slot1:789229982580342885>";
                                    break;
                                case 103:
                                    slots[i] = "<:slot5:789229982982340668>";
                                    break;
                                case 104:
                                    slots[i] = "<:slot7:789229983368609823>";
                                    break;
                                case 105:
                                    slots[i] = "<:slot3:789229983067275264>";
                                    break;
                                case 106:
                                    slots[i] = "<:slot5:789229982982340668>";
                                    break;
                                case 107:
                                    slots[i] = "<:slot5:789229982982340668>";
                                    break;
                                case 108:
                                    slots[i] = "<:slot5:789229982982340668>";
                                    break;
                                case 109:
                                    slots[i] = "<:slot5:789229982982340668>";
                                    break;
                                case 110:
                                    slots[i] = "<:slot1:789229982580342885>";
                                    break;
                                case 111:
                                    slots[i] = "<:slot3:789229983067275264>";
                                    break;
                                case 112:
                                    slots[i] = "<:slot4:789229982596595725>";
                                    break;
                                case 113:
                                    slots[i] = "<:slot5:789229982982340668>";
                                    break;
                                case 114:
                                    slots[i] = "<:slot5:789229982982340668>";
                                    break;
                                case 115:
                                    slots[i] = "<:slot5:789229982982340668>";
                                    break;
                                case 116:
                                    slots[i] = "<:slot3:789229983067275264>";
                                    break;
                                case 117:
                                    slots[i] = "<:slot3:789229983067275264>";
                                    break;
                                case 118:
                                    slots[i] = "<:slot1:789229982580342885>";
                                    break;
                                case 119:
                                    slots[i] = "<:slot5:789229982982340668>";
                                    break;
                                case 120:
                                    slots[i] = "<:slot6:789229983113019423>";
                                    break;
                                case 121:
                                    slots[i] = "<:slot3:789229983067275264>";
                                    break;
                                case 122:
                                    slots[i] = "<:slot7:789229983368609823>";
                                    break;
                                case 123:
                                    slots[i] = "<:slot4:789229982596595725>";
                                    break;
                                case 124:
                                    slots[i] = "<:slot3:789229983067275264>";
                                    break;
                                case 125:
                                    slots[i] = "<:slot3:789229983067275264>";
                                    break;
                                case 126:
                                    slots[i] = "<:slot5:789229982982340668>";
                                    break;
                                case 127:
                                    slots[i] = "<:slot2:789229982941184080>";
                                    break;
                                case 128:
                                    slots[i] = "<:slot3:789229983067275264>";
                                    break;
                            }
                        }
                        await message.channel.send(`${message.author}\n:white_large_square: ${slots[0]} ${slots[1]} ${slots[2]} :white_large_square:`);
                        if (slots[0] === slots[1] && slots[0] === slots[2]) {
                            switch (slots[0]) {
                                case "<:Jackpot:789229982944591872>":
                                    UserData[message.author.id].credits += 500;
                                    await message.channel.send("Congratulations you won the Jackpot of 500 credits!!");
                                    break;
                                case "<:slot1:789229982580342885>":
                                    UserData[message.author.id].credits += 37;
                                    await message.channel.send("Congratulations you won 37 credits!!");
                                    break;
                                case "<:slot2:789229982941184080>":
                                    UserData[message.author.id].credits += 46;
                                    await message.channel.send("Congratulations you won 46 credits!!");
                                    break;
                                case "<:slot3:789229983067275264>":
                                    UserData[message.author.id].credits += 22;
                                    await message.channel.send("Congratulations you won 22 credits!!");
                                    break;
                                case "<:slot4:789229982596595725>":
                                    UserData[message.author.id].credits += 38;
                                    await message.channel.send("Congratulations you won 38 credits!!");
                                    break;
                                case "<:slot5:789229982982340668>":
                                    UserData[message.author.id].credits += 10;
                                    await message.channel.send("Congratulations you won 10 credits!!");
                                    break;
                                case "<:slot6:789229983113019423>":
                                    UserData[message.author.id].credits += 50;
                                    await message.channel.send("Congratulations you won 50 credits!!");
                                    break;
                                case "<:slot7:789229983368609823>":
                                    UserData[message.author.id].credits += 45;
                                    await message.channel.send("Congratulations you won 45 credits!!");
                                    break;
                            }
                        }
                        await writedata();
                    } else {
                        await message.channel.send("Your card got declined! Either the machine is broken or you are out of credits");
                    }
                }

                //+NHIE
                if (isValidCommand(message, "nhie") && message.channel.id === "716828911727804487") {
                    var games = await JSON.parse(fs.readFileSync('storage/games.json', 'utf-8'));
                    var i = await Math.floor(Math.random() * games["NHIE"].questions.length - 1) + 1;
                    var qotd = games["NHIE"].questions[i];
                    var question = new MessageEmbed().setTitle("Never Have I ever").setDescription(qotd);
                    await client.channels.cache.get("716828911727804487").send(question);
                }

                //+qotd
                if (isValidCommand(message, "qotd") && message.channel.id === "724777838619918459") {
                    var games = await JSON.parse(fs.readFileSync('storage/games.json', 'utf-8'));
                    var i = await Math.floor(Math.random() * games["QOTD"].questions.length - 1) + 1;
                    var qotd = games["QOTD"].questions[i];
                    var question = new MessageEmbed().setTitle("Question of the Day").setDescription(qotd);
                    await client.channels.cache.get("724777838619918459").send(question);
                }
            }

            //Server Currency
            {
                if (AuthorRoleCache.find(x => x.name === "unverified")) return;
                if (!UserData[message.author.id]) {
                    UserData[message.author.id] = {
                        credits: 1,
                        bratPoints: 0
                    }
                    await writedata();
                    return
                } else if (!message.content.startsWith("+")) {
                    var oldCreds = UserData[message.author.id].credits;
                    var newCreds = oldCreds + 1;
                    UserData[message.author.id].credits = newCreds;
                    await writedata();
                }

                //+buy
                {
                    if (isValidCommand(message, "buy")) {
                        var args = await message.content.split(" ").slice(1).join(" ");
                        if(!args.length){
                            var embed = await new MessageEmbed()
                            .setTitle("Role Shop")
                            .setDescription("Succubus - 2000 Credits\nNude Gods - 800 Credits\n Nude Goddesses - 800 Credits\n Thicc Thighs Save Lives - 3,000 Credits\nSlytherin - 5,000 Credits\nGryffindor - 5,000 Credits\nHufflepuff - 5,000 Credits\nRavenclaw - 5,000 Credits\nItty bitty titty committee - 1,000 Credits\nCutie - 500 Credits\nTitty Lover - 600 Credits\nNymphomaniac - 6,000 Credits\nAnti Social - 2,000 Credits\n I talk way too much - 10,000 Credits\nDC - 900 Credits\nMarvel - 900 Credits\nHeroes - 900 Credits\nVillains - 900 Credits\nDark Humour Room - 3,000 Credits\nAss Lover - 600 Credits\nFeet - 500 Credits")
                            .addField("Usage", "+buy I Talk way too much")
                            .setColor("#f000ff");
                            await message.channel.send(embed);
                        }

                        if (args.toLowerCase() === "succubus" && !await message.guild.members.cache.get(message.author.id).roles.cache.get("821879619928981545")) {
                            if (UserData[message.author.id].credits >= 2000) {
                                UserData[message.author.id].credits -= 2000;
                                await message.guild.members.cache.get(message.author.id).roles.add(await message.guild.roles.cache.get("821879619928981545"));
                                await message.reply("You successfully brought \"Succubus\"!");
                            }
                            else{
                                await message.reply("You don't have enough credits!");
                            }
                        }

                        if (args.toLowerCase() === "nude gods" && !await message.guild.members.cache.get(message.author.id).roles.cache.get("821879623620493322")) {
                            if (UserData[message.author.id].credits >= 800) {
                                UserData[message.author.id].credits -= 800;
                                await message.guild.members.cache.get(message.author.id).roles.add(await message.guild.roles.cache.get("821879623620493322"));
                                await message.reply("You successfully brought \"Nude Gods\"!");
                            }
                            else{
                                await message.reply("You don't have enough credits!");
                            }
                        }

                        if (args.toLowerCase() === "nude goddesses" && !await message.guild.members.cache.get(message.author.id).roles.cache.get("821879623658111016")) {
                            if (UserData[message.author.id].credits >= 800) {
                                UserData[message.author.id].credits -= 800;
                                await message.guild.members.cache.get(message.author.id).roles.add(await message.guild.roles.cache.get("821879623658111016"));
                                await message.reply("You successfully brought \"Nude Goddesses\"!");
                            }
                            else{
                                await message.reply("You don't have enough credits!");
                            }
                        }

                        if (args.toLowerCase() === "thicc thighs save lives" && !await message.guild.members.cache.get(message.author.id).roles.cache.get("821879623733215302")) {
                            if (UserData[message.author.id].credits >= 3000) {
                                UserData[message.author.id].credits -= 3000;
                                await message.guild.members.cache.get(message.author.id).roles.add(await message.guild.roles.cache.get("821879623733215302"));
                                await message.reply("You successfully brought \"Thicc Thighs Save Lives\"!");
                            }
                            else{
                                await message.reply("You don't have enough credits!");
                            }
                        }

                        if (args.toLowerCase() === "slytherin" && !await message.guild.members.cache.get(message.author.id).roles.cache.get("814110158774599712 ")) {
                            if (UserData[message.author.id].credits >= 5000) {
                                UserData[message.author.id].credits -= 5000;
                                await message.guild.members.cache.get(message.author.id).roles.add(await message.guild.roles.cache.get("814110158774599712 "));
                                //Webhook
                                const guild = client.guilds.cache.get(message.guild.id);
                                const webhooks = await guild.fetchWebhooks();
                                const webhook = webhooks.get("823982415122006097");
                                var announcement = "SLYTHERIN!!";
                                await webhook.send(announcement, {
                                    username: "Sorting hat",
                                    avatarURL: "https://static.wikia.nocookie.net/harrypotter/images/6/62/Sorting_Hat.png/revision/latest/scale-to-width-down/350?cb=20161120072849"
                                });
                            }
                            else{
                                await message.reply("You don't have enough credits!");
                            }
                        }

                        if (args.toLowerCase() === "gryffindor" && !await message.guild.members.cache.get(message.author.id).roles.cache.get("814111266717171762")) {
                            if (UserData[message.author.id].credits >= 5000) {
                                UserData[message.author.id].credits -= 5000;
                                await message.guild.members.cache.get(message.author.id).roles.add(await message.guild.roles.cache.get("814111266717171762"));
                                //Webhook
                                const guild = client.guilds.cache.get(message.guild.id);
                                const webhooks = await guild.fetchWebhooks();
                                const webhook = webhooks.get("823982415122006097");
                                var announcement = "Gryffindor, where dwell the brave at heart!";
                                await webhook.send(announcement, {
                                    username: "Sorting hat",
                                    avatarURL: "https://static.wikia.nocookie.net/harrypotter/images/6/62/Sorting_Hat.png/revision/latest/scale-to-width-down/350?cb=20161120072849"
                                });
                            }
                            else{
                                await message.reply("You don't have enough credits!");
                            }
                        }

                        if (args.toLowerCase() === "hufflepuff" && !await message.guild.members.cache.get(message.author.id).roles.cache.get("814110519609786389")) {
                            if (UserData[message.author.id].credits >= 5000) {
                                UserData[message.author.id].credits -= 5000;
                                await message.guild.members.cache.get(message.author.id).roles.add(await message.guild.roles.cache.get("814110519609786389"));
                                //Webhook
                                const guild = client.guilds.cache.get(message.guild.id);
                                const webhooks = await guild.fetchWebhooks();
                                const webhook = webhooks.get("823982415122006097");
                                var announcement = "You might belong in Hufflepuff,\nWhere they are just and loyal,\nThose patient Hufflepuffs are true,\nAnd unafraid of toil";
                                await webhook.send(announcement, {
                                    username: "Sorting hat",
                                    avatarURL: "https://static.wikia.nocookie.net/harrypotter/images/6/62/Sorting_Hat.png/revision/latest/scale-to-width-down/350?cb=20161120072849"
                                });
                            }
                            else{
                                await message.reply("You don't have enough credits!");
                            }
                        }

                        if (args.toLowerCase() === "ravenclaw" && !await message.guild.members.cache.get(message.author.id).roles.cache.get("814111644556066856")) {
                            if (UserData[message.author.id].credits >= 5000) {
                                UserData[message.author.id].credits -= 5000;
                                await message.guild.members.cache.get(message.author.id).roles.add(await message.guild.roles.cache.get("814111644556066856"));
                                //Webhook
                                const guild = client.guilds.cache.get(message.guild.id);
                                const webhooks = await guild.fetchWebhooks();
                                const webhook = webhooks.get("823982415122006097");
                                var announcement = "Or yet in wise old Ravenclaw,\nif you've a ready mind,\nWhere those of wit and learning,\nWill always find their kind.";
                                await webhook.send(announcement, {
                                    username: "Sorting hat",
                                    avatarURL: "https://static.wikia.nocookie.net/harrypotter/images/6/62/Sorting_Hat.png/revision/latest/scale-to-width-down/350?cb=20161120072849"
                                });
                            }
                            else{
                                await message.reply("You don't have enough credits!");
                            }
                        }

                        if (args.toLowerCase() === "itty bitty titty committee" && !await message.guild.members.cache.get(message.author.id).roles.cache.get("821879627122212875")) {
                            if (UserData[message.author.id].credits >= 1000) {
                                UserData[message.author.id].credits -= 1000;
                                await message.guild.members.cache.get(message.author.id).roles.add(await message.guild.roles.cache.get("821879627122212875"));
                                await message.reply("You successfully brought \"Itty Bitty Titty Committee\"! Welcome to the club!");
                            }
                            else{
                                await message.reply("You don't have enough credits!");
                            }
                        }

                        if (args.toLowerCase() === "cutie" && !await message.guild.members.cache.get(message.author.id).roles.cache.get("821879627173330965")) {
                            if (UserData[message.author.id].credits >= 500) {
                                UserData[message.author.id].credits -= 500;
                                await message.guild.members.cache.get(message.author.id).roles.add(await message.guild.roles.cache.get("821879627173330965"));
                                await message.reply("You successfully brought \"Cutie\"!");
                            }
                            else{
                                await message.reply("You don't have enough credits!");
                            }
                        }

                        if (args.toLowerCase() === "titty lover" && !await message.guild.members.cache.get(message.author.id).roles.cache.get("821879637218689024")) {
                            if (UserData[message.author.id].credits >= 600) {
                                UserData[message.author.id].credits -= 600;
                                await message.guild.members.cache.get(message.author.id).roles.add(await message.guild.roles.cache.get("821879637218689024"));
                                await message.reply("You successfully brought \"Titty Lover\"!");
                            }
                            else{
                                await message.reply("You don't have enough credits!");
                            }
                        }

                        if (args.toLowerCase() === "nymphomaniac" && !await message.guild.members.cache.get(message.author.id).roles.cache.get("821879627496554496")) {
                            if (UserData[message.author.id].credits >= 6000) {
                                UserData[message.author.id].credits -= 6000;
                                await message.guild.members.cache.get(message.author.id).roles.add(await message.guild.roles.cache.get("821879627496554496"));
                                await message.reply("You successfully brought \"Nymphomaniac\"! What does that mean..? Hey Google!");
                            }
                            else{
                                await message.reply("You don't have enough credits!");
                            }
                        }

                        if (args.toLowerCase() === "anti social" && !await message.guild.members.cache.get(message.author.id).roles.cache.get("821879630030045246")) {
                            if (UserData[message.author.id].credits >= 2000) {
                                UserData[message.author.id].credits -= 2000;
                                await message.guild.members.cache.get(message.author.id).roles.add(await message.guild.roles.cache.get("821879630030045246"));
                                await message.reply("\*silence\* (You got it)");
                            }
                            else{
                                await message.reply("You don't have enough credits!");
                            }
                        }

                        if (args.toLowerCase() === "i talk way too much" && !await message.guild.members.cache.get(message.author.id).roles.cache.get("821879630465204264")) {
                            if (UserData[message.author.id].credits >= 10000) {
                                UserData[message.author.id].credits -= 10000;
                                await message.guild.members.cache.get(message.author.id).roles.add(await message.guild.roles.cache.get("821879630465204264"));
                                await message.reply("Yes you do. Also, You successfully brought \"I talk wayyyyy too much\"!");
                            }
                            else{
                                await message.reply("You don't have enough credits!");
                            }
                        }

                        if (args.toLowerCase() === "dc" && !await message.guild.members.cache.get(message.author.id).roles.cache.get("821879630553940018")) {
                            if (UserData[message.author.id].credits >= 900) {
                                UserData[message.author.id].credits -= 900;
                                await message.guild.members.cache.get(message.author.id).roles.add(await message.guild.roles.cache.get("821879630553940018"));
                                await message.reply("You successfully brought \"DC\"!");
                            }
                            else{
                                await message.reply("You don't have enough credits!");
                            }
                        }

                        if (args.toLowerCase() === "marvel" && !await message.guild.members.cache.get(message.author.id).roles.cache.get("821879633376837662")) {
                            if (UserData[message.author.id].credits >= 900) {
                                UserData[message.author.id].credits -= 900;
                                await message.guild.members.cache.get(message.author.id).roles.add(await message.guild.roles.cache.get("821879633376837662"));
                                await message.reply("You successfully brought \"Marvel\"!");
                            }
                            else{
                                await message.reply("You don't have enough credits!");
                            }
                        }

                        if (args.toLowerCase() === "heroes" && !await message.guild.members.cache.get(message.author.id).roles.cache.get("821879633413799936")) {
                            if (UserData[message.author.id].credits >= 900) {
                                UserData[message.author.id].credits -= 900;
                                await message.guild.members.cache.get(message.author.id).roles.add(await message.guild.roles.cache.get("821879633413799936"));
                                await message.reply("You successfully brought \"heroes\"!");
                            }
                            else{
                                await message.reply("You don't have enough credits!");
                            }
                        }

                        if (args.toLowerCase() === "villains" && !await message.guild.members.cache.get(message.author.id).roles.cache.get("821879633439752212")) {
                            if (UserData[message.author.id].credits >= 900) {
                                UserData[message.author.id].credits -= 900;
                                await message.guild.members.cache.get(message.author.id).roles.add(await message.guild.roles.cache.get("821879633439752212"));
                                await message.reply("You successfully brought \"Villains\"!");
                            }
                            else{
                                await message.reply("You don't have enough credits!");
                            }
                        }

                        if (args.toLowerCase() === "dark humour room" && !await message.guild.members.cache.get(message.author.id).roles.cache.get("821879637160099871")) {
                            if (UserData[message.author.id].credits >= 3000) {
                                UserData[message.author.id].credits -= 3000;
                                await message.guild.members.cache.get(message.author.id).roles.add(await message.guild.roles.cache.get("821879637160099871"));
                                await message.reply("You successfully brought access to the dark humour room!");
                            }
                            else{
                                await message.reply("You don't have enough credits!");
                            }
                        }

                        if (args.toLowerCase() === "ass lover" && !await message.guild.members.cache.get(message.author.id).roles.cache.get("821879637205975051")) {
                            if (UserData[message.author.id].credits >= 600) {
                                UserData[message.author.id].credits -= 600;
                                await message.guild.members.cache.get(message.author.id).roles.add(await message.guild.roles.cache.get("821879637205975051"));
                                await message.reply("You successfully brought \"Ass Lovers\"!");
                            }
                            else{
                                await message.reply("You don't have enough credits!");
                            }
                        }

                        if (args.toLowerCase() === "feet" && !await message.guild.members.cache.get(message.author.id).roles.cache.get("814110125417037844")) {
                            if (UserData[message.author.id].credits >= 500) {
                                UserData[message.author.id].credits -= 500;
                                await message.guild.members.cache.get(message.author.id).roles.add(await message.guild.roles.cache.get("814110125417037844"));
                                await message.reply("You successfully brought \"feet\"!");
                            }
                            else{
                                await message.reply("You don't have enough credits!");
                            }
                        }
                        
                    }
                }
            }

            //Moderation
            if (await AuthorRoleCache.get("804129560840896562") || message.author.id === "577539199708823573") {
                let args = message.content.split(' ').slice(1);

                //+promote <userid> <role>
                if (message.author.id === "577539199708823573" && isValidCommand(message, "promote")) {
                    let args = await message.content.split(" ").slice(1)
                    var user = await client.users.cache.get(args[0]);
                    var rolename = await message.content.toLowerCase().split(" ").slice(1).slice(1).join(" ");
                    let staffhelp = "";
                    let mainrole = "";
                    let invitelink = await client.guilds.cache.get("715651719698186262").channels.cache.get("816354501593137202").createInvite({
                        maxUses: 1,
                        reason: "Staff invite",
                        unique: true
                    });
                    switch (rolename) {
                        case "chat-mod":
                            mainrole = await client.guilds.cache.get("715701127181631527").roles.cache.get("771151857187422249");
                            staffhelp = await client.guilds.cache.get("715701127181631527").roles.cache.get("804129560840896562");
                            break;
                        case "admin":
                            mainrole = await client.guilds.cache.get("715701127181631527").roles.cache.get("715712712117715005");
                            staffhelp = await client.guilds.cache.get("715701127181631527").roles.cache.get("804129560840896562");
                            break;
                        case "seller admin":
                            mainrole = await client.guilds.cache.get("715701127181631527").roles.cache.get("771395530294296598");
                            break;
                        case "event manager":
                            mainrole = await client.guilds.cache.get("715701127181631527").roles.cache.get("816359185654349894");
                            break;
                    }
                    await user.send(`Welcome to Night Visions staff as a/an ${rolename}. Your unique one-time invite to the staff server is ${invitelink}.\n\n Please be sure you write down your timezone in <#804930133324464169> and let the other staff know if you have any issues!`);
                    let userRole = await client.guilds.cache.get("715701127181631527").members.cache.get(user.id).roles;
                    try {
                        await userRole.add(mainrole);
                        await userRole.add(staffhelp);
                    } catch {

                    }
                }
                
                //View stats about the bot - +status
                if (isValidCommand(message, "status")) {
                    await message.channel.send(`Uptime: ${(Math.floor(process.uptime())/60).toString()} Minutes\nMemory Usage: ${process.memoryUsage().toString()}`);
                }

                //Send Message to channel - +send <channel ID> <message>
                if (isValidCommand(message, "send")) {
                    var channel = await normaliseID(args[0]);
                    var announcement = await args.slice(1).join(" ");
                    var embed = new MessageEmbed().setTitle("Notice").setDescription(announcement).setColor('#00FF00');
                    await client.guilds.cache.find(x => x.channels.cache.get(channel)).channels.cache.get(channel).send(embed);
                    await message.react('<a:tick:794230124961988609>');
                }

                //view Message Count - +viewmc
                if (isValidCommand(message, "viewmc")) {
                    await message.channel.send(`Message Count: ${MessageCount}`);
                    await message.channel.send(`Random Bonus: ${randomBonus}`);
                    await message.channel.send(`Free Money: ${FreeMoney}`);
                }

                //reset Message Count - +resetmc
                if (isValidCommand(message, "resetmc")) {
                    MessageCount = 0;
                    FreeMoney = 0;
                    await message.channel.send(`Message Count: ${MessageCount}`);
                    await message.channel.send(`Random Bonus: ${randomBonus}`);
                    await message.channel.send(`Free Money: ${FreeMoney}`);
                }

                //Add user note - +note @user [reason]
                if (isValidCommand(message, "note") || message.content.toLowerCase().startsWith("!setnote")) {
                    let member = await message.guild.members.cache.get(await normaliseID(args[0]));
                    let reason = await message.content.split(" ").slice(1).slice(1).join(" ");

                    try {
                        const Infrac = await infracs.create({
                            UserId: member.id,
                            GuildId: message.guild.id,
                            AddedById: message.author.id,
                            InfractionType: "1",
                            Infraction: reason
                        });
                        await message.channel.send("I have successfully added that to the log file!")
                    } catch (error) {
                        await console.log(error);
                        await message.channel.send("An error occured whilst adding that");
                    }
                }

                //Add user warn - +warn @user [reason]
                if (isValidCommand(message, "warn") || message.content.toLowerCase().startsWith("-warn") || message.content.toLowerCase().startsWith("~strike")) {
                    let member = await message.guild.members.cache.get(await normaliseID(args[0]));
                    let reason = await args.slice(1).join(" ");
                    try {
                        const Infrac = await infracs.create({
                            UserId: member.id,
                            GuildId: message.guild.id,
                            AddedById: message.author.id,
                            Infraction: reason,
                            InfractionType: "2"
                        });
                        await member.send(`⚠️You have been warned for ${reason}⚠️`);
                        await message.channel.send("I have successfully added that to the log file!")
                    } catch (error) {
                        await console.log("An error occured whilst adding data to DB");
                        await message.channel.send("An error occured whilst adding that");
                    }
                }

                //View infractions of user - +infrac @user
                if (isValidCommand(message, "infrac") || isValidCommand(message, "infractions")) {
                    let MemberData = await infracs.findAll({
                        raw: true,
                        where: {
                            UserId: await parseInt(`${await normaliseID(args[0])}`),
                            GuildId: message.guild.id
                        }
                    });
                    MemberData = await JSON.parse(await JSON.stringify(MemberData));
                    var embed = new MessageEmbed().setTitle("Infraction data").setThumbnail(client.users.cache.get(await normaliseID(args[0])).avatarURL({dynamic: true, size: 128}));
                    await embed.setDescription(`Infractions for <@!${await normaliseID(args[0])}>\n\nNo Infraction data to show`);
                    for (var i = 0; i <= MemberData.length - 1; i++) {

                        var guild = "";
                        if (MemberData[i].GuildId === '768896221556506724' || MemberData[i].GuildId === '795282757630165002') {
                            guild = "Purgatory 18+";
                        }
                        if (MemberData[i].GuildId === '715701127181631527') {
                            guild = "Night Visions 18+";
                        }
                        if (MemberData[i].GuildId === '671494359056646176') {
                            guild = "Land of Sweets 18+";
                        }

                        if(MemberData[i].InfractionType === 1){
                            await embed.setDescription(`Infractions for <@!${await normaliseID(args[0])}>`);
                            await embed.addField("Note",`ID: ${MemberData[i].InfracID}\nAdded By: <@!${MemberData[i].AddedById}>\nReason: ${MemberData[i].Infraction}\nGuild: ${guild}\nTimestamp: ${MemberData[i].createdAt}`)
                        }
                        else if(MemberData[i].InfractionType === 2){
                            await embed.setDescription(`Infractions for <@!${await normaliseID(args[0])}>`);
                            await embed.addField("Warn",`ID: ${MemberData[i].InfracID}\nAdded By: <@!${MemberData[i].AddedById}>\nReason: ${MemberData[i].Infraction}\nGuild: ${guild}\nTimestamp: ${MemberData[i].createdAt}`)

                        }
                    }
                    await message.channel.send(embed);
                }

                //View infractions of user - +infrac @user
                if (isValidCommand(message, "pinfrac") || isValidCommand(message, "pinfractions")) {
                    let MemberData = await infracs.findAll({
                        raw: true,
                        where: {
                            UserId: await parseInt(`${await normaliseID(args[0])}`),
                        }
                    });
                    MemberData = await JSON.parse(await JSON.stringify(MemberData));
                    var embed = new MessageEmbed().setTitle("Infraction data").setThumbnail(client.users.cache.get(await normaliseID(args[0])).avatarURL({dynamic: true, size: 128}));
                    await embed.setDescription(`Infractions for <@!${await normaliseID(args[0])}>\n\nNo Infraction data to show`);
                    for (var i = 0; i <= MemberData.length - 1; i++) {

                        var guild = "";
                        if (MemberData[i].GuildId === '768896221556506724' || MemberData[i].GuildId === '795282757630165002') {
                            guild = "Purgatory 18+";
                        }
                        if (MemberData[i].GuildId === '715701127181631527') {
                            guild = "Night Visions 18+";
                        }
                        if (MemberData[i].GuildId === '671494359056646176') {
                            guild = "Land of Sweets 18+";
                        }

                        if(MemberData[i].InfractionType === 1){
                            await embed.setDescription(`Infractions for <@!${await normaliseID(args[0])}>`);
                            await embed.addField("Note",`ID: ${MemberData[i].InfracID}\nAdded By: <@!${(MemberData[i].AddedById)}>\nReason: ${MemberData[i].Infraction}\nGuild: ${guild}\nTimestamp: ${MemberData[i].createdAt.substring(0, 10)}`)
                        }
                        else if(MemberData[i].InfractionType === 2){
                            await embed.setDescription(`Infractions for <@!${await normaliseID(args[0])}>`);
                            await embed.addField("Warn",`ID: ${MemberData[i].InfracID}\nAdded By: <@!${(MemberData[i].AddedById)}>\nReason: ${MemberData[i].Infraction}\nGuild: ${guild}\nTimestamp: ${MemberData[i].createdAt.substring(0, 10)}`)
                        }
                    }
                    await message.channel.send(embed);
                }

                //+rem <infracid>
                if (isValidCommand(message, "rem") || isValidCommand(message, "remove")) {
                    if (await infracs.count({
                        where: {
                            InfracID: `${args[0]}`,
                            GuildId: message.guild.id
                        }
                    }) === 0) return await message.channel.send("No infractions to remove");
                    else {
                        await infracs.destroy({
                            where: {
                                InfracID: `${args[0]}`,
                                GuildId: message.guild.id
                            }
                        });
                        await message.channel.send("Successfully removed infraction");
                    }
                }

                //+whois @user
                if (isValidCommand(message, "whois")) {
                    let user = await message.guild.members.cache.get(await normaliseID(args[0]));
                    var embed = new MessageEmbed()
                        .setTitle(user.user.tag)
                        .addField("ID", user.id, true)
                        .addField("Avatar", `[Link](${user.user.displayAvatarURL()})`, true)
                        .addField("Account Created", user.user.createdAt.toUTCString(), true)
                        .addField("Account age", "Not Implemented", true)
                        .addField("Joined server at", user.joinedAt.toUTCString(), true)
                        .addField("Join server Age", "Not implemented", true)
                        .addField("Status", `${user.user.presence.activities}: ${user.user.presence.clientStatus}`)
                        .addField("Previous Usernames", "a")
                        .addField("Previous Nicknames", "a")
                        .setThumbnail(user.user.displayAvatarURL({
                            dynamic: true,
                            size: 64
                        }));
                    await message.channel.send(embed)
                }

                //+cvc @user
                if (isValidCommand(message, "cvc")) {
                    try {
                        let MemberData = await verification.findAll({
                            raw: true,
                            where: {
                                UserId: await parseInt(`${await normaliseID(args[0])}`)
                            }
                        });
                        MemberData = await JSON.parse(await JSON.stringify(MemberData));
                        let embed = new MessageEmbed()
                            .setTitle(await client.users.cache.get(await normaliseID(args[0])).tag)
                            .setDescription("NOT VERIFIED")
                            .setThumbnail(await client.users.cache.get(await normaliseID(args[0])).avatarURL({
                                size: 64,
                                dynamic: true
                            }));
                        await embed.setColor(15158332);
                        try {
                            for (var i = 0; i <= MemberData.length - 1; i++) {
                                if (MemberData[i].GuildId === '768896221556506724' || MemberData[i].GuildId === '795282757630165002') {
                                    await embed.setDescription("Is verified in the following servers")
                                        .addField("Purgatory", `Verified by ${MemberData[i].Verifier}`)
                                        .setColor(3066993);

                                }
                                if (MemberData[i].GuildId === '715701127181631527') {
                                    await embed.setDescription("Is verified in the following servers")
                                        .setColor(3066993)
                                        .addField("Night Visions 18+", `Verified by ${MemberData[i].Verifier}`);
                                }
                                if (MemberData[i].GuildId === '671494359056646176') {
                                    await embed.setDescription("Is verified in the following servers")
                                        .setColor(3066993)
                                        .addField("Land Of Sweets 18+", `Verified by ${MemberData[i].Verifier}`);
                                }
                            }
                        } catch {
                            await embed.addField("Unverified", "User is unverified in any official partnered servers. (They may exist in a test server)")
                                .setColor('#ff0000');
                        }
                        await message.channel.send(embed);
                    } catch (err) {
                        await console.log(err);
                        await message.channel.send("An unexpected error occured.");
                    }
                }

                //-verify @user - Runs at yag command
                if (message.content.startsWith("-verify")) {
                    //Get member
                    let member = await message.guild.members.cache.get(await normaliseID(args[0]));
                    //append data to db
                    try {
                        const Verification = await verification.create({
                            UserId: member.id,
                            GuildId: message.guild.id,
                            Verifier: message.author.username
                        });
                        const embed = new MessageEmbed()
                            .setColor(0x00ff00)
                            .setTitle(`${member.displayName}#${member.user.discriminator} Verified`)
                            .setDescription(`Server: ${message.guild.name}\n\nUser ID: ${member.user.id}\nUser Name: ${member.displayName}#${member.user.discriminator}\nVerifier ID: ${message.author.id}\nVerifier Name: ${message.author}`)
                            .setImage(member.user.avatarURL)
                            .setThumbnail(member.user.avatarURL("png", true, 256))
                            .addField("Guild", message.guild);
                        await client.guilds.cache.get("787119026996248586").channels.cache.get("787269212027879444").send(embed);
                    } catch (error) {
                        await console.log("User is likely already in the database for this guild");
                        await message.channel.send("User is most likely already in the db");
                    }
                }

                //+init
                if (isValidCommand(message, "init")) {
                    await message.delete();
                    await message.guild.members.cache.forEach(member => {
                        if (!UserData[member.id]) {
                            UserData[member.id] = {
                                credits: 0,
                                bratPoints: 0
                            }
                        }
                    });
                    await message.channel.send("Server data initialised in database. All members who were not in file are now in.");
                    let announce = await message.guild.channels.cache.find(x => x.name.includes("announcements"));
                    await announce.send("Booting Mirage... 0%").then(async msg => {
                        for (var i = 0; i < 100; i++) {
                            await wait(50);
                            await msg.edit(`Booting Mirage... ${i}%`);
                        }
                        let role = await message.guild.roles.cache.find(x => x.name === "verified");
                        await msg.edit(`Huh? Where am I? What is this wonderful yet mysterious place? Is that.. I see... people? *gasps* there are people here!! *squeals with excitement!!* I love people!! They are so fun to play with!! Hi ${role} I’m Mirage or Mira for short... I’m here to have all sorts of fun with you.`)
                    })
                }

                //+resetbal @User
                if (isValidCommand(message, "resetbal")) {
                    if (!UserData[message.author.id]) {
                        UserData[message.author.id] = {
                            credits: 0,
                            bratPoints: 0
                        }
                        await writedata();
                    }
                    await message.delete();
                    //Get member
                    let member = await message.guild.members.cache.get(await normaliseID(args[0]));
                    //reset balance
                    UserData[member.id].credits = 0;
                    await writedata();
                    await message.guild.channels.cache.get("715756082907316304").send(`${member} has had their points reset by ${message.author}`);
                }

                //+givecredits @User 
                if (isValidCommand(message, "givecredits")) {
                    //Get members ID then member data structure
                    const args = await message.content.slice(prefix.length).trim().split(' ');
                    await args.shift();
                    if (!UserData[await normaliseID(args[0])]) {
                        UserData[await normaliseID(args[0])] = {
                            credits: 0,
                            bratPoints: 0
                        }
                        await writedata();
                    }
                    let member = await message.guild.members.cache.get(await normaliseID(args[0]));
                    await args.shift();
                    var addcredits = parseInt(args[0]);
                    var credits = parseInt(UserData[member.id].credits);
                    credits = credits + addcredits;
                    UserData[member.id].credits = credits
                    await writedata();
                    await message.guild.channels.cache.get("715756082907316304").send(`${member} has been given ${addcredits} by ${message.author}`);
                    await message.delete();
                }

                //+announce Announcement
                if (isValidCommand(message, "announce")) {
                    //Webhook
                    const guild = client.guilds.cache.get(message.guild.id);
                    const webhooks = await guild.fetchWebhooks();
                    const webhook = webhooks.get("794203657029025802");
                    var announcement = message.content.substring(9).trimStart();
                    await webhook.send(announcement, {
                        username: "Night Visions 18+",
                        avatarURL: "https://cdn.discordapp.com/icons/715701127181631527/a_047e58bab27ee60e031b001fe4600fd3.webp?size=128"
                    })
                    await message.react('<a:tick:794230124961988609>');
                }

                //+exit (used to safely reboot the bot)
                if (isValidCommand(message, "exit") && message.author.id === "577539199708823573") {
                    await message.channel.send("Mira Exiting...");
                    await wait(500);
                    await client.destroy();
                    await process.exit(2);

                }

                //+verreq
                if (isValidCommand(message, "verreq")) {
                    await message.delete();
                    await message.channel.send("Hi there! I'm Mirage, Night Visions' Helper. To help get you verified, please follow the steps below, then staff will review this and verify you! (Please be patient though as the staff have a life outside of discord as well!!)\nTo verify, please do the following:\n➤ Step 1. Send a picture of your ID and a piece of paper that reads \"This servers name, todays date and discord username\"\n➤ Step 2. Send a second picture of you holding the ID and the piece of paper close to your face so we can verify that the ID does belong to you.");
                    await message.channel.send("\nWe want to emphasize security. We do not want to see your address, license number or any other information. We just want to see your DOB (date of birth) and your photo that is it.\nWe will accept cross verification from any of the servers listed below.\n1. Purgatory\n2. Night Visionss")
                }

                //+setStatus
                if (isValidCommand(message, "setstatus")) {
                    client.user.setPresence({
                        status: args[0],
                        activity: {
                            type: args[1],
                            name: args.slice(1).slice(1).join(" ")
                        }
                    });
                    await message.react('<a:tick:794230124961988609>');
                }
            }

            //Music
            {
                const serverQueue = queue.get(message.guild.id);
                if (isValidCommand(message, "play")) {
                    //Set variables needed for music to function
                    const voice_channel = message.guild.members.cache.get(message.author.id).voice.channel;
                    if (!voice_channel) return await message.channel.send('You need to be in a VC for this to work!');
                    const permissions = voice_channel.permissionsFor(message.client.user);
                    if (!permissions.has('CONNECT')) return await message.channel.send("I dont have sufficient permissions to connect");
                    if (!permissions.has('SPEAK')) return await message.channel.send("I dont have sufficient permissions to speak");
                    if (await message.content.split(" ").slice(1).join(" ").length === 0) return await message.channel.send("```No arguments passed```");
                    var args = await message.content.split(" ").slice(1).join(" ");
                    if (args.startsWith("https://www.youtube.com")) {
                        const songInfo = await (await ytdl.getBasicInfo(args)).videoDetails;
                        const song = {
                            id: songInfo.videoId,
                            title: songInfo.title,
                            url: args
                        }
                        if (!serverQueue) {
                            const queueConstruct = {
                                textChannel: message.channel,
                                voiceChannel: voice_channel,
                                connection: null,
                                songs: [],
                                volume: 5,
                                playing: true
                            }
                            queue.set(message.guild.id, queueConstruct);
                            queueConstruct.songs.push(song);
                            const connection = await voice_channel.join();
                            queueConstruct.connection = connection;
                            play(message.guild, queueConstruct.songs[0]);
                        } else {
                            serverQueue.songs.push(song);
                            return await message.channel.send(`**${song.title}** has been added to the queue`)
                        }
                        return undefined;
                    }
                    else{
                        const r = await yts(args);
                        const v = r.videos.slice(0, 1)
                        const song = {
                            id: v[0].videoId,
                            title: v[0].title,
                            url: `https://www.youtube.com/watch?v=${v[0].videoId}`
                        }
                        const songInfo = await (await ytdl.getInfo(song.url)).videoDetails;
                        if (!serverQueue) {
                            const queueConstruct = {
                                textChannel: message.channel,
                                voiceChannel: voice_channel,
                                connection: null,
                                songs: [],
                                volume: 5,
                                playing: true
                            }
                            queue.set(message.guild.id, queueConstruct);
                            queueConstruct.songs.push(song);
                            const connection = await voice_channel.join();
                            queueConstruct.connection = connection;
                            play(message.guild, queueConstruct.songs[0]);
                        } else {
                            serverQueue.songs.push(song);
                            return await message.channel.send(`**${song.title}** has been added to the queue`)
                        }
                        return undefined;
                    }
                }
                if (isValidCommand(message, "stop")) {
                    if (!message.member.voice.channel) return await message.channel.send("You need to be in a VC to do that.");
                    if (!serverQueue) return await message.channel.send("There is nothing playing!");
                    serverQueue.songs = [];
                    serverQueue.connection.dispatcher.end();
                    await message.react('👋');
                }
                if (isValidCommand(message, "skip")) {
                    if (!message.member.voice.channel) return await message.channel.send("You need to be in a VC to do that.");
                    if (!serverQueue) return await message.channel.send("There is nothing playing!");
                    serverQueue.songs.shift();
                    serverQueue.connection.dispatcher.end();
                    play(message.guild, serverQueue.songs[0])
                    await message.react('⏭️');
                }
                if (isValidCommand(message, "volume")) {
                    var args = await message.content.split(" ").slice(1).join(" ")
                    if (!message.member.voice.channel) return await message.channel.send("You need to be in a VC to do that.");
                    if (!serverQueue) return await message.channel.send("There is nothing playing!");
                    if (!args) return await message.channel.send(`The Current Volume is **${serverQueue.volume}**`);
                    if (isNaN(args)) return await message.channel.send("Invalid volume, please enter a number");
                    serverQueue.volume = args;
                    await serverQueue.connection.dispatcher.setVolumeLogarithmic(args / 5);
                    await message.react('🔈');
                }
                if (isValidCommand(message, "np")) {
                    var args = await message.content.split(" ").slice(1).join(" ")
                    if (!message.member.voice.channel) return await message.channel.send("You need to be in a VC to do that.");
                    if (!serverQueue) return await message.channel.send("There is nothing playing!");
                    await message.channel.send(`Now Playing: **${serverQueue.songs[0].title}**`)
                }
                if (isValidCommand(message, "queue")) {
                    var args = await message.content.split(" ").slice(1).join(" ")
                    if (!message.member.voice.channel) return await message.channel.send("You need to be in a VC to do that.");
                    if (!serverQueue) return await message.channel.send("There is nothing playing!");
                    await message.channel.send(`**__Queue__**\n${serverQueue.songs.map(song => ` -${song.title}\n`).join("")}\nNow Playing: **${serverQueue.songs[0].title}**`, {split:false})
                }
                if (isValidCommand(message, "pause")) {
                    var args = await message.content.split(" ").slice(1).join(" ")
                    if (!message.member.voice.channel) return await message.channel.send("You need to be in a VC to do that.");
                    if (!serverQueue) return await message.channel.send("There is nothing playing!");
                    if (!serverQueue.playing) return await message.channel.send("Music is already paused!");
                    serverQueue.playing = false;
                    await serverQueue.connection.dispatcher.pause();
                    await message.react('⏯️')
                }
                if (isValidCommand(message, "resume")) {
                    var args = await message.content.split(" ").slice(1).join(" ")
                    if (!message.member.voice.channel) return await message.channel.send("You need to be in a VC to do that.");
                    if (!serverQueue) return await message.channel.send("There is nothing playing!");
                    if (serverQueue.playing) return await message.channel.send("Music is already playing!");
                    serverQueue.playing = true;
                    await serverQueue.connection.dispatcher.resume();
                    await message.react('⏯️')
                }
            }

            //Birthdays
            {
                //+bd-set dd/mm birthday logging
                if (isValidCommand(message, "bd-set")) {
                    var args = await message.content.split(" ").slice(1).join(" ");
                    var dd = await args.split("/").slice(0, 1);
                    var mm = await args.split("/").slice(1);
                    if (!/^\d{1,2}\/\d{1,2}$/.test(`${dd}/${mm}`)) return await message.channel.send("Your Birthday format appears to be incorrect! Please enter your birthdate in the format DD/MM. For example, if you were born on the 8th of September, your birthday would be 08/09");
                    var day = parseInt(dd, 10);
                    var month = parseInt(mm, 10);
                    if (month === 0 || month > 12) return await message.channel.send("You have entered an invalid birth month! Please ensure you enter the day in the format MM, for example: August would be 08");
                    var monthLength = [31, 29, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31];

                    if (day < 0 || day > monthLength[month - 1]) return await message.channel.send("You have entered an invalid birthdate! Please ensure you enter the day in the format DD, for example: the 8th would be 08");

                    if (!birthdaysData[message.author.id]) {
                        birthdaysData[message.author.id] = {
                            "birthdate": `${dd}/${mm}`,
                            "announce": "y"
                        };
                        await fs.writeFileSync("storage/birthdays.json", JSON.stringify(birthdaysData));
                    } else {
                        birthdaysData[message.author.id].birthdate = `${dd}/${mm}`;
                        await fs.writeFileSync("storage/birthdays.json", JSON.stringify(birthdaysData));
                    }
                    await message.channel.send(":white_check_mark: Your birthday has been recorded!");
                    birthdaysData = await JSON.parse(fs.readFileSync('storage/birthdays.json', 'utf8'));
                }
            }

            //Misc Commands
            {
                //+bored
                if (isValidCommand(message, "bored")) {
                    const {
                        activity,
                        type
                    } = await fetch('https://www.boredapi.com/api/activity').then(response => response.json());
                    await message.channel.send(`A ${type} activity you can do is ${activity}`);
                }
            }
        }
        //In case of fatal error
        catch (error) {
            await fs.appendFileSync("storage/logs.txt", `${Date.now}, ${error}`);
            await message.channel.send("Something went wrong that would usually cause me to break and im not sure what! Please Ask <@!577539199708823573> to check my log files!");
            await console.log(error);
        }
    }

    //Hub Server commands
    else if (message.guild.id === "787119026996248586") {
        try {
            //Ticketing
            if (isValidCommand(message, "ticket")) {
                let args = await message.content.toLowerCase().split(" ").slice(1);
                if (args[0] === "open") {
                    await tickets["ticketid"].value++;
                    await writedata();
                    args = await args.slice(1).join(" ");
                    await message.guild.channels.create(`Ticket ${tickets["ticketid"].value} ${args}`, {
                            parent: message.guild.channels.cache.find(chan => chan.name === "Tickets")
                        })
                        .then(async chan => {
                            await message.channel.send(`Ticket created in ${chan}`)
                                .then(async msg => {
                                    await message.delete();
                                    await msg.delete({
                                        timeout: 5000
                                    });

                                })
                        })
                        .catch(async error => {
                            await console.log(error);
                        });
                    await fs.appendFileSync(`/storage/ticket-${tickets["ticketid"].value}-${args.replace(" ", "-")}.txt`, `${args}\n`);
                }
                if (args[0] === "close") {
                    if (message.channel.name.startsWith("ticket")) {
                        await message.channel.send("Ticket closing, saving logs!");
                        await wait(700);
                        await message.channel.delete();
                        var logchannel = await message.guild.channels.cache.get("787303632722460702");
                        await logchannel.send({
                            files: [`storage/${message.channel.name}.txt`]
                        });
                    }
                }
            }

            //Ticket logging
            if (message.channel.name.startsWith("ticket") && message.channel.name != "ticket-logs") {
                await fs.appendFileSync(`storage/${message.channel.name}.txt`, `${message.author.username}#${message.author.discriminator} @ ${message.createdAt.substring(3, 25)}: ${message.content}\n\n`);
            }
        } catch (err) {
            message.channel.send("Something went wrong, please open a ticket and ask skye to look into it!");
            console.log(err);
        }
    }

});

//Logging
{
    client.on('guildBanAdd', async (guild, user) => {
        if (guild.id === "715651719698186262" || guild.id === "787119026996248586") return;
        await wait(10000).then(async () => {
            const AuditEntries = await guild.fetchAuditLogs({
                limit: 1,
                type: 'MEMBER_BAN_ADD'
            });
            const BanLog = await AuditEntries.entries.first();
            if (!BanLog) return await client.channels.cache.get("787636398218805248").send(embed);
            const {
                executor,
                target,
                reason
            } = BanLog;
            var embed = new MessageEmbed()
                .setTitle("Member Banned")
                .addField('Member', user)
                .addField('ID', user.id)
                .addField('Banned by', executor)
                .setColor('#FF0000')
                .addField('Reason', reason);
            if (target.id === user.id) {
                await client.channels.cache.get("787636398218805248").send(embed);
            } else {
                await client.channels.cache.get("787636398218805248").send(embed);
            }
        });
    });

    client.on('guildMemberRemove', async (member) => {
        if (await verification.count({
                where: {
                    UserId: `${member.id}`
                }
            }) === 0) return;
        else {
            await verification.destroy({
                where: {
                    UserId: `${member.id}`
                }
            });
        }
    });
}

//Login to the discord API
client.login(process.env.TOKEN);


//
//
//FUNCTIONS BELOW THIS POINT. CAN BE CALLED WHEN NEEDED
//
//



//remove symbols from user ID to get just numbers
async function normaliseID(id) {
    id = id.replace("<@!", '').replace('>', '').replace("<@", '').replace("<#", '').replace("<#!", '').trim();
    return id;
}

//Write userdata to file
async function writedata() {
    //write data to file - deployment
    await fs.writeFile('storage/userData.json', JSON.stringify(UserData), (err) => {
        if (err) console.log(err);
    });
    await fs.writeFile('storage/MemberInfracs.json', JSON.stringify(InfracData), (err) => {
        if (err) console.log(err);
    });
    await fs.writeFile('storage/tickets.json', JSON.stringify(tickets), (err) => {
        if (err) console.log(err);
    });
}


async function play(guild, song) {
    const serverQueue = queue.get(guild.id);

    if (!song) {
        serverQueue.voiceChannel.leave();
        queue.delete(guild.id);
        return;
    }

    const dispatcher = await serverQueue.connection.play(ytdl(song.url, {
            filter: "audioonly"
        }))
        .on('finish', async () => {
            serverQueue.songs.shift();
            play(guild, serverQueue.songs[0])
        });
    await dispatcher.setVolumeLogarithmic(serverQueue.volume / 5);
    serverQueue.textChannel.send(`Now Playing : **${song.title}**`);
}