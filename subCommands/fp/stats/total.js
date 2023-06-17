const BaseSubcommandExecutor = require("../../../utils/BaseSubCommandExecutor");
const { request } = require('undici');
const { AttachmentBuilder } = require('discord.js');
const Canvas = require('canvas')


const sqlite3 = require("sqlite3").verbose()
let sql
const data = new sqlite3.Database('data/points.db',sqlite3.OPEN_READWRITE,(err)=>{
    if (err) return console.error(err.message)
})

module.exports = class fpTotalSubCommand extends BaseSubcommandExecutor {
    constructor(baseCommand, group, name) {
        super(baseCommand, group, name)
    }

    run(client, interaction) {
        // interaction.reply({content: 'totals stats'})
        const targetID = interaction.options.get('user-option').value

        sql = 'SELECT points FROM pointTable WHERE senderID = ?'
        data.all(sql,[targetID], (err, sendrows)=> {
            if (err) return console.error(err.message);
            var grantedTotal = 0

            //counts total number of points selected user has given
            sendrows.forEach(function (row) {
                if (row) grantedTotal = grantedTotal + parseInt(row.points)
            })

            sql = 'SELECT points FROM pointTable WHERE recipientID = ?'
            data.all(sql,[targetID], (err, recrows)=> {
                if (err) return console.error(err.message);
                var acquiredTotal = 0

                //counts total number of pounts selected user has recieved
                recrows.forEach(function (row) {
                    if (row) acquiredTotal = acquiredTotal + parseInt(row.points)
                })
                generateCard(interaction,client, targetID,grantedTotal.toString(),acquiredTotal.toString())
            })
        })

        async function generateCard(interaction,client,userID,granted,acquired) {
            const user = await client.users.fetch(userID)
            const userName = user.username

            //canvas setup
            const canvas = Canvas.createCanvas(1050, 1043)
            const context = canvas.getContext('2d')

            //grabs and inserts the template
            const template = await Canvas.loadImage('data/templates/totalsTemplate.png')
            context.drawImage(template, 0, 0, canvas.width, canvas.height)

            //adds the users icon to the card
            const icon = await Canvas.loadImage(user.displayAvatarURL({ extension: 'png' }));
            context.drawImage(icon, 280, 35, 110, 110)

            //adds the users name to the card
            context.font  = applyText(canvas, userName, 510, 120)
            context.fillStyle = '#D0D3D6'
            context.textAlign = "left"
            context.BaseSubcommandExecutor = 'middle'
            context.fillText(userName,450, 125)

            //adds the text indicating the total number of points given out and recieved. 
            context.textAlign = "center"
            context.fillStyle = '#A8ABAE'
            context.font = applyText(canvas, granted, 585, 90)
            context.fillText(granted, 635, 546)
            context.font = applyText(canvas, acquired, 585, 90)
            context.fillText(acquired, 635, 794)

            //generates attachment and returns it
            const attachment = new AttachmentBuilder(canvas.toBuffer('image/png'), { name: `${userName}-Total-Card.png`})
            interaction.reply({ files: [attachment] })
        }

        const applyText = (canvas, insertText, width, height) => { //insertText is text being added, width is the max width for the text, height is the maximum height for the text
            const ctx = canvas.getContext('2d')
            let fontSize = height;
            do {
                ctx.font = `${fontSize -= 10}px Hypereality`;
            } while (ctx.measureText(insertText).width > width) // checks if the font size will fit the width of not it will reduce it by 10 px
            return ctx.font;
        }
    }
}