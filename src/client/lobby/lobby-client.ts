import { MessageHandler } from "../../messages/message-handler";
import { CommandBroadcaster } from "../../commands/command-broadcaster";
import { CommandHandler } from "../../commands/command-handler";
import { Message } from "../../messages/message";
import { ActionMessage } from "../../messages/action-message";
import { Command } from "../../commands/command";
import { UserSummary } from "../../players/user-summary";
import { Logger } from "../../logging/logger";
import { AuthenticateCommand } from "../../commands/security/authenticate-command";
import { IChipFormatter } from "../../casino/tables/chips/chip-formatter";
import { Action } from "../../actions/action";
import { AuthenticatedAction, SubscribeLobbyCommand, TableSummary, ListTablesAction } from "../../communication/serializable";

const logger: Logger = new Logger();

export class LobbyClient implements MessageHandler, CommandBroadcaster {

    public chipFormatter: IChipFormatter;
    public user: UserSummary;
    public tables: TableSummary[];

    private commandHandlers: CommandHandler[];


    constructor(chipFormatter: IChipFormatter) {

        this.chipFormatter = chipFormatter;

        this.commandHandlers = new Array<CommandHandler>();
        this.tables = [];

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

        for (let handler of this.commandHandlers) {

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

        let action: Action = message.action;

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
        this.user = action.user;

        this.broadcastCommand(new SubscribeLobbyCommand());

    }   // authenticated


    public listTablesAction(action: ListTablesAction): void {

        this.tables = [...action.tables];

    }   // listTablesAction


}