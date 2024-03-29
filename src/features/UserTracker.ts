import {Client, DMChannel, EmbedBuilder, TextChannel} from "discord.js";
import {Prey} from "../db/entity/Prey";
import {Profile} from "./RivenHunter";
import PQueue from "p-queue";
import {WMAPI} from "../api/WMAPI";
import {fetchChannel} from "../functions/fetchChannel";
import container from "../inversify.config"
import TYPES from "../types/types"
import { dataSource } from "../db/dataSource";


export class UserTracker {
    constructor(
        private userId : string,
        private client: Client
    ) {
    }

    public remove = async (index: number, channelId: string, guildId = "") => {
        const preyRepository = dataSource.getRepository(Prey)
        const preys = await preyRepository.find({where: {channelId, guildId, userId: this.userId}})
        return await preyRepository.delete(preys[index])
    }

    public add = async (profileURL: string, channelId: string, guildId: string = '') => {
        const preyRepository = dataSource.getRepository(Prey)
        const preys  = await preyRepository.find({where: {userId: this.userId}})
        const api = container.get<WMAPI>(TYPES.WMAPI)
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
        const repository = dataSource.getRepository(Prey)
        const preys = await repository.find({where: {userId: this.userId, channelId: channelId, guildId: guildId}})
        const embed = new EmbedBuilder()
        embed.setTitle('Users:')
        embed.addFields(preys.map((prey, index) => ({name: `**${index + 1}**`, value: `*${prey.nickname}*`})))
        return embed
    }

    public trackOnce = async (prey: Prey) : Promise<Profile> => {
        const promiseQueue: PQueue = container.get(TYPES.PQueueTracker)
        return await promiseQueue.add(async () => {
            const api = container.get<WMAPI>(TYPES.WMAPI)
            return await api.profile(prey.nickname)
        })
    }

    public startTracking = async (
      {userId, channelId, guildId, nickname}: Prey,
      onStatusChanged: (profile: Profile, channel: TextChannel | DMChannel) => void
    ) => {
        const timer = setInterval(async  () => {
            const preyRepository = dataSource.getRepository(Prey)
            const prey = await preyRepository.find({where: {userId, channelId, guildId, nickname}})
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
        }, 15000)
    }


}
