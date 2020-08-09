import { ActionHandler } from "../actions/action-handler";
import { CommandBroadcaster } from "../commands/command-broadcaster";
import { Action } from "../actions/action";
import { PrivateAction } from "../actions/private-action";
import { CommandHandler } from "../commands/command-handler";
import { Command } from "../commands/command";
import { ServerClient } from "./server-client";
import { ActionBroadcaster } from "../actions/action-broadcaster";
import { CommandResult } from "../commands/command-result";
import { PrivateActionHandler } from "../actions/private-action-handler";

export class ClientManager implements PrivateActionHandler, ActionBroadcaster, CommandHandler, CommandBroadcaster {


    private commandHandlers: CommandHandler[];
    private actionHandlers: ActionHandler[];


    constructor()
    {

        this.commandHandlers = new Array<CommandHandler>();
        this.actionHandlers = new Array<ActionHandler>();
    }

    handleCommand(command: Command): Promise<CommandResult> {

        for (let handler of this.commandHandlers) {
            handler.handleCommand(command);
        }

        return null;

    }

    registerActionHandler(handler: ActionHandler) {

        this.actionHandlers.push(handler);
    }

    unregisterActionHandler(handler: ActionHandler) {

        this.actionHandlers = this.actionHandlers.filter(ah => ah !== handler);

    }



    public registerCommandHandler(handler: CommandHandler) {
        this.commandHandlers.push(handler);
    }

    public unregisterCommandHandler(handler: CommandHandler) {
        this.commandHandlers = this.commandHandlers.filter(ch => ch != handler);
    }

    private broadcastCommand(command: Command) {

        for (let handler of this.commandHandlers) {
            handler.handleCommand(command);
        }

    }

    public handleAction(publicAction: Action, privateAction?: PrivateAction): void {

        for (let handler of this.actionHandlers) {

            if (handler instanceof ServerClient) {

                if (privateAction && privateAction instanceof PrivateAction) {

                    if (handler.userID === privateAction.userID) {
                        handler.handleAction(privateAction);
                    }
                    else {
                        handler.handleAction(publicAction);
                    }

                }
                else {
                    // there is no private action, so just send them the publicly-available one
                    handler.handleAction(publicAction);
                }

            }
            else {
                handler.handleAction(publicAction);
            }

        }

    }


}