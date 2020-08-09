import { CommandHandler } from "./command-handler";

export interface CommandBroadcaster {

    registerCommandHandler(handler: CommandHandler);

    unregisterCommandHandler(handler: CommandHandler);

}