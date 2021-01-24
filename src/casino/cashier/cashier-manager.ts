import { UserManager } from "../../players/user-manager";
import { LobbyManager } from "../lobby/lobby-manager";
import { CashierCommand } from "../../commands/cashier/cashier-command";
import { AddChipsCommand, User, Message, ErrorMessage } from "../../communication/serializable";
import { TableController } from "../tables/table-controller";

export class CashierManager {


    private userManager: UserManager;
    private lobbyManager: LobbyManager;


    constructor(userManager: UserManager, lobbyManager: LobbyManager) {
        this.userManager = userManager;
        this.lobbyManager = lobbyManager;
    }


    public handleCommand(command: CashierCommand): Message | ErrorMessage {

        if (command instanceof AddChipsCommand) {

            return this.addChipsCommand(command);

        }

    }


    public addChipsCommand(command: AddChipsCommand): Message | ErrorMessage {

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

            return tableController.addChips(command.userID, command.amount);

        }

        return new ErrorMessage('Could not find table', command.userID);

    }  // addChipsCommand



}