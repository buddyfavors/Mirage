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