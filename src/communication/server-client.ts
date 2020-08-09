import { ActionHandler } from "../actions/action-handler";
import { ActionBroadcaster } from "../actions/action-broadcaster";
import { CommandHandler } from "../commands/command-handler";
import { CommandBroadcaster } from "../commands/command-broadcaster";
import { Action } from "../actions/action";
import { Command } from "../commands/command";
import { ClientManager } from "./client-manager";
import { CommandResult } from "../commands/command-result";
import { PrivateAction } from "../actions/private-action";

export class ServerClient implements ActionHandler, ActionBroadcaster, CommandHandler, CommandBroadcaster {

    public userID: number;

    private commandHandler: CommandHandler;
    private actionHandler: ActionHandler;

    constructor(userID: number, clientManager: ClientManager) {

        this.userID = userID;

        this.registerCommandHandler(clientManager);
        clientManager.registerActionHandler(this);

    }


    registerCommandHandler(handler: CommandHandler) {
        this.commandHandler = handler;
    }

    unregisterCommandHandler(handler: CommandHandler) {

        if (this.commandHandler == handler) {

            this.commandHandler = null;

        }
    }

    handleCommand(command: Command): Promise<CommandResult> {

        if (this.commandHandler != null) {
            this.commandHandler.handleCommand(command);
        }

        return null;
    }

    registerActionHandler(handler: ActionHandler) {
        this.actionHandler = handler;
    }

    unregisterActionHandler(handler: ActionHandler) {

        if (this.actionHandler === handler) {

            this.actionHandler = null;

        }
    }

    handleAction(publicAction: Action, privateAction?: PrivateAction): void {

        if (this.actionHandler != null) {

            // ServerClient objects only get the action object that is suitable for passing down the link.
            // The privateAction will always be null because the ClientManager will have decided whether this
            // serverClient is allowed to have the private action (if there was one)
            this.actionHandler.handleAction(publicAction);

        }

    }


}