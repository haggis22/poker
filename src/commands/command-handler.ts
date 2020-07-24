import { ICommand } from "./command";
import { CommandResult } from "./command-result";

export interface ICommandHandler {

    handleCommand(command: ICommand) : Promise<CommandResult>

}