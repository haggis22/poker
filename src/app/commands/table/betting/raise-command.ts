import { BetCommand } from "./bet-command";

export class RaiseCommand extends BetCommand {


    constructor(tableID: number, amount: number) {

        super(tableID, amount);
    }


    public toString(): string {

        return `[ RaiseCommand, userID: ${this.userID}, amount: ${this.amount} ]`;

    }

}