import { CommandHandler } from "../../commands/command-handler";
import { Command } from "../../commands/command";
import { Message } from "../../messages/message";
import { IServerClient } from "./i-server-client";
import { ActionMessage } from '../../messages/action-message';
import { LobbyManager } from '../../casino/lobby/lobby-manager';
import { LobbyCommand } from '../../commands/lobby/lobby-command';
import { UserSummary } from "../../players/user-summary";
import { UserManager } from '../../players/user-manager';
import { SecurityCommand } from '../../commands/security/security-command';
import { ISocketWrapper } from '../i-socket-wrapper';
import { CashierManager } from "../../casino/cashier/cashier-manager";
import { CashierCommand } from "../../commands/cashier/cashier-command";
import { ErrorMessage } from "../../messages/error-message";


export class ServerClient implements IServerClient {

    private socket: ISocketWrapper;

    private userManager: UserManager;
    private lobbyManager: LobbyManager;
    private cashierManager: CashierManager;

    public userID: number;

    private commandHandlers: CommandHandler[];

    constructor(socket: ISocketWrapper, userManager: UserManager, lobbyManager: LobbyManager, cashierManager: CashierManager) {

        this.socket = socket;
        this.socket.addEventListener('message', (obj: any) => { this.receive(obj); });

        this.userManager = userManager;
        this.lobbyManager = lobbyManager;
        this.cashierManager = cashierManager;

        this.commandHandlers = new Array<CommandHandler>();

    }

    private log(msg: string): void {

        console.log('\x1b[33m%s\x1b[0m', `ServerClient ${msg}`);

    }


    receive(obj: any): void {

        if (obj) {

            this.log(`Heard ${obj.constructor.name}: ${JSON.stringify(obj)}`);

            if (!(obj instanceof Command)) {

                // Can't do anything with messages that aren't Commands
                return;

            }

            // Authenticate the user on every message so that a logged-out user does not continue to act
            let user: UserSummary = this.userManager.authenticate(obj.authToken);

            if (user) {

                obj.user = user;
                this.userID = obj.userID = user.id;

            }
            else {
                obj.user = null;
                this.userID = obj.userID = null;
            }


            if (obj instanceof SecurityCommand) {

                return this.handleMessage(this.userManager.handleCommand(obj, this));

            }

            if (obj instanceof CashierCommand) {

                return this.handleMessage(this.cashierManager.handleCommand(obj));

            }

            if (obj instanceof LobbyCommand) {

                return this.lobbyManager.handleCommand(obj, this);

            }


            // Pass the message along
            for (let handler of this.commandHandlers) {

                handler.handleCommand(obj);

            }


        }  // o is not null

    }   // receive



    registerCommandHandler(handler: CommandHandler) {

        this.commandHandlers.push(handler);

    }

    unregisterCommandHandler(handler: CommandHandler) {

        this.commandHandlers = this.commandHandlers.filter(ch => ch !== handler);

    }


    handleMessage(message: Message): void {

        if (!message) {
            return;
        }

        // ServerClient objects only get the message object that is suitable for passing down the link, so ship it!
        this.socket.send(message);

    }


}