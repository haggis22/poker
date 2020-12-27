import { TableAction } from "../table-action";

export class ChatAction extends TableAction {

    public userID: number;
    public username: string;
    public message: string;

    constructor(tableID: number, userID: number, username: string, message: string) {

        super(tableID);

        this.userID = userID;
        this.username = username;
        this.message = message;

    }

}