import {EntityRepository, Repository} from "typeorm";
import {RivenList} from "../entity/RivenList";
import {Auction} from "../../features/RivenHunter";
import {WMAPI} from "../../api/WMAPI";
import * as _ from "lodash";
import {inject, injectable} from "inversify"
import TYPES from "../../types/types"
import container from "../../inversify.config"
import { dataSource } from "../dataSource";


export class RivenListRepository {
    repo = dataSource.getRepository(RivenList)

    async findRivenListByUrl(url: string): Promise<Auction[]> {
        const entity = await this.repo.findOne({where: {url: url}})
        if (entity) {
            return JSON.parse(entity.rivenList)
        } else {
            return undefined
        }
    }

    async saveRivenList(rivenList: Auction[], url: string) {
        const stringified = JSON.stringify(rivenList)
        const oldList = await this.repo.findOne({where: {url: url}})
        if (oldList) {
            await this.repo.delete(oldList.id)
        }
        const newList = new RivenList()
        newList.url = url
        newList.rivenList = stringified
        return this.repo.save(newList)
    }

    async fetchNewRivenMods(marketUrl: string)  {
        const oldRivenList = await this.findRivenListByUrl(marketUrl)
        const api = container.get<WMAPI>(TYPES.WMAPI)
        const actualRivenList = await api.auctions(marketUrl)

        if (oldRivenList) {
            const difference = _.differenceWith(actualRivenList, oldRivenList, this.auctionDifference)
            await this.saveRivenList(actualRivenList, marketUrl)
            if (difference.length !== 0) {
                return difference
            } else {
                return []
            }
        } else {
            console.log("Doing some first launch stuff")
            await this.saveRivenList(actualRivenList, marketUrl)
            return []
        }
    }

    auctionDifference = (a: Auction, b: Auction) => (
      a.buyout_price === b.buyout_price &&
      a.top_bid === b.top_bid &&
      a.is_direct_sell === b.is_direct_sell &&
      a.owner.id === b.owner.id &&
      _.isEqual(a.item, b.item) &&
      a.starting_price === b.starting_price &&
      a.updated === b.updated
    )
}

export const rivenListRepository = new RivenListRepository()
