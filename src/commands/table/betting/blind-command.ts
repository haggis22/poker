import { TableCommand } from "../table-command";

export class BlindCommand extends TableCommand {


    constructor(tableID: number) {

        super(tableID);

    }


    public toString(): string {

        return `[ BlindCommand, userID: ${this.userID} ]`;

    }

}