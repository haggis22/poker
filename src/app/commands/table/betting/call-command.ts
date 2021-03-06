import { BetCommand } from "./bet-command";

export class CallCommand extends BetCommand {


    constructor(tableID: number, amount: number) {

        super(tableID, amount);

    }


    public toString(): string {

        return `[ CallCommand, userID: ${this.userID}, amount: ${this.amount} ]`;

    }

}