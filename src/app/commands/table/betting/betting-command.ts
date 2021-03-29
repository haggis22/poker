import { TableCommand } from "../table-command";

export class BettingCommand extends TableCommand {


    constructor(tableID: number) {

        super(tableID);

    }


    public toString(): string {

        return `[ BettingCommand, userID: ${this.userID} ]`;

    }

}