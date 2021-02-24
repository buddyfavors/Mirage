# Moderation

## +status

Shows the current status of the bot including Uptime and Memory Usage

## +send \<Channel ID\> \<Message\>

Sends a message to the specified channel

## +viewmc

Views the current message count of the bot – used for server currency

## +resetmc

Resets the current message count in the event it doesn&#39;t auto reset – used for server currency

## +note \<@user or User ID\> \<reason\>

Adds a note about the user with the reason specified

## +infrac \<@user or User ID\>

Views all infractions including warns, kicks and notes for the user specified

## +remnote \<@user or User ID\> \<Infrac ID\>

Removes a specific infraction from a user – NON FUNCTIONAL

## +whois \<@user or User ID\>

Displays information about a specified user such as account age and join server age – NON FUNCTIONAL

## +cvc \<@user or User ID\>

Check the verification status of members from sister servers (always ask for a screenshot as well, just in case they left

## -verify \<@user or User ID\>

Runs at the YAGPDB Verification command. Logs the verification to the hub and database

## +init

For first time use only. Adds all users to the message count document and sends startup message.

## +resetbal \<@user or User ID\>

Resets the specified users balance to 0

## +givecredits \<@user or User ID\> \<credits\>

Adds the specified amount of credits to the user mentioned

## +announce \<announcement\>

Sends the specified message to the announcements channel as the server

## +exit

Exits the bots code, used for safely restarting – DEV ONLY

## +verreq

Send a message requesting the verification details from the user

## +setstatus <presence> <activity> <name>

Sets a custom status (will be reset to default every 24 hours)
For info on different parameters, (click here)[https://skyethevixen.github.io/Mirage/Moderation/Statuses "Custom Status Help"]