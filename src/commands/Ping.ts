import { EmbedBuilder } from "discord.js";
import {Command} from "./Command";


export const Ping: Command = {
    name: 'ping',
    aliases: ['ping!'],
    description: "This command will let you know if the bot is listening to this channel.",
    run: async (msg, args) => {
        const embed = new EmbedBuilder()
        embed.addFields({name: "HAHA", value: "PONG!!!"})
        await msg.reply({embeds: [embed]})
        const filter = m => m.content.includes("ping")
        const channel = msg.channel
        try{
            const awaitedMessage =  await channel.awaitMessages({filter, max: 1})
            if (awaitedMessage.first().content === "ping") {
                await msg.reply('POOOOOONG!!!')
            } else {
                await msg.reply("I won!!!")
            }
        } catch (e) {
            await msg.reply("I won!!!")
        }

    }
}
