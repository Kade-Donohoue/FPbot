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
        // var log = []
        sql = 'SELECT * FROM logTable'
        interaction.reply({content: 'Please wait while the data is retrieved!'})
        data.all(sql,[], (err, rows)=> {
            if (err) return console.error(err.message);
            var log = []
            rows.forEach(function (row) {
                if(!row) {
                    console.log("no log")
                    interaction.reply({content: 'That person has not recieved any FP from the sender. '})
                } else {
                    console.log("has log")
                    // console.log(row)
                    log.push("<@" + row.senderID + "> has " + row.action + " to <@" + row.recipientID + "> on <t:" + row.time + ":R>.")
                    // interaction.channel.send("<@" + row.senderID + "> has " + row.action + " to <@" + row.recipientID + "> on <t:" + row.time + ":R>.")
                    // console.log(log)
                }
            })
            
            var logString = ''
            log.forEach(function (item) {
                if (logString.length + item.length <= 1990) {
                    logString = logString + item + '\n'
                } else {
                    console.log('CLEAR')
                    interaction.channel.send({content: logString})
                    logString = item + '\n'
                }
                console.log(logString)
                if (item == log[log.length - 1]) {
                    console.log("END")
                    console.log(logString)
                    interaction.channel.send({content: logString})
                }
            })
            
            
        })
        
    }
}