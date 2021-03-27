import { UserManager } from "../../players/user-manager";
import { LobbyManager } from "../lobby/lobby-manager";
import { CashierCommand } from "../../commands/cashier/cashier-command";
import { CheckBalanceCommand, AddChipsCommand, User, Message, ErrorMessage, ActionMessage } from "../../communication/serializable";
import { TableController } from "../tables/table-controller";
import { IServerClient } from "../../communication/server-side/i-server-client";
import { CurrentBalanceAction } from "../../actions/cashier/current-balance-action";
import { MessageHandler } from '../../messages/message-handler';
import { SubscribeCashierCommand } from '../../commands/cashier/subscribe-cashier-command';

export class CashierManager {


    public userManager: UserManager;
    public lobbyManager: LobbyManager;

    private messageQueue: Array<Message>;

    // Key = userID
    // value = list of IServerClients (or other MessageHandlers) that want updates for this user
    private cashierSubscribers: Map<number, Set<MessageHandler>>;



    constructor() {

        this.messageQueue = new Array<Message>();
        this.cashierSubscribers = new Map<number, Set<MessageHandler>>();

    }

    private log(msg: string): void {

        console.log('\x1b[33m%s\x1b[0m', `CashierManager ${msg}`);

    }
    

    public handleCommand(command: CashierCommand, serverClient: IServerClient): Message {

        this.log(`Heard ${command.constructor.name}: ${JSON.stringify(command)}`);

        if (command instanceof CheckBalanceCommand) {

            return this.checkBalanceCommand(command);

        }

        if (command instanceof AddChipsCommand) {

            return this.addChipsCommand(command);

        }

        if (command instanceof SubscribeCashierCommand) {

            return this.subscribeCashierCommand(command, serverClient);

        }

    }


    /// Registers a message handler for a particular user
    private registerMessageHandler(userID: number, handler: MessageHandler): void {

        if (!this.cashierSubscribers.has(userID)) {

            this.cashierSubscribers.set(userID, new Set<MessageHandler>());

        }

        this.cashierSubscribers.get(userID).add(handler);

    }   // registerMessageHandler



    // Removes the given message handler for a particular user
    private unregisterMessageHandler(userID: number, handler: MessageHandler): void {

        let handlers: Set<MessageHandler> = this.cashierSubscribers.get(userID);

        if (handlers) {

            handlers.delete(handler);

        }

    }

    private queueMessage(message: Message): void {

        this.messageQueue.push(message);

        this.pumpQueues();

    }

    private pumpQueues(): void {

        while (this.messageQueue.length) {

            this.broadcastMessage(this.messageQueue.shift());

        }

    }  // pumpQueues


    // Broadcast the user message to all handlers for that particular user
    private broadcastMessage(message: Message): void {

        let handlers: Set<MessageHandler> = this.cashierSubscribers.get(message.userID);

        if (handlers) {

            for (let handler of handlers) {

                handler.handleMessage(message);

            }

        }

    }   // broadcastMessage



    public checkBalanceCommand(command: CheckBalanceCommand): Message {

        let user: User = this.userManager.fetchUserByID(command.userID);

        if (user == null) {
            return new ErrorMessage('Unknown user', command.userID);
        }

        return new ActionMessage(new CurrentBalanceAction(user.id, user.balance), user.id);

    }  // checkBalanceCommand


    public addChipsCommand(command: AddChipsCommand): Message {

        if (command.amount <= 0) {

            // Nothing to do here. Either a waste of time or someone trying to get sneaky
            return new ErrorMessage('Invalid buy-in', command.userID);

        }

        let tableController: TableController = this.lobbyManager.getTableController(command.tableID);

        if (tableController) {

            let user: User = this.userManager.fetchUserByID(command.userID);

            if (user.balance < command.amount) {

                // not enough money to buy that amount of chips
                return new ErrorMessage('You do not have enough chips', command.userID);

            }

            user.balance -= command.amount;

            this.broadcastBalanceUpdate(user.id);

            return tableController.addChips(command.userID, command.amount);

        }

        return new ErrorMessage('Could not find table', command.userID);

    }  // addChipsCommand


    public cashInChips(userID: number, amount: number): Message {

        if (amount <= 0) {

            // Nothing to do here. Either a waste of time or someone trying to get sneaky
            return new ErrorMessage('Cannot cash in a negative amount', userID);

        }

        let user: User = this.userManager.fetchUserByID(userID);

        user.balance += amount;

        this.broadcastBalanceUpdate(user.id);

        // successfully added to a player not in the hand
        return new Message('Success', userID);

    }  // cashInChips


    private broadcastBalanceUpdate(userID: number): void {

        let checkBalanceCommand: CheckBalanceCommand = new CheckBalanceCommand();
        checkBalanceCommand.userID = userID;

        let message = this.checkBalanceCommand(checkBalanceCommand);

//        this.log(`There are ${this.cashierSubscribers.get(command.userID).size} handlers for user ${command.userID}`);
//        this.log(`Result of checking balance: ${message}`);

        this.queueMessage(message);

    }


    public subscribeCashierCommand(command: SubscribeCashierCommand, serverClient: IServerClient): Message {

        this.registerMessageHandler(command.userID, serverClient);

        this.broadcastBalanceUpdate(command.userID);

        return null;

    }  // subscribeCashierCommand


}