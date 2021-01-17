import { TableCommand } from "./table-command";
import { User } from "../../players/user";

export class RequestSeatCommand extends TableCommand {

    public user: User;
    public seatIndex: number;


    constructor(tableID: number, seatIndex: number) {

        super(tableID);

        this.seatIndex = seatIndex;
    }

}