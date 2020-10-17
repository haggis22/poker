import { TableCommand } from "../table-command";

export class BetCommand extends TableCommand {

    public userID: number;
    public amount: number;


    constructor(tableID: number, userID: number, amount: number) {

        super(tableID);

        this.userID = userID;
        this.amount = amount;
    }


    public toString(): string {

        return `[ BetCommand, userID: ${this.userID}, amount: ${this.amount} ]`;

    }

}