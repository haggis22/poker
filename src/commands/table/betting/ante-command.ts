import { TableCommand } from "../table-command";

export class AnteCommand extends TableCommand {

    public userID: number;
    public amount: number;


    constructor(tableID: number, userID: number, amount: number) {

        super(tableID);

        this.userID = userID;
        this.amount = amount;
    }


    public toString(): string {

        return `[ AnteCommand, userID: ${this.userID}, amount: ${this.amount} ]`;

    }

}