import { Pot } from "../../casino/tables/betting/pot";
import { BetTracker } from "../../casino/tables/betting/bet-tracker";
import { Action } from "../action";

export class UpdateBetsAction implements Action {

    public tableID: number;
    public betTracker: BetTracker

    constructor(tableID: number, betTracker: BetTracker) {

        this.tableID = tableID;
        this.betTracker = betTracker;

    }

}