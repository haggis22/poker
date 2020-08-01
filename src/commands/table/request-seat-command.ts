import { User } from "../../players/user";
import { Command } from "../command";

export class RequestSeatCommand implements Command {

    public tableID: number;
    public user: User;
    public seatIndex: number;


    constructor(tableID: number, user: User, seatIndex: number) {
        this.tableID = tableID;
        this.user = user;
        this.seatIndex = seatIndex;
    }


}