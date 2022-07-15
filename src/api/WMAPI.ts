import {URL} from "url";
import {Auction, Bid, Profile} from "../features/RivenHunter";
import {RoundRobin} from "./RoundRobin"
import {injectable} from "inversify"

@injectable()
export class WMAPI {
  private readonly API_ROOT = 'https://api.warframe.market/v1'
  private readonly LANG = 'en'
  private readonly PLATFORM = 'pc'

  private instance: RoundRobin

  constructor() {
    this.instance = new RoundRobin({
      baseURL: this.API_ROOT,
      headers: {language: this.LANG, platform: this.PLATFORM},
      timeout: 5000
    })
  }

  public profile = async (nickname: string): Promise<Profile> => {
    type ResponseData = { payload: { profile: Profile } }
    try {
      const request = await this.instance.get<ResponseData>(`/profile/${nickname}`)
      return request.data.payload.profile
    } catch (e) {

      console.error(e)
    }
  }

  public auctions = async (url: string): Promise<Auction[]> => {
    const urlObject = new URL(url)
    try {
      type ResponseData = { payload: { auctions: Auction[] } }
      const request = await this.instance.get<ResponseData>('/auctions/search', {
        params: urlObject.searchParams
      })
      return request.data.payload.auctions
    } catch (e) {
      console.error(e)
    }
  }

  public bids = async (id: string) => {
    type responseData = { payload: { bids: Bid[] } }
    try {
      const request = await this.instance.get<responseData>(`/auctions/entry/${id}/bids`)
      return request.data.payload.bids
    } catch (e) {
      console.error(e)
    }
  }
}
