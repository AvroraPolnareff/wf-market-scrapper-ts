import {Command} from "../Command";
import {EmbedBuilder, Message} from "discord.js";
import {Logger} from "../../utility/Logger";
import {UserTracker} from "../../features/UserTracker";


export class Add implements Command{
    args: string = "url";
    description: string = "This command will add the given link to the **User Tracker** list attached to the channel it was posted in.";
    name: string = "add";
    prefix: string = "usertrack";

    public constructor(
        private logger: Logger
    ) {
    }

    async run(msg: Message, args?: string[]): Promise<void> {
        try {
            const userTracker = new UserTracker(msg.author.id, msg.client)
            const prey = await userTracker.add(args[0], msg.channel.id, msg.guild?.id ?? "")
            await msg.reply(`**${msg.author.username}** has started tracking **${prey.nickname}**. The online status updates will be posted below.`)
            await userTracker.startTracking(prey, async (profile, channel) => {
                if (profile.status === "offline") {
                    await channel.send(`<@${prey.userId}>, ${prey.nickname} just went **OFFLINE** on Warframe Market.`)
                } else if (profile.status === "online") {
                    await channel.send(`<@${prey.userId}>, ${prey.nickname} is currently **ONLINE** on Warframe Market!`)
                } else {
                    await channel.send(`<@${prey.userId}>, ${prey.nickname} is currently **ONLINE IN GAME** on Warframe Market!`)
                }
            })
        } catch (e) {
            this.logger.error(e)
            let embed = new EmbedBuilder()
            embed.addFields({name: "Error...", value: e.message})
            await msg.reply({embeds: [embed]})
        }
    }
}
