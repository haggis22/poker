import { Pot } from "../../casino/tables/betting/pot";
import { BetTracker } from "../../casino/tables/betting/bet-tracker";

export class UpdateBetsAction {

    public tableID: number;
    public betTracker: BetTracker

    constructor(tableID: number, betTracker: BetTracker) {

        this.tableID = tableID;
        this.betTracker = betTracker;

    }

}