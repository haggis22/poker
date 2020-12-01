import { User } from "../../players/user";
import { TableCommand } from "./table-command";

export class RequestSeatCommand extends TableCommand {

    public seatIndex: number;


    constructor(tableID: number, seatIndex: number) {

        super(tableID);

        this.seatIndex = seatIndex;
    }

}