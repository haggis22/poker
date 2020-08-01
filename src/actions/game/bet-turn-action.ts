import { Action } from "../action";
import { BetTracker } from "../../casino/tables/betting/bet-tracker";

export class BetTurnAction implements Action {

    public tableID: number;
    public bets: BetTracker;

    constructor(tableID: number, bets: BetTracker) {

        this.tableID = tableID;
        this.bets = bets;

    }


}