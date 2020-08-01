import { Action } from "../action";
import { Bet } from "../../casino/tables/betting/bet";

export class BetAction implements Action {

    public tableID: number;
    public seatIndex: number;
    public bet: Bet;

    constructor(tableID: number, seatIndex: number, bet: Bet) {

        this.tableID = tableID;
        this.seatIndex = seatIndex;
        this.bet = bet;

    }

}