import { ActionBroadcaster } from "../actions/action-broadcaster";
import { CommandHandler } from "../commands/command-handler";
import { ActionHandler } from "../actions/action-handler";
import { Action } from "../actions/action";
import { Command } from "../commands/command";

export class GameClient implements ActionBroadcaster, CommandHandler {

    handleCommand(command: Command): Promise<import("../commands/command-result").CommandResult> {
        throw new Error("Method not implemented.");
    }

    registerActionHandler(handler: ActionHandler) {
        throw new Error("Method not implemented.");
    }

    unregisterActionHandler(handler: ActionHandler) {
        throw new Error("Method not implemented.");
    }

    broadcastAction(action: Action) {
        throw new Error("Method not implemented.");
    }



}