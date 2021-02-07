import { BetCommand } from "./bet-command";

export class CheckCommand extends BetCommand {


    constructor(tableID: number) {

        super(tableID, /* amount */ 0);

    }


    public toString(): string {

        return `[ CheckCommand, userID: ${this.userID} ]`;

    }

}