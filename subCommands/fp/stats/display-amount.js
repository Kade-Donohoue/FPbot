const BaseSubcommandExecutor = require("../../../utils/BaseSubCommandExecutor");

const sqlite3 = require("sqlite3").verbose()
let sql
const data = new sqlite3.Database('data/points.db',sqlite3.OPEN_READWRITE,(err)=>{
    if (err) return console.error(err.message)
})

module.exports = class fpDisplayAmountSubCommand extends BaseSubcommandExecutor {
    constructor(baseCommand, group, name) {
        super(baseCommand, group, name)
    }

    run(client, interaction) {
        const sendID = interaction.options.get('sender').value
        const destID = interaction.options.get('reviever').value

        sql = 'SELECT * FROM pointTable WHERE senderID = ? AND recipientID = ?'
        data.get(sql,[sendID, destID], (err, row)=> {
            if (err) return console.error(err.message);
            if(!row) {
                console.log("No Points")
                interaction.reply({content: 'That person has not recieved any FP from the sender. '})
            } else {
                console.log("has FP")
                interaction.reply({content: 'They have ' + row.points + " FP from them. "})
            }
        })
    }
}