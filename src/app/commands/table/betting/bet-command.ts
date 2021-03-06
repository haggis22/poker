import { TableCommand } from "../table-command";

export class BetCommand extends TableCommand {

    public amount: number;


    constructor(tableID: number, amount: number) {

        super(tableID);

        this.amount = amount;
    }


    public toString(): string {

        return `[ BetCommand, userID: ${this.userID}, amount: ${this.amount} ]`;

    }

}