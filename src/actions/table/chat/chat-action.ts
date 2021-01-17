import { TableAction } from "../table-action";

export class ChatAction extends TableAction {

    public username: string;
    public message: string;

    constructor(tableID: number, username: string, message: string) {

        super(tableID);

        this.username = username;
        this.message = message;

    }

}