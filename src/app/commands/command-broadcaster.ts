import { CommandHandler } from "./command-handler";

export interface CommandBroadcaster {

    registerCommandHandler(handler: CommandHandler): void;

    unregisterCommandHandler(handler: CommandHandler): void;

}