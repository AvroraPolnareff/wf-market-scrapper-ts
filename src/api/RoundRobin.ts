import axios, {AxiosInstance, AxiosProxyConfig, AxiosRequestConfig} from "axios"
import ProxyAgent from "proxy-agent"
import {inject, injectable} from "inversify"
import TYPES from "../types/types"

@injectable()
export class RoundRobin {
  private instance: AxiosInstance
  private proxies?: string[]
  private activeProxy = 0


  constructor(params: AxiosRequestConfig) {
    this.instance = axios.create(params)
    try {
      if (process.env.PROXIES) {
        this.proxies = JSON.parse(process.env.PROXIES)
      }
    } catch (e) {
      console.error("error while parsing proxies")
    }
  }

  nextProxy() {
    if (this.activeProxy === this.proxies.length - 1) {
      this.activeProxy = 0
    } else {
      this.activeProxy++
    }
    console.log("round robin", this.proxies[this.activeProxy])
    return this.proxies[this.activeProxy]
  }

  async get<T>(url: string, config?: AxiosRequestConfig) {
    return await this.instance.get<T>(url, {...config, ...(this.proxies ? {agent: ProxyAgent(this.nextProxy())} : {})})
  }

}
