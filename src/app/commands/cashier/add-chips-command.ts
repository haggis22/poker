import { CashierCommand } from "./cashier-command";

export class AddChipsCommand extends CashierCommand {

    public tableID: number;
    public amount: number;


    constructor(tableID: number, amount: number) {

        super();

        this.tableID = tableID;
        this.amount = amount;

    }
    
}