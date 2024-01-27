import "reflect-metadata"
import container from "./inversify.config";
import TYPES from "./types/types";
import {config} from 'dotenv'
import {LaughingBreadEmoji} from "./LaughingBreadEmoji";

config()

const laughingBreadEmoji = container.get<LaughingBreadEmoji>(TYPES.LaughingBreadEmoji);


laughingBreadEmoji.init()





