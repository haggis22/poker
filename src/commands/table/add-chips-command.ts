import { TableCommand } from "./table-command";

export class AddChipsCommand extends TableCommand {

    public amount: number;


    constructor(tableID: number, amount: number) {

        super(tableID);

        this.amount = amount;
    }


}