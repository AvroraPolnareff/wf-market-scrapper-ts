import "reflect-metadata"
import {Container, injectable} from "inversify"
import TYPES from "./types/types";
import {CommandDispatcher, CommandDispatcherImpl} from "./commands/CommandDispatcher";
import PQueue from "p-queue";
import {Logger} from "./utility/Logger";
import {config} from 'dotenv'
import {LogglyLogger} from "./utility/LogglyLogger";
import {ConsoleLogger} from "./utility/ConsoleLogger";
import {LaughingBreadEmoji} from "./LaughingBreadEmoji";
import {WMAPI} from "./api/WMAPI"
import { ClientOptions } from "discord.js";
config()

const container = new Container()

const robin =
  {currentProxy: 0}

container.bind(TYPES.clientConfig).toConstantValue({
  intents: [
    "DirectMessages",
    "DirectMessageReactions",
    "GuildMessageReactions",
    "GuildMessages",
    "GuildMessageTyping",
    "GuildMembers",
    "Guilds",
    "MessageContent",
  ]
} as ClientOptions)
if (process.env.LOGGLY_TOKEN && process.env.LOGGLY_DOMAIN) {
    container.bind(TYPES.logglyToken).toConstantValue(process.env.LOGGLY_TOKEN)
    container.bind(TYPES.logglyDomain).toConstantValue(process.env.LOGGLY_DOMAIN)
    container.bind<Logger>(TYPES.Logger).to(LogglyLogger)
} else {
    container.bind<Logger>(TYPES.Logger).to(ConsoleLogger)
}
container.bind<CommandDispatcher>(TYPES.CommandDispatcher).to(CommandDispatcherImpl)
container.bind<PQueue>(TYPES.PQueueHunter).toConstantValue(new PQueue({concurrency: 3, interval: 1000, intervalCap: 2}))
container.bind<PQueue>(TYPES.PQueueTracker).toConstantValue(new PQueue({concurrency: 1}))
container.bind<{currentProxy: number}>(TYPES.RoundRobin).toConstantValue(robin)
container.bind<LaughingBreadEmoji>(TYPES.LaughingBreadEmoji).to(LaughingBreadEmoji)
container.bind<WMAPI>(TYPES.WMAPI).toConstantValue(new WMAPI())




export default container
