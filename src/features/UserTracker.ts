import {Client, DMChannel, MessageEmbed, TextChannel} from "discord.js";
import {getRepository} from "typeorm";
import {Prey} from "../db/entity/Prey";
import {Profile} from "./RivenHunter";
import PQueue from "p-queue";
import {WMAPI} from "../api/WMAPI";
import {fetchChannel} from "../functions/fetchChannel";


export class UserTracker {
    constructor(
        private userId : string,
        private promiseQueue: PQueue,
        private client: Client
    ) {
    }

    public remove = async (index: number, channelId: string, guildId = "") => {
        const preyRepository = getRepository(Prey)
        const preys = await preyRepository.find({channelId, guildId, userId: this.userId})
        return await preyRepository.delete(preys[index])
    }

    public add = async (profileURL: string, channelId: string, guildId: string = '') => {
        const preyRepository = getRepository(Prey)
        const preys  = await preyRepository.find({userId: this.userId})
        const api = new WMAPI()
        const nickname = profileURL.slice(profileURL.lastIndexOf('/') + 1)
        const profile = await api.profile(nickname)
        if ( preys.some(prey => prey.url === profileURL && prey.channelId === channelId && prey.guildId === guildId)) {
            throw Error("URL has been added.")
        }

        const entity = preyRepository.create({
            url: profileURL,
            userId: this.userId,
            channelId: channelId,
            guildId: guildId,
            lastLogin: profile.last_seen,
            nickname: nickname,
            status: profile.status
        })

        return await preyRepository.save(entity)
    }

    public list = async (channelId: string, guildId: string = '') => {
        const repository = getRepository(Prey)
        const preys = await repository.find({userId: this.userId, channelId: channelId, guildId: guildId})
        const embed = new MessageEmbed()
        embed.setTitle('Users:')
        preys.forEach((prey, index) => {
            embed.addField(`**${index + 1}**`, `*${prey.nickname}*`)
        })
        return embed
    }

    public trackOnce = async (prey: Prey) : Promise<Profile> => {
        return await this.promiseQueue.add(async () => {
            const api = new WMAPI()
            return await api.profile(prey.nickname)
        })
    }

    public startTracking = async (
      {userId, channelId, guildId, nickname}: Prey,
      onStatusChanged: (profile: Profile, channel: TextChannel | DMChannel) => void
    ) => {
        const timer = setInterval(async  () => {
            const preyRepository = getRepository(Prey)
            const prey = await preyRepository.find({userId, channelId, guildId, nickname})
            if (!prey.length) {
                clearInterval(timer)
                return
            }

            const channel = await fetchChannel(userId, guildId, channelId, this.client)
            if (!channel) {
                await preyRepository.delete(prey[0])
                return clearInterval(timer)
            }

            const profile = await this.trackOnce(prey[0])
            if (prey[0].status !== profile.status) {
                await preyRepository.update(prey[0], {
                    status: profile.status,
                    lastLogin: profile.last_seen
                })
                onStatusChanged(profile, channel)
            }
        }, 8000)
    }


}
