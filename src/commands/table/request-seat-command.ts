import { User } from "../../players/user";
import { TableCommand } from "./table-command";

export class RequestSeatCommand extends TableCommand {

    public user: User;
    public seatIndex: number;


    constructor(tableID: number, user: User, seatIndex: number) {

        super(tableID);

        this.user = user;
        this.seatIndex = seatIndex;
    }

}