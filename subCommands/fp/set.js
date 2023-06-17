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
        const date = Math.floor((new Date(Date.now()))/1000)  //gets date in Unix Epoch (seconds since 1970 jan 1st)

        if (authID == destID) return interaction.reply({content: 'You cant give yourself FP!'})

        sql = 'SELECT * FROM pointTable WHERE senderID = ? AND recipientID = ?'
        data.get(sql,[authID, destID], (err, row)=> {
            if (err) return console.error(err.message);

            //adds log entry to logTable recording action
            sql = 'INSERT INTO logTable (senderID,recipientID,action,time) VALUES(?,?,?,?)'
            data.run(sql,[authID,destID,"set " + pointValue + " FP",date],(err)=>{
                if (err) return console.error(err.message)})

            //checks if sneder has given reciever points before and if not creates new entry and sets points otherwise it updates old entry setting points
            if(!row) {
                sql = 'INSERT INTO pointTable (senderID,recipientID,points) VALUES(?,?,?)'
                data.run(sql, [authID,destID,pointValue],(err)=>{
                    if (err) return console.error(err.message)})
                interaction.reply({content: '<@' + authID + '> has set ' + pointValue + ' Point(s) to <@' + destID + '>. '})
            } else {
                sql = 'UPDATE pointTable SET points = ? WHERE senderID = ? AND recipientID = ?'
                data.run(sql,[pointValue,authID,destID],(err)=>{
                    if (err) return console.error(err.message)})
                interaction.reply({content: '<@' + authID + '> has set ' + pointValue + ' Point(s) to <@' + destID + '>. '})
            }
            
        })
    }
}