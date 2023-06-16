const {REST} = require('@discordjs/rest')
const {Client, GatewayIntentBits, Routes, Collection} = require('discord.js')
const {registerCommands, registerSubCommands} = require('./utils/registry')

const sqlite3 = require("sqlite3").verbose()
let sql
const data = new sqlite3.Database('data/points.db',sqlite3.OPEN_READWRITE,(err)=>{
    if (err) return console.error(err.message);
})

sql = `CREATE TABLE IF NOT EXISTS pointTable (senderID,recipientID,points)`
data.run(sql)

sql = `CREATE TABLE IF NOT EXISTS logTable (senderID,recipientID,action,time)`
data.run(sql)

const token = require('../token.json')
const fs = require('fs')

const client = new Client({intents: [GatewayIntentBits.Guilds, GatewayIntentBits.GuildMessages, GatewayIntentBits.MessageContent]})
const rest = new REST({ version: '10' }).setToken(token.code)



client.on('ready', () => {
    console.log(client.user.tag + ' Has logged in')
})

client.on('interactionCreate', (interaction) => {
    if (interaction.isChatInputCommand()) {
        const {commandName} = interaction
        const cmd = client.slashCommands.get(commandName)

        const subcommandGroup = interaction.options.getSubcommandGroup(false)
        const subcommandName = interaction.options.getSubcommand(false)

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

        if (cmd) {
            cmd.run(client, interaction)
        } else interaction.reply({ content: "An error occured. This command does nothing"})
    }
})

//Creates slash Commands
async function main() {
    try {
        client.slashCommands = new Collection()
        client.slashSubcommands = new Collection()
        await registerCommands(client, '../commands')
        await registerSubCommands(client, '../subCommands')
        const slashCommandsJson = client.slashCommands.map((cmd) => cmd.getCommandJson())
        const slashSubCommandsJson = client.slashSubcommands.map((cmd) => cmd.getCommandJson())
        console.log('Refreshing slash Commands')
        await rest.put(Routes.applicationGuildCommands(token.appID, token.guildID), {
            body: [...slashCommandsJson, ...slashSubCommandsJson],
        })
        const registeredCommands = await rest.get(
            Routes.applicationGuildCommands(token.appID, token.guildID)
        )
        console.log('Slash Commands Refreshed')
        // console.log(registeredCommands)
        await client.login(token.code)
    }catch (err) {console.log(err)}
}
main()