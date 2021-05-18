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


    client.on('guildMemberAdd', async (member) =>{
        if(member.guild.id === "715651719698186262"){
            let userRolemain = await client.guilds.cache.get("715701127181631527").members.cache.get(user.id).roles;
            if (await userRolemain.cache.get("744154835938705478"))
            {
                await member.roles.add("816354719311986788");
            }
            else if (await userRolemain.cache.get("771395530294296598"))
            {
                await member.roles.add("781276269098041404");
            }
            else if (await userRolemain.cache.get("771151857187422249"))
            {
                await member.roles.add("781276292317315112");
            }
            else if (await userRolemain.cache.get("715712712117715005"))
            {
                await member.roles.add("781276251821965363");
            }
        }
    });


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





var tickets = JSON.parse(fs.readFileSync('storage/tickets.json', 'utf-8'));



else if (isValidCommand(message, "bratadd") && UserData[message.author.id].bpgiven === 1) {
    await message.channel.send("You are on cooldown! Please try again in a few hours (Note: Cooldown is 12 hours between point issues)")
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