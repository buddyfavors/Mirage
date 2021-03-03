try {
    //Requirements and libs imports
    require("dotenv").config();
    const {
        Client,
        MessageEmbed,
    } = require('discord.js');
    const client = new Client();
    const wait = require('util').promisify(setTimeout);
    const fs = require('fs');
    const schedule = require('node-schedule');

    //Database Import
    const db = require('./database/database');
    const verification = require('./models/VerificationModel');

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

        try{
            //initialise all database models.
            await verification.init(db)
            await verification.sync()
        }
        catch(err){
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
        {
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
                        todayMM = "01";
                        break;
                    case "Feb":
                        todayMM = "02";
                        break;
                    case "Mar":
                        todayMM = "03";
                        break;
                    case "Apr":
                        todayMM = "04";
                        break;
                    case "May":
                        todayMM = "05";
                        break;
                    case "Jun":
                        todayMM = "06";
                        break;
                    case "Jul":
                        todayMM = "07";
                        break;
                    case "Aug":
                        todayMM = "08";
                        break;
                    case "Sep":
                        todayMM = "09";
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
                    if (birthdaysData[member.replace("\"", "")].birthdate === `${todayDD}/${todayMM}`) {
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
        }

        //NHIE
        {
            let hour = [0, 12];

            for (let i = 0; i < hour.length; i++) {
                let rulenhie = new schedule.RecurrenceRule();
                rulenhie.dayOfWeek = [0, 1, 2, 3, 4, 5, 6];
                rulenhie.hour = hour[i];
                rulenhie.minute = 0;

                let j = await schedule.scheduleJob(rulenhie, async function () {
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
            let hour = 0;

            for (let i = 0; i < hour.length; i++) {
                let rulenhie = new schedule.RecurrenceRule();
                rulenhie.dayOfWeek = [0, 1, 2, 3, 4, 5, 6];
                rulenhie.hour = hour[i];
                rulenhie.minute = 0;

                let j = await schedule.scheduleJob(rulenhie, async function () {
                    var games = await JSON.parse(fs.readFileSync('storage/games.json', 'utf-8'));
                    var i = await Math.floor(Math.random() * games["QOTD"].questions.length - 1) + 1;
                    var qotd = games["QOTD"].questions[i];
                    var role = await client.guilds.cache.get("715701127181631527").roles.cache.get("811309537331642378");
                    var question = new MessageEmbed().setTitle("Question of The Day").setDescription(qotd);
                    await client.channels.cache.get("724777838619918459").send("<@&811309537331642378>");
                    await client.channels.cache.get("724777838619918459").send(question);
                });
            }
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

                    //Flash-n-dash
                    if (message.channel.id === "756354194818203688") {
                        await message.delete({
                                timeout: 60000
                            })
                            .catch(async error => {
                                await console.log("Error: Message Not available to delete!")
                            });
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
                    if (isValidCommand(message, "nhie") && message.channel.id === "715768048099000333") {
                        await setTimeout(async function () {
                            var games = await JSON.parse(fs.readFileSync('storage/games.json', 'utf-8'));
                            var i = await Math.floor(Math.random() * games["NHIE"].questions.length - 1) + 1;
                            var qotd = games["NHIE"].questions[i];
                            var question = new MessageEmbed().setTitle("Never Have I ever").setDescription(qotd);
                            await client.channels.cache.get("716828911727804487").send(question);
                        }, 10000);
                    }

                    //+qotd
                    if (isValidCommand(message, "qotd") && message.channel.id === "716828911727804487") {
                        await setTimeout(async function () {
                            var games = await JSON.parse(fs.readFileSync('storage/games.json', 'utf-8'));
                            var i = await Math.floor(Math.random() * games["QOTD"].questions.length - 1) + 1;
                            var qotd = games["QOTD"].questions[i];
                            var question = new MessageEmbed().setTitle("Question of the Day").setDescription(qotd);
                            await client.channels.cache.get("716828911727804487").send(question);
                        }, 10000);
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
                            if (args.toLowerCase() === "foot slut") {
                                if (UserData[message.author.id].credits >= 1000) {
                                    UserData[message.author.id].credits -= 1000;
                                    await message.guild.members.cache.get(message.author.id).roles.add(await message.guild.roles.cache.find(x => x.name === "Foot Slut"));
                                }
                            }
                        }
                    }
                }

                //Moderation
                if (await AuthorRoleCache.get("804129560840896562") || message.author.id === "577539199708823573") {
                    let args = message.content.split(' ').slice(1);

                    //View stats about the bot - +status
                    if (isValidCommand(message, "status")) {
                        await message.channel.send(`Uptime: ${(Math.floor(process.uptime())/60).toString()} Minutes\nMemory Usage: ${process.memoryUsage().toString()}`);
                    }

                    //Send Message to channel - +send <channel ID> <message>
                    if (isValidCommand(message, "send")) {
                        var channel = args[0];
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
                    if (isValidCommand(message, "note")) {
                        let member = await message.guild.members.cache.get(await normaliseID(args[0]));
                        let reason = await args.slice(1).join(" ");
                        if (!InfracData[member.id]) {
                            InfracData[member.id] = {
                                Notes: `${reason},${message.createdAt}/${message.createdAt}/${message.createdAt}`,
                                Warns: "",
                                SoftBans: "",
                                Kicks: ""
                            };
                        } else {
                            InfracData[member.id].Notes = InfracData[member.id].Notes + `,${reason}` + `,${message.createdAt}`;
                        }
                        await writedata();
                        message.channel.send("I have successfully added that to the log file!")
                    }

                    //View infractions of user - +infrac @user
                    if (isValidCommand(message, "infrac")) {
                        let id = args[0];
                        var member = message.guild.members.cache.get(await normaliseID(args[0]));
                        if (!InfracData[member.id]) {
                            await message.channel.send(`${member} has no infractions!`)
                        } else {
                            var embed = new MessageEmbed().setTitle(member.displayName);
                            let UserNotes = (InfracData[member.id].Notes).split(',');
                            let UserWarns = (InfracData[member.id].Warns).split(',');
                            let UserKicks = (InfracData[member.id].Kicks).split(',');
                            let UserSBans = (InfracData[member.id].SoftBans).split(',');
                            if (UserNotes.length > 0) {
                                for (var i = 0; i <= UserNotes.length - 1; i++) {
                                    let dateadded = new Date(UserNotes[i + 1]);
                                    let today = new Date(`${message.createdAt.getDate()}/${message.createdAt.getMonth()}/${message.createdAt.getFullYear()}`);
                                    var dayssince = today - dateadded / (1000 * 60 * 60 * 24);
                                    await embed.addField(`Note ${i}: Added ${dayssince}`, UserNotes[i]);
                                    i++
                                }
                            }
                            if (!UserWarns.length > 0) {
                                for (var i = 0; i <= UserWarns.length - 1; i++) {
                                    await embed.addField(`Warn ${i}:`, UserWarns[i]);
                                }
                            }
                            if (!UserKicks.length > 0) {
                                for (var i = 0; i <= UserKicks.length - 1; i++) {
                                    await embed.addField(`Kick ${i}:`, UserKicks[i]);
                                }
                            }
                            if (!UserSBans.length > 0) {
                                for (var i = 0; i <= UserSBans.length - 1; i++) {
                                    await embed.addField(`Soft-Ban ${i}:`, UserSBans[i]);
                                }
                            }
                            message.channel.send(embed);
                        }
                    }

                    //+remnote @user - non functional
                    if (isValidCommand(message, "remnote")) {
                        let member = message.guild.members.cache.get(await normaliseID(args[0]));
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
                        await message.channel.send("Also please note we do NOT need to see your Address, License number, name, etc.\nWe only require the ID type, expiry date, your picture and DOB Visible")
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
                if (message.channel.id === "71673214313010840636") {
                    const serverqueue = queue.get(message.guild.id);
                    try {
                        //+play [url]
                        if (isValidCommand(message, "play")) {
                            const vc = message.member.voice.channel;
                            //if the member isnt in the music chat, then tell them
                            if (!vc.id === await message.guild.channels.cache.get("716732041936502824").id) {
                                return await message.channel.send("You need to be in the music VC for that!");
                            }
                            const perms = vc.permissionsFor(message.client.user);
                            //if bot cannot connect due to lack of perms then exit
                            if (!perms.has('CONNECT')) {
                                return await message.channel.send("I cannot join the channel: Insufficient Perms");
                            }
                            //if bot cannot speak due to lack of perms then exit
                            if (!perms.has('SPEAK')) {
                                return await message.channel.send("I cannot speak in this channel: Insufficient Perms");
                            }
                            //get song details from YTDL lib
                            const songInfo = await (await ytdl.getInfo(message.content.substring(5).trim())).videoDetails;
                            //declare the song as an object with title and URL
                            const song = {
                                title: songInfo.title,
                                url: songInfo.video_url
                            }
                            //if serverqueue doesnt exist, then create the queue construct
                            if (!serverqueue) {
                                const queueConstruct = {
                                    textchannel: message.channel,
                                    voiceChannel: vc,
                                    connection: null,
                                    songs: [],
                                    volume: 5,
                                    playing: true
                                };
                                //set the guild queue to the queue construct
                                await queue.set(message.guild.id, queueConstruct);
                                //push the song to the queue
                                await queueConstruct.songs.push(song);
                                try {
                                    //join the VC
                                    var connection = await vc.join();
                                    //set the queue connection object to the connection var
                                    queueConstruct.connection = connection;
                                    //play that song!
                                    await play(message.guild, queueConstruct.songs[0]);
                                } catch (error) {
                                    await console.log(error);
                                    //delete the queue if there is an error
                                    await queue.delete(message.guild.id);
                                    await message.channel.send("Something went wrong with connecting to the VC")
                                }
                            }
                            //if serverqueue does exist
                            else {
                                //push the song to the queue
                                await serverqueue.songs.push(song);
                                //Inform the user the song has been added
                                return message.channel.send(`**${song.title}** has been added to queue`);
                            }
                        }

                        //+stop | Stop all music and destroy the queue
                        if (isValidCommand(message, "stop")) {
                            const vc = message.member.voice.channel;
                            if (!vc.id === message.guild.channels.cache.get("716732041936502824").id) {
                                return await message.channel.send("You need to be in the music chat to stop the music");
                            }
                            if (!serverqueue) {
                                return await message.channel.send("There is nothing playing right now");
                            }
                            serverqueue.songs = [];
                            await serverqueue.connection.dispatcher.end();
                            return;
                        }

                        //+Skip | Skips the current song
                        if (isValidCommand(message, "skip")) {
                            const vc = message.member.voice.channel;
                            if (!vc.id === message.guild.channels.cache.get("716732041936502824").id) {
                                return await message.channel.send("You need to be in the music chat for that!");
                            }
                            if (!serverqueue) {
                                return await message.channel.send("There is nothing playing right now!");
                            }
                            //skip the track
                            await message.channel.send("Song skipped!");
                            await serverqueue.connection.dispatcher.end();
                        }

                        //+vol [int] | sets the volume
                        if (isValidCommand(message, "vol") && message.content.substring(5).trim() <= 10) {
                            serverqueue.volume = message.content.substring(5).trim();
                            message.channel.send(`Volume set to: ${serverqueue.volume}`)
                            const dispatcher = await serverqueue.connection.setVolumeLogarithmic(await serverqueue.volume / 5)
                        }

                    } catch (error) {
                        await console.log(error);
                        await message.channel.send("Whoops! Something went wrong with what you just did! Try again or ask <@!577539199708823573> for help!")
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
    }

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

    //Member Add
    // client.on('guildMemberAdd', async function (member) {
    //     if (!UserData[member.id] && member.guild.id === "715701127181631527") {
    //         UserData[member.id] = {
    //             credits: 0,
    //             bratPoints: 0,
    //             bpgiven: 0
    //         }
    //     };
    // });

    // //Custom VC
    // client.on('voiceStateUpdate', async function (oldState, newState){
    //     if(oldState.member.user.bot) return;
    //     try{
    //         //When user joins the "Join here" VC
    //         if(newState.channel === newState.guild.channels.cache.find(channel => channel.name === "❀˜┋Join here")){
    //             await console.log("User Joined VC");
    //             var catID = newState.guild.channels.cache.find(cat => cat.name === "★:—:voice:—:☾").id;
    //             await newState.guild.channels.create(`❀˜┋${newState.member.user.username}'s VC`.toLowerCase(), {type:"voice",parent:catID})
    //             .then(async channel =>{
    //                 await channel.updateOverwrite(channel.guild.roles.everyone, {VIEW_CHANNEL:false});
    //                 await channel.updateOverwrite(channel.guild.roles.cache.find(role => role.name==="verified"), {VIEW_CHANNEL:true});
    //                 await newState.member.voice.setChannel(channel);
    //             });
    //             await newState.guild.channels.create(`❀˜┋${newState.member.user.username} VC Text`.toLowerCase(), {type:"Text",parent:catID,})
    //         }

    //         //When user leaves their own VC
    //         let channelname = oldState.guild.channels.cache.find(channel => channel.name === `❀˜┋${oldState.member.user.username}'s VC`.toLowerCase());
    //         if(oldState.channel === channelname && oldState.channel.members.size === 0){;
    //             await channelname.delete();
    //             var channel = oldState.guild.channels.cache.find(channel => channel.name === `❀˜┋${oldState.member.user.username.replace(/\W/g, '-').toLowerCase()}-vc-text`);
    //             await channel.delete();
    //         }
    //     }
    //     catch(err){
    //         console.log(err);
    //         oldState.guild.channels.cache.find(channel => channel.name === "logs").send("Something went wrong! Please ask Sky to consult my log files!");
    //     }


    // });

    //Login to the discord API
    client.login(process.env.TOKEN);


    ///
    ///
    ///FUNCTIONS BELOW THIS POINT. CAN BE CALLED WHEN NEEDED
    ///
    ///

    //remove symbols from user ID to get just numbers
    async function normaliseID(id) {
        id = id.replace("<@!", '').replace('>', '').replace("<@", '').trim();
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

    //music bot 
    async function play(guild, song) {
        const serverqueue = await queue.get(guild.id);
        //If there are no songs in the queue then leave the channel and delete the queue
        if (!song) {
            //leave the VC
            await serverqueue.voiceChannel.leave();
            //delete the queue
            await queue.delete(guild.id);
            //end the code (efficient)
            return;
        }
        //Now playing message
        await serverqueue.textchannel.send(`Now Playing: **${song.title}**`);
        //start playing the song
        const dispatcher = await serverqueue.connection.play(ytdl(song.url))
            //when the song has finished
            .on('finish', async () => {
                //remove the song and then play the next one
                await serverqueue.songs.shift();
                await play(guild, serverqueue.songs[0]);
            })
            //upon an error that would normally cause a crash
            .on('error', async (error) => {
                //if anything unexpected happens, log it and let the user know
                await console.log(error);
                await serverqueue.textchannel.send("Whoops! Something went wrong whilst trying to play this song! Please ask @<!577539199708823573> for assistance!");
                await serverqueue.textchannel.send("Leaving VC...");
                //leave the VC
                await serverqueue.voiceChannel.leave();
                //delete the queue
                await queue.delete(guild.id);
                //end the code (efficient)
                return;

            });
        //set the volume to an appropriate level
        await dispatcher.setVolumeLogarithmic(await serverqueue.volume / 5);
    }
} catch (err) {
    console.log(err);
}