const { SlashCommandBuilder } = require("discord.js");
const BaseSlashSubCommand = require("../../utils/BaseSlashSubCommand");

module.exports = class FPSubCommand extends BaseSlashSubCommand {
    constructor() {
        super('fp', [
            {
                name:'stats',
                subcommands: ['total','display-amount']
            },
        ], ['add','remove','log','set'])
    }

    getCommandJson() {
        return new SlashCommandBuilder()
            .setName('fp')
            .setDescription('Friend Point Commands')
            .addSubcommand((subcommand) => subcommand
                .setName("add")
                .setDescription('add friend points to user')
                .addUserOption((option) => option
                    .setName('user-option')
                    .setDescription('Select user that you want to add friend points to.')
                    .setRequired(true)
                )
                .addIntegerOption((option) => option
                    .setName('added-point-amount')
                    .setDescription("Amount of points you want to give to selected user.")
                    .setRequired(true)
                )
            )
            .addSubcommand((subcommand) => subcommand
                .setName("remove")
                .setDescription('removes friend points to user')
                .addUserOption((option) => option
                    .setName('user-option')
                    .setDescription('Select user that you want to take friend points from.')
                    .setRequired(true)
                )
                .addIntegerOption((option) => option
                    .setName('removed-point-amount')
                    .setDescription("Amount of points you want to take from the selected user.")
                    .setRequired(true)
                )
            )
            .addSubcommand((subcommand) => subcommand
                .setName("set")
                .setDescription('set friend points to user')
                .addUserOption((option) => option
                    .setName('user-option')
                    .setDescription('Select user that you want to set friend points.')
                    .setRequired(true)
                )
                .addIntegerOption((option) => option
                    .setName('set-point-amount')
                    .setDescription("Amount of points you want to set for the selected user.")
                    .setRequired(true)
                )
            )
            .addSubcommandGroup((group) => group
                .setName('stats')
                .setDescription('Get FP stats')
                .addSubcommand((subcommand) => subcommand
                    .setName('total')
                    .setDescription('List total aquired FP and FP you have granted')
                    .addUserOption((option) => option
                        .setName('user-option')
                        .setDescription("Who's total card do you want to see?")
                        .setRequired(true)
                    )
                )
                .addSubcommand((subcommand) => subcommand
                    .setName("display-amount")
                    .setDescription('Show how many FP someone has')
                    .addUserOption((option) => option
                        .setName('sender')
                        .setDescription('Select User that gave you the Friend Points.')
                        .setRequired(true)
                    )
                    .addUserOption((option) => option
                        .setName('reviever')
                        .setDescription('Select User that recieved the Friend Points.')
                        .setRequired(true)
                    )
                )
            )   
            // .addSubcommand((subcommand) => subcommand
            //     .setName("display-amount")
            //     .setDescription('Show how many FP someone has')
            //     .addUserOption((option) => option
            //         .setName('sender')
            //         .setDescription('Select User that gave you the Friend Points.')
            //         .setRequired(true)
            //     )
            //     .addUserOption((option) => option
            //         .setName('reviever')
            //         .setDescription('Select User that recieved the Friend Points.')
            //         .setRequired(true)
            //     )
            // )
            .addSubcommand((subcommand) => subcommand
                .setName("log")
                .setDescription('Show log FP log')
            )
            .toJSON()
    }
}