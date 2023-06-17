const {REST} = require('@discordjs/rest')
const {Client, GatewayIntentBits, Routes, Collection} = require('discord.js')
const {registerCommands, registerSubCommands} = require('./utils/registry')

//SQL setup
const sqlite3 = require("sqlite3").verbose()
let sql
const data = new sqlite3.Database('data/points.db',sqlite3.OPEN_READWRITE,(err)=>{
    if (err) return console.error(err.message);
})

//Create required tables 
sql = `CREATE TABLE IF NOT EXISTS pointTable (senderID,recipientID,points)`
data.run(sql)
sql = `CREATE TABLE IF NOT EXISTS logTable (senderID,recipientID,action,time)`
data.run(sql)

const token = require('../token.json')
const fs = require('fs')

const client = new Client({intents: [GatewayIntentBits.Guilds, GatewayIntentBits.GuildMessages, GatewayIntentBits.MessageContent]})
const rest = new REST({ version: '10' }).setToken(token.code)


//When bot logs in print it in console
client.on('ready', () => {
    console.log(client.user.tag + ' Has logged in')
})

//When command is ran run the coresponding command file
client.on('interactionCreate', (interaction) => {
    if (interaction.isChatInputCommand()) {
        const {commandName} = interaction
        const cmd = client.slashCommands.get(commandName)

        const subcommandGroup = interaction.options.getSubcommandGroup(false)
        const subcommandName = interaction.options.getSubcommand(false)

        //Checks if command is a subcommand and if its in a group and calls appropriate file. 
        if (subcommandName) {
            if (subcommandGroup) {
                const subcommandInstance = client.slashSubcommands.get(commandName)
                subcommandInstance.groupCommands.get(subcommandGroup).get(subcommandName).run(client, interaction)
            } else {
                const subcommandInstance = client.slashSubcommands.get(commandName)
                subcommandInstance.groupCommands.get(subcommandName).run(client, interaction)
            }
            return
        }

        //checks if its a normal command then runs appropriate file or sends a error back to user
        if (cmd) {
            cmd.run(client, interaction)
        } else interaction.reply({ content: "An error occured. This command does nothing"})
    }
})

//Creates slash Commands
async function main() {
    try {
        //gets commands and sub commands 
        client.slashCommands = new Collection()
        client.slashSubcommands = new Collection()
        await registerCommands(client, '../commands')
        await registerSubCommands(client, '../subCommands')
        const slashCommandsJson = client.slashCommands.map((cmd) => cmd.getCommandJson())
        const slashSubCommandsJson = client.slashSubcommands.map((cmd) => cmd.getCommandJson())

        console.log('Refreshing slash Commands')

        //sends commands to discord
        await rest.put(Routes.applicationGuildCommands(token.appID, token.guildID), {
            body: [...slashCommandsJson, ...slashSubCommandsJson],
        })

        //Gets registered Commands
        const registeredCommands = await rest.get(
            Routes.applicationGuildCommands(token.appID, token.guildID)
        )
        console.log('Slash Commands Refreshed')

        //Logins to discord
        await client.login(token.code)
    }catch (err) {console.log(err)}
}
main()