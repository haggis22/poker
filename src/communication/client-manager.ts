import { ActionHandler } from "../actions/action-handler";
import { CommandBroadcaster } from "../commands/command-broadcaster";
import { Action } from "../actions/action";
import { CommandHandler } from "../commands/command-handler";
import { Command } from "../commands/command";

export class ClientManager implements ActionHandler, CommandBroadcaster {

    public registerCommandHandler(handler: CommandHandler) {
        throw new Error("Method not implemented.");
    }

    public unregisterCommandHandler(handler: CommandHandler) {
        throw new Error("Method not implemented.");
    }

    private broadcastCommand(command: Command) {
        throw new Error("Method not implemented.");
    }

    public handleAction(action: Action) {
        throw new Error("Method not implemented.");
    }


}