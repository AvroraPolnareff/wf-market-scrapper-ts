import {Command} from "./Command";
import {Message} from "discord.js";
import {createHmac} from "crypto";
import {getRepository} from "typeorm";
import {TemporaryLink} from "../db/entity/TemporaryLink";


export class RH implements Command {
  description = "Link to Riven Hunter new query config"
  name = "rh"

  async run(msg: Message, args?: string[]): Promise<void> {
    const secret = createHmac('sha256', "lalochka")
      .update(Date.now().toString())
      .digest('hex')
    const repository = getRepository(TemporaryLink)
    try {
      const temporaryLink = repository.create({
        secret: secret,
        userId: msg.author.id,
        guildId: msg.guild? msg.guild.id : '',
        channelId: msg.channel.id,
        expirationTime: Date.now() + 5 * 60 * 1000
      })
      await repository.save(temporaryLink)
      msg.reply()
    } catch (e) {
      console.log(e)
      await msg.reply("Something went wrong...")
    }
  }

}