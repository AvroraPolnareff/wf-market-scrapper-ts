import {LaughingBreadEmoji} from "../LaughingBreadEmoji";

let TYPES = {
    BaseCommand: Symbol.for("BaseCommand"),
    CommandDispatcher: Symbol.for('CommandHandler'),
    PQueueHunter: Symbol.for('PQueueHunter'),
    PQueueTracker: Symbol.for('PQueueTracker'),
    Logger: Symbol.for('Logger'),
    logglyToken: Symbol.for('logglyToken'),
    logglyDomain: Symbol.for('logglyDomain'),
    LaughingBreadEmoji: Symbol.for('LaughingBreadEmoji'),
    clientConfig: Symbol.for('clientConfig'),
    RoundRobin: Symbol.for("roundRobin"),
    WMAPI: Symbol.for("WMAPI")
}

export default TYPES
