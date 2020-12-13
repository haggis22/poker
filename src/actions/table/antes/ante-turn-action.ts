import { TableAction } from "../table-action";
import { BetTracker } from "../../../casino/tables/betting/bet-tracker";

export class AnteTurnAction extends TableAction {

    public tableID: number;
    public betTracker: BetTracker;
    public timesUp: number;

    constructor(tableID: number, betTracker: BetTracker, timesUp: number) {

        super(tableID);

        this.betTracker = betTracker;
        this.timesUp = timesUp;

    }


}