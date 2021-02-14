# Mirage

Mirage is a custom made discord bot for Night Visions 18+. She currently has 53 Commands with plenty of room for expansion. She is coded in NodeJS using Discord.JS 12.5.1

# Moderation

## +status

Shows the current status of the bot including Uptime and Memory Usage

## +send \&lt;Channel ID\&gt; \&lt;Message\&gt;

Sends a message to the specified channel

## +viewmc

Views the current message count of the bot – used for server currency

## +resetmc

Resets the current message count in the event it doesn&#39;t auto reset – used for server currency

## +note \&lt;@user or User ID\&gt; \&lt;reason\&gt;

Adds a note about the user with the reason specified

## +infrac \&lt;@user or User ID\&gt;

Views all infractions including warns, kicks and notes for the user specified

## +remnote \&lt;@user or User ID\&gt; \&lt;Infrac ID\&gt;

Removes a specific infraction from a user – NON FUNCTIONAL

## +whois \&lt;@user or User ID\&gt;

Displays information about a specified user such as account age and join server age – NON FUNCTIONAL

## +cvc \&lt;@user or User ID\&gt;

Check the verification status of members from sister servers (always ask for a screenshot as well, just in case they left

## -verify \&lt;@user or User ID\&gt;

Runs at the YAGPDB Verification command. Logs the verification to the hub and database

## +init

For first time use only. Adds all users to the message count document and sends startup message.

## +resetbal \&lt;@user or User ID\&gt;

Resets the specified users balance to 0

## +givecredits \&lt;@user or User ID\&gt; \&lt;credits\&gt;

Adds the specified amount of credits to the user mentioned

## +announce \&lt;announcement\&gt;

Sends the specified message to the announcements channel as the server

## +exit

Exits the bots code, used for safely restarting – DEV ONLY

## +verreq

Send a message requesting the verification details from the user

# Birthdays

## +bd-set \&lt;DD/MM\&gt;

Sets a user&#39;s birthday for announcements if the format is correct

## Birthday Announcements

Every day at 8am GMT mirage will check for birthdays that are on that specified day and announce them!

# Music – Non Functional

## +play [url]

Plays the specified YouTube song or adds it to the server queue. Only reacts if user is in the music VC

## +stop

Stops all the music and leaves the VC

## +skip

Skips the Current Song and moves to the next one or stops music if no more songs

## +vol [int]

Sets the bots volume in VC

# Server Currency

## +buy \&lt;role name\&gt;

If the user has enough credits, deducts them and adds the role to the user

## Message Credits

Not triggered by a command, for every message the user says, they gain one credit

## +give \&lt;@user\&gt; \&lt;credits\&gt;

If the user has the amount of credits, it transfers them to the mentioned user

## +collect

If the message count matches the predefined random bonus and a user enters this command, they will receive 30 credits!

## Random Bonus

Every so often, a random number of messages will trigger a random bonus where one user has 15 seconds to claim 30 credits

## +bal

Displays the message authors balance

# Games

## +slots

For 10 credits, the user can spin the slot reels and test their &quot;luck&quot;

## Never Have I Ever

Every 12 hours, a random Never Have I Ever question will be sent to the specified channel

## Questions Of the Day

Every 12 hours, a random question will be sent to the specified channel

# Brat Commands

## +bratadd \&lt;@user or user ID\&gt;

Allows Doms and switches to give Subs and Switches a &quot;brat point&quot; which after every 5 will give out a punishment for them

## +bp

Display the authors current brat points.

# Memes

## 2+2

Mirage Can teach you maths! Any message with 2+2 in it will teach you basic maths!

# Emotes

## +hug \&lt;@user\&gt;

Sends an emote that Hugs the mentioned user

## +kiss \&lt;@user\&gt;

Sends an emote that kisses the mentioned user

## +slap \&lt;@user\&gt;

Sends an emote that Slaps the mentioned user

## +bite \&lt;@user\&gt;

Sends an emote that Bites the mentioned user

## +cuddle \&lt;@user\&gt;

Sends an emote that Cuddles the mentioned user

## +pat \&lt;@user\&gt;

Sends an emote that pats the mentioned user

## +poke \&lt;@user\&gt;

Sends an emote that Pokes the mentioned user

## +lick \&lt;@user\&gt;

Sends an emote that Licks the mentioned user

## +suck \&lt;@user\&gt;

Sends an emote that Sucks the mentioned user

## +spank \&lt;@user\&gt;

Sends an emote that Spanks the mentioned user

## +fuck \&lt;@user\&gt;

Sends an emote that Fucks the mentioned user

## +anal \&lt;@user\&gt;

Sends an emote that Fucks the mentioned user in the ass

# Utilities

## +help

Displays a help message (Needs to be updated

## +creds

Displays a list of credentials of those who helped make the server and bot possible

## Confessions

Allows users to Confess and have it anonymised

## Flash-n-Dash

Allows users to post a nude to the specified channel and have it autodelete after 60s

## Suggestions

Adds reactions to suggestions and sends it to the writeup channel in staff server

## +donate

Lists the developer&#39;s donation links

## Anon Vents

Allows users to anonymously vent by sending a DM that starts with the word &quot;Vent&quot; (vents are logged)