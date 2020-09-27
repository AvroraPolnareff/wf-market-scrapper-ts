import {EntityRepository, getCustomRepository, Repository} from "typeorm";
import {RivenList} from "../entity/RivenList";
import {Riven} from "../../structures/Riven";
import {Auction} from "../../features/RivenHunter";
import {WMAPI} from "../../api/WMAPI";
import * as _ from "lodash";

@EntityRepository(RivenList)
export class RivenListRepository extends Repository<RivenList> {
    async findRivenListByUrl(url: string): Promise<Auction[]> {
        const entity = await this.findOne({url: url})
        if (entity) {
            return JSON.parse(entity.rivenList)
        } else {
            return undefined
        }
    }

    async saveRivenList(rivenList: Auction[], url: string) {
        const stringified = JSON.stringify(rivenList)
        const oldList = await this.findOne({url: url})
        if (oldList) {
            await this.delete(oldList.id)
        }
        const newList = new RivenList()
        newList.url = url
        newList.rivenList = stringified
        return this.save(newList)
    }

    async fetchNewRivenMods(marketUrl: string)  {
        const api = new WMAPI()
        const oldRivenList = await this.findRivenListByUrl(marketUrl)
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
