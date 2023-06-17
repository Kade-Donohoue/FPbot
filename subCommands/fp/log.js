const BaseSubcommandExecutor = require("../../utils/BaseSubCommandExecutor");

const sqlite3 = require("sqlite3").verbose()
let sql
const data = new sqlite3.Database('data/points.db',sqlite3.OPEN_READWRITE,(err)=>{
    if (err) return console.error(err.message)
})

module.exports = class fpLogSubCommand extends BaseSubcommandExecutor {
    constructor(baseCommand, group) {
        super(baseCommand, group, 'log')
    }

    run(client, interaction) {
        sql = 'SELECT * FROM logTable'
        interaction.reply({content: 'Please wait while the data is retrieved!'})
        data.all(sql,[], (err, rows)=> {
            if (err) return console.error(err.message);
            var log = []

            //Converts data from database over to human readable text and adds it to log array
            rows.forEach(function (row) {
                if(!row) {
                    interaction.reply({content: 'That person has not recieved any FP from the sender. '})
                } else {
                    log.push("<@" + row.senderID + "> has " + row.action + " to <@" + row.recipientID + "> on <t:" + row.time + ":R>.")
                }
            })
            
            //Split log array into strings of a max length of 1990 characters and sends it so discords max character limit is not exceded. 
            var logString = ''
            log.forEach(function (item) {
                if (logString.length + item.length <= 1990) {
                    logString = logString + item + '\n'
                } else {
                    interaction.channel.send({content: logString})
                    logString = item + '\n'
                }
                if (item == log[log.length - 1]) {
                    interaction.channel.send({content: logString})
                }
            })
            
            
        })
        
    }
}