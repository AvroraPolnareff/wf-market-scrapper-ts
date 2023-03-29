import {Command} from "../Command";
import {Message} from "discord.js";
import {RivenHunter} from "../../features/RivenHunter";
import PQueue from "p-queue";


export class Remove implements Command {
    public name = 'remove'
    public aliases = ['delete', 'del', "d"]
    public description = "This command will remove the chosen link from the **Riven Hunter** list assigned to this channel."
    public prefix = "rivenhunt"
    public args = "index"

    constructor(
    ) {}


    async run(msg: Message, args?: string[]): Promise<void> {
        const index = parseInt(args[0]) - 1
        const rivenHunter = new RivenHunter(msg.author.id)
        try {
            await rivenHunter.remove(index, msg.channel.id, msg.guild?.id)
        } catch {
            await msg.reply("Error while removing url.")
        }


        await msg.reply('URL successfully deleted')
    }
}
