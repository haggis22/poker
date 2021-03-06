import { TableCommand } from "../table-command";

export class ChatCommand extends TableCommand {

    public message: string;


    constructor(tableID: number, message: string) {

        super(tableID);

        this.message = message;

    }

}