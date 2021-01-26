import { UserManager } from "../../players/user-manager";
import { LobbyManager } from "../lobby/lobby-manager";
import { CashierCommand } from "../../commands/cashier/cashier-command";
import { CheckBalanceCommand, AddChipsCommand, User, Message, ErrorMessage, ActionMessage } from "../../communication/serializable";
import { TableController } from "../tables/table-controller";
import { IServerClient } from "../../communication/server-side/i-server-client";
import { CurrentBalanceAction } from "../../actions/cashier/current-balance-action";

export class CashierManager {


    private userManager: UserManager;
    private lobbyManager: LobbyManager;


    constructor(userManager: UserManager, lobbyManager: LobbyManager) {
        this.userManager = userManager;
        this.lobbyManager = lobbyManager;
    }


    public handleCommand(command: CashierCommand): Message {

        if (command instanceof CheckBalanceCommand) {

            return this.checkBalanceCommand(command);

        }

        if (command instanceof AddChipsCommand) {

            return this.addChipsCommand(command);

        }

    }


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

            return tableController.addChips(command.userID, command.amount);

        }

        return new ErrorMessage('Could not find table', command.userID);

    }  // addChipsCommand


}