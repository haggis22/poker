import { CommandHandler } from "./command-handler";
import { Command } from "./command";

export interface CommandBroadcaster {

    registerCommandHandler(handler: CommandHandler);

    unregisterCommandHandler(handler: CommandHandler);

}