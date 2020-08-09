import { Command } from "./command";

export interface CommandHandler {

    handleCommand(command: Command) : void

}