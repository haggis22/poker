import { TableCommand } from "../table-command";

export class AnteCommand extends TableCommand {


    constructor(tableID: number) {

        super(tableID);

    }


    public toString(): string {

        return `[ AnteCommand, userID: ${this.userID} ]`;

    }

}