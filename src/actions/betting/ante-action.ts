import { Action } from "../action";
import { Bet } from "../../casino/tables/betting/bet";

export class AnteAction implements Action {

    public tableID: number;
    public seatIndex: number;
    public ante: Bet;

    constructor(tableID: number, seatIndex: number, ante: Bet) {

        this.tableID = tableID;
        this.seatIndex = seatIndex;
        this.ante = ante;

    }

}