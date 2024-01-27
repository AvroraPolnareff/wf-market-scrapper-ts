import {Command} from "../Command";
import {EmbedBuilder, Message} from "discord.js";

import {RivenHunter} from "../../features/RivenHunter";


export class List implements Command {
    public name = 'list'
    public aliases = ['urls']
    public description = "This command will display the list of active links used by the **Riven Hunter** in the channel it was posted in."
    public prefix = "rivenhunt"
    public args = "clear"

    constructor(
    ) {}

    async run(msg: Message, args?: string[]): Promise<void> {
        const rivenHunter = new RivenHunter(msg.author.id)
        if (args[0] === "clear") {
            await rivenHunter.removeAll(msg.channel.id, msg.guild?.id)
            await msg.reply('List successfully deleted')
            return
        }
        let embed: EmbedBuilder
        if (msg.guild) {
            embed = await rivenHunter.list(msg.channel.id, msg.guild.id)
        } else {
            embed = await rivenHunter.list(msg.channel.id)
        }
        await msg.reply({embeds: [embed]})
    }
}
