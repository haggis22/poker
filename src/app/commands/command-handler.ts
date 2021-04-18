import { Command } from "./command";

export interface CommandHandler {

    id: string;

    handleCommand(command: Command) : void

}