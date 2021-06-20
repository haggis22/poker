import { MessageHandler } from "../../app/messages/message-handler";
import { CommandBroadcaster } from "../../app/commands/command-broadcaster";
import { CommandHandler } from "../../app/commands/command-handler";
import { Message } from "../../app/messages/message";
import { ActionMessage } from "../../app/messages/action-message";
import { Command } from "../../app/commands/command";
import { Logger } from "../../app/logging/logger";
import { Action } from "../../app/actions/action";
import { AuthenticatedAction, ListTablesAction, ListTournamentsAction, LogoutAction } from "../../app/communication/serializable";
import { lobbyState } from "@/store/lobby-state";
import { v4 as uuidv4 } from 'uuid';


const logger: Logger = new Logger();



class LobbyClient implements MessageHandler, CommandBroadcaster {

    public id: string;
    public isAlive: boolean;

    // A map of CommandHandlers
    // Key = CommandHandler.id, so that the same handler will not be added more than once
    // Value = CommandHandler object
    private commandHandlers: Map<string, CommandHandler>;


    constructor() {

        this.id = uuidv4();
        this.isAlive = true;

        this.commandHandlers = new Map<string, CommandHandler>();

    }



    private log(message: string): void {

        console.log(message);

    }

    registerCommandHandler(handler: CommandHandler) {

        this.commandHandlers.set(handler.id, handler);

    }

    unregisterCommandHandler(handler: CommandHandler) {

        this.commandHandlers.delete(handler.id);

    }


    public broadcastCommand(command: Command) {

        this.log(`Sent ${command.constructor.name}`);

        for (const handler of this.commandHandlers.values()) {

            handler.handleCommand(command);

        }

    }


    handleMessage(message: Message): void {

        if (message.text) {

            this.log(message.text);

        }

        if (!(message instanceof ActionMessage)) {

            // Not an ActionMessage, so nothing further to do
            return;

        }

        const action: Action = message.action;

        if (action instanceof AuthenticatedAction) {

            return this.authenticatedAction(action);

        }

        if (action instanceof LogoutAction) {

            return this.logoutAction(action);

        }

        if (action instanceof ListTablesAction) {

            return this.listTablesAction(action);

        }

        if (action instanceof ListTournamentsAction) {

            return this.listTournamentsAction(action);

        }



    }  // handleMessage


    public authenticatedAction(action: AuthenticatedAction): void {

        this.log(`Heard AuthenticatedAction for ${action.user.username}`);

    }   // authenticatedAction


    public logoutAction(action: LogoutAction): void {

        this.log(`Heard LogoutAction`);

        // TODO: unsubscribe from table updates?

    }   // loginFailedAction



    public listTablesAction(action: ListTablesAction): void {

        lobbyState.setTables(action.tables);

    }   // listTablesAction


    public listTournamentsAction(action: ListTournamentsAction): void {

        lobbyState.setTournaments(action.tournaments);

    }   // listTournamentsAction


}


export const lobbyClient = new LobbyClient();
