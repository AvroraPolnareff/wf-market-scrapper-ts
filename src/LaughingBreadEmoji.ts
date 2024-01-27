import {BaseClient, Client, ClientOptions, Message} from "discord.js";
import {Logger} from "./utility/Logger";
import {CommandDispatcher} from "./commands/CommandDispatcher";
import {BreadUser as UserEntity} from "./db/entity/BreadUser";
import {MarketUrl} from "./db/entity/MarketUrl";
import PQueue from "p-queue";
import {decorate, inject, injectable} from "inversify";
import TYPES from "./types/types";
import {EventEmitter} from "events";
import {Prey} from "./db/entity/Prey";
import {RivenHunter} from "./features/RivenHunter";
import {makeEmbed} from "./functions/embed";
import { dataSource } from "./db/dataSource";

decorate(injectable(), Client)
decorate(injectable(), BaseClient)
decorate(injectable(), EventEmitter)



@injectable()
export class LaughingBreadEmoji {
  constructor(
    @inject(TYPES.Logger) private logger: Logger,
    @inject(TYPES.PQueueTracker) private promiseQueueTracker: PQueue,
    @inject(TYPES.PQueueHunter) private promiseQueueHunter: PQueue,
    @inject(TYPES.CommandDispatcher) private commandDispatcher: CommandDispatcher,
    @inject(TYPES.clientConfig) private options?: ClientOptions
  ) {
    this.discordClient = new Client(this.options)
  }

  discordClient: Client

  init = async () => {
    await this.discordClient.login(process.env.DISCORD_TOKEN)
    this.promiseQueueTracker.on('active', () => {
      this.logger.debug(`Tracker: Size: ${this.promiseQueueTracker.size}  Pending: ${this.promiseQueueTracker.pending}`);
    })
    this.promiseQueueHunter.on('active', () => {
      this.logger.debug(`Hunter: Size: ${this.promiseQueueHunter.size}  Pending: ${this.promiseQueueHunter.pending}`);
    })

    this.discordClient.on('ready', async () => {
      await dataSource.initialize()
      this.logger.info(`Logged in as ${this.discordClient.user.tag}!`)
      const admins = process.env.ADMIN_ID.split(',')
      for (let adminId of admins) {
        const admin = await this.discordClient.users.fetch(adminId)
        try {
          await admin.send(`Logged in as ${this.discordClient.user.tag}!`)
        } catch (e) {
          console.log("cannot send message", admin)
        }
      }

      const userRepository = dataSource.getRepository(UserEntity)
      const urlRepository = dataSource.getRepository(MarketUrl)
      const preyRepository = dataSource.getRepository(Prey)
      const userEntities = await userRepository.find()

      for (let {userId} of userEntities) {
        const user = await this.discordClient.users.fetch(userId)
        let preys = await preyRepository.find({where: {userId: userId}})

        // for (const prey of preys) {
        //   const userTracker = new UserTracker(userId, this)
        //   await userTracker.startTracking(prey, async (profile, channel) => {
        //     if (profile.status === "offline") {
        //       await channel.send(`<@${prey.userId}>, ${prey.nickname} just went **OFFLINE** on Warframe Market.`)
        //     } else if (profile.status === "online") {
        //       await channel.send(`<@${prey.userId}>, ${prey.nickname} is currently **ONLINE** on Warframe Market!`)
        //     } else {
        //       await channel.send(`<@${prey.userId}>, ${prey.nickname} is currently **ONLINE IN GAME** on Warframe Market!`)
        //     }
        //   })
        // }

        const urlEntities = await urlRepository.find({where: {userId}})
        for (let urlEntity of urlEntities) {
          const rivenHunter = new RivenHunter(user.id)
          await rivenHunter.startHunting(urlEntity, this.discordClient, async (rivenMods, channel) => {
            const embeds = rivenMods.map(mod => makeEmbed(mod.auction, mod.bids))
            for (const embed of embeds) {
              await channel.send({embeds: [embed]})
            }
          })
        }
      }
    })

    this.discordClient.on('message', async (msg: Message) => {
      await this.commandDispatcher.run(msg)
    })
  }
}




