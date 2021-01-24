import { UserManager } from "../../players/user-manager";
import { LobbyManager } from "../lobby/lobby-manager";
import { CashierCommand } from "../../commands/cashier/cashier-command";
import { AddChipsCommand } from "../../communication/serializable";
import { TableController } from "../tables/table-controller";

export class CashierManager {


    private userManager: UserManager;
    private lobbyManager: LobbyManager;


    constructor(userManager: UserManager, lobbyManager: LobbyManager) {
        this.userManager = userManager;
        this.lobbyManager = lobbyManager;
    }


    public handleCommand(command: CashierCommand): void {

        if (command instanceof AddChipsCommand) {

            return this.addChipsCommand(command);

        }

    }


    private addChipsCommand(command: AddChipsCommand): void {

        if (command.amount <= 0) {

            // Nothing to do here. Either a waste of time or someone trying to get sneaky
            return;

        }

        let tableController: TableController = this.lobbyManager.getTableController(command.tableID);

        if (tableController) {

            let chipsWithdrawn: number = command.amount;

            let addResult: boolean = tableController.addChips(command.userID, chipsWithdrawn);


        }

    }  // addChipsCommand



}