const BaseSubcommandExecutor = require("../../utils/BaseSubCommandExecutor");

const sqlite3 = require("sqlite3").verbose()
let sql
const data = new sqlite3.Database('data/points.db',sqlite3.OPEN_READWRITE,(err)=>{
    if (err) return console.error(err.message)
})

module.exports = class fpSetSubCommand extends BaseSubcommandExecutor {
    constructor(baseCommand, group) {
        super(baseCommand, group, 'set')
    }

    run(client, interaction) {
        const authID = interaction.member.id
        const destID = interaction.options.get('user-option').value
        const pointValue = parseInt(interaction.options.get('set-point-amount').value)
        const date = Math.floor((new Date(Date.now()))/1000)

        if (authID == destID) return interaction.reply({content: 'You cant give yourself FP!'})

        sql = 'SELECT * FROM pointTable WHERE senderID = ? AND recipientID = ?'
        data.get(sql,[authID, destID], (err, row)=> {
            if (err) return console.error(err.message);
            console.log("log")
            sql = 'INSERT INTO logTable (senderID,recipientID,action,time) VALUES(?,?,?,?)'
            data.run(sql,[authID,destID,"set " + pointValue + " FP",date],(err)=>{
                if (err) return console.error(err.message)})
            if(!row) {
                console.log("New entry")
                sql = 'INSERT INTO pointTable (senderID,recipientID,points) VALUES(?,?,?)'
                data.run(sql, [authID,destID,pointValue],(err)=>{
                    if (err) return console.error(err.message)})
                interaction.reply({content: '<@' + authID + '> has set ' + pointValue + ' Point(s) to <@' + destID + '>. '})
            } else {
                console.log("updating entry")
                sql = 'UPDATE pointTable SET points = ? WHERE senderID = ? AND recipientID = ?'
                data.run(sql,[pointValue,authID,destID],(err)=>{
                    if (err) return console.error(err.message)})
                interaction.reply({content: '<@' + authID + '> has set ' + pointValue + ' Point(s) to <@' + destID + '>. '})
            }
            
        })
    }
}