import { MessageHandler } from "../../app/messages/message-handler";
import { CommandBroadcaster } from "../../app/commands/command-broadcaster";
import { CommandHandler } from "../../app/commands/command-handler";
import { Message } from "../../app/messages/message";
import { ActionMessage } from "../../app/messages/action-message";
import { Command } from "../../app/commands/command";
import { Logger } from "../../app/logging/logger";
import { AuthenticateCommand } from "../../app/commands/security/authenticate-command";
import { IChipFormatter } from "../../app/casino/tables/chips/chip-formatter";
import { Action } from "../../app/actions/action";
import { AuthenticatedAction, SubscribeLobbyCommand, TableSummary, ListTablesAction } from "../../app/communication/serializable";

import { userState } from "@/store/user-state";
import { lobbyState } from "@/store/lobby-state";


const logger: Logger = new Logger();



export class LobbyClient implements MessageHandler, CommandBroadcaster {

    private commandHandlers: CommandHandler[];


    constructor() {

        this.commandHandlers = new Array<CommandHandler>();

    }



    private log(message: string): void {

        console.log(message);

    }

    registerCommandHandler(handler: CommandHandler) {

        this.commandHandlers.push(handler);

    }

    unregisterCommandHandler(handler: CommandHandler) {

        this.commandHandlers = this.commandHandlers.filter(ch => ch !== handler);

    }


    private broadcastCommand(command: Command) {

        this.log(`Sent ${command.constructor.name}`);

        for (const handler of this.commandHandlers) {

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

            return this.authenticated(action);

        }

        if (action instanceof ListTablesAction) {

            return this.listTablesAction(action);

        }


    }  // handleMessage


    public authenticate(): void {

        this.broadcastCommand(new AuthenticateCommand());

    }   // authenticate


    public authenticated(action: AuthenticatedAction): void {

        this.log(`Heared AuthenticatedAction for ${action.user.username}, sending SubscribeLobbyCommand`);

        // store.commit(MutationTypes.USER_SUMMARY, action.user);
        userState.setUser(action.user);

        this.broadcastCommand(new SubscribeLobbyCommand());

    }   // authenticated


    public listTablesAction(action: ListTablesAction): void {

        // store.commit(MutationTypes.TABLE_SUMMARIES, action.tables)
        lobbyState.setTables(action.tables);

    }   // listTablesAction


}