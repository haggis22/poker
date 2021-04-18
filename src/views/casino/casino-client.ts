import { MessageHandler } from "../../app/messages/message-handler";
import { CommandBroadcaster } from "../../app/commands/command-broadcaster";
import { CommandHandler } from "../../app/commands/command-handler";
import { Message } from "../../app/messages/message";
import { ActionMessage } from "../../app/messages/action-message";
import { Command } from "../../app/commands/command";
import { Logger } from "../../app/logging/logger";
import { Action } from "../../app/actions/action";
import { AuthenticatedAction, SubscribeLobbyCommand, TableSummary, ListTablesAction, SubscribeCashierCommand, CurrentBalanceAction, LoginCommand, LoginFailedAction, LogoutCommand, LogoutAction, AuthenticationFailedAction } from "../../app/communication/serializable";
import { userState } from "@/store/user-state";
import { lobbyState } from "@/store/lobby-state";
import router from '@/router';


const logger: Logger = new Logger();



class CasinoClient implements MessageHandler, CommandBroadcaster {

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

            return this.authenticatedAction(action);

        }

        if (action instanceof AuthenticationFailedAction) {

            return this.authenticationFailedAction(action);

        }

        if (action instanceof LoginFailedAction) {

            return this.loginFailedAction(action);

        }

        if (action instanceof LogoutAction) {

            return this.logoutAction(action);

        }

        if (action instanceof CurrentBalanceAction) {

            return this.currentBalanceAction(action);

        }


    }  // handleMessage


    public authenticatedAction(action: AuthenticatedAction): void {

        this.log(`Heard AuthenticatedAction for ${action.user.username}, sending SubscribeLobbyCommand`);

        userState.setAuthentication(action.user, action.authToken);

        // let me know when the user info updates (like current balance)
        this.broadcastCommand(new SubscribeCashierCommand());

        if (router.currentRoute.value.name == 'Login') {
            router.push({ name: 'Lobby' });
        }


    }   // authenticatedAction


    public loginFailedAction(action: LoginFailedAction): void {

        this.log(`Heard LoginFailedAction`);

        userState.setLoginErrorMessage(action.message);
        userState.clearAuthentication();

        // TODO: unsubscribe from table updates?

    }   // loginFailedAction


    public logoutAction(action: LogoutAction): void {

        this.log(`Heard LogoutAction`);

        userState.clearAuthentication();

        router.push({ name: 'Login' });

        // TODO: unsubscribe from table updates?

    }   // loginFailedAction



    public listTablesAction(action: ListTablesAction): void {

        lobbyState.setTables(action.tables);

    }   // listTablesAction

    public currentBalanceAction(action: CurrentBalanceAction): void {

        userState.setBalance(action.balance);

    }   // listTablesAction


    public logIn(username: string, password: string): void {

        this.broadcastCommand(new LoginCommand(username, password));

    }   // logIn


    public logOut(): void {

        this.broadcastCommand(new LogoutCommand());

    }   // logIn


    public authenticationFailedAction(action: AuthenticationFailedAction): void {

        userState.clearAuthentication();
        router.push({ name: 'Login' });

    }


}


export const casinoClient = new CasinoClient();
