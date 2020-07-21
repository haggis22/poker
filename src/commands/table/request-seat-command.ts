import { User } from "../../players/user";

export class RequestSeatCommand {

    public tableID: number;
    public user: User;
    public seatID: number;


    constructor(tableID: number, user: User, seatID: number) {
        this.tableID = tableID;
        this.user = user;
        this.seatID = seatID;
    }


}