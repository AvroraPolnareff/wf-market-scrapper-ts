import {Message} from "discord.js";

export interface Command {

    name: string,
    aliases?: string[]
    description?: string
    prefix?: string
    args?: string | string[]

    run (msg : Message, args?: string[]) : Promise<void>
}

