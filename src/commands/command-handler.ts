import { Command } from "./command";
import { CommandResult } from "./command-result";

export interface CommandHandler {

    handleCommand(command: Command) : Promise<CommandResult>

}