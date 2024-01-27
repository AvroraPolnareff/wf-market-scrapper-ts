import {Command} from "../Command";
import {MarketUrl} from "../../db/entity/MarketUrl";
import {RivenHunter} from "../../features/RivenHunter";
import {Message} from "discord.js";
import {makeEmbed} from "../../functions/embed";
import { URLSearchParams } from "url";


export class Add implements Command {

  constructor() {}

  public name = 'add'
  public description = `
  This command will add the given link to the **Riven Hunter** list. Once there is a change, it will post a message containing an update. \n
  ***negativegeneral**: -zoom, +recoil, -imp, -punc, -slash, -pt*
  ***negativemelee**: -slide, -finisher, -imp, -punc, -slash, -pt*
  `
  public prefix = "rivenhunt"
  public args = ["url", "negativegeneral", "negativemelee"]

  negatives = {
    negativemelee: [
      "critical_chance_on_slide_attack",
      "finisher_damage",
      "impact_damage",
      "puncture_damage",
      "slash_damage",
      "punch_through",
    ],
    negativegeneral: [
      "zoom",
      "recoil",
      "impact_damage",
      "puncture_damage",
      "slash_damage",
      "punch_through",
    ],
    default: []
  }

  createUrlsWithParamValues(url: string, paramName: string, paramValues: string[]): string[] {
    if (!paramValues.length) return [url]
    const params = new URLSearchParams(url.split('?')[1] || "");
    const urlWithoutParams = url.split('?')[0];
    const urls = paramValues.map((paramValue) => {
      params.set(paramName, paramValue);
      return `${urlWithoutParams}?${params.toString()}`;
    });
    return urls;
  }

  generateLimitMessages(link: string): string[] {
    const params = new URLSearchParams(link.split("?")[1]);
    const positiveStats = params.get("positive_stats")?.replaceAll(',', ', ') || "";
    const negativeStats = params.get("negative_stats")?.replaceAll(',', ', ') || "";
  
    return [
`Enter platinum limit for:
${positiveStats} / ${negativeStats}
`,
`Success! Platinum limit of ${positiveStats} / ${negativeStats} was set to `];
  }

  async run(msg: Message, args: string[]): Promise<void> {
    const [url, negative = "default"] = args
    if (!url) {
      await msg.reply("Enter the url argument.")
      return
    }

    const negatives = this.negatives[negative]

    if (!negatives) {
      await msg.reply("Wrong negatives argument.")
      return
    }
    const urls = this.createUrlsWithParamValues(url, "negative_stats", negatives)

    const rivenHunter = new RivenHunter(msg.author.id)
    const isValidPlatinumLimit = (limit: number) => limit >= 0 && limit <= 1147483647
    
    for (const newUrl of urls) {
      let platinumLimit : number = -1
      const [question, success] = this.generateLimitMessages(newUrl)

      await msg.reply(question)
      while (!isValidPlatinumLimit(platinumLimit)) {
        const platinumLimitRespond = await msg.channel.awaitMessages({filter: m => !!parseInt(m.content), max: 1})
        platinumLimit = parseInt(platinumLimitRespond.first().content.trim())
        if (!isValidPlatinumLimit(platinumLimit)) await msg.reply("Enter valid limit!")
      }
      let urlEntity: MarketUrl
      urlEntity = await rivenHunter.add(newUrl, platinumLimit, msg.channel.id, msg.guild?.id)
      await msg.reply(success + platinumLimit)
      await rivenHunter.startHunting(urlEntity, msg.client,async (rivenMods, channel) => {
        const embeds = rivenMods.map(mod => makeEmbed(mod.auction, mod.bids))
        for (const embed of embeds) {
          await channel.send({embeds: [embed]})
        }
    })
    }
  }
}
