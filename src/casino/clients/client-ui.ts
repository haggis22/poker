import { ActionHandler } from "../../actions/action-handler";
import { CommandBroadcaster } from "../../commands/command-broadcaster";
import { Action } from "../../actions/action";
import { CommandHandler } from "../../commands/command-handler";
import { Command } from "../../commands/command";

export class ClientUI implements ActionHandler, CommandBroadcaster {

    registerCommandHandler(handler: CommandHandler) {
        throw new Error("Method not implemented.");
    }

    unregisterCommandHandler(handler: CommandHandler) {
        throw new Error("Method not implemented.");
    }

    broadcastCommand(command: Command) {
        throw new Error("Method not implemented.");
    }

    handleAction(action: Action) {
        throw new Error("Method not implemented.");
    }

}