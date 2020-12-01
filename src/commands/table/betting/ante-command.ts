import { TableCommand } from "../table-command";

export class AnteCommand extends TableCommand {

    public amount: number;


    constructor(tableID: number, amount: number) {

        super(tableID);

        this.amount = amount;
    }


    public toString(): string {

        return `[ AnteCommand, userID: ${this.userID}, amount: ${this.amount} ]`;

    }

}