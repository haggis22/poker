import { TableAction } from "../table-action";
import { BetTracker } from "../../../casino/tables/betting/bet-tracker";

export class BetTurnAction extends TableAction {

    public tableID: number;
    public betTracker: BetTracker;
    public timeToAct: number;

    constructor(tableID: number, betTracker: BetTracker, timeToAct: number) {

        super(tableID);

        this.betTracker = betTracker;
        this.timeToAct = timeToAct;

    }


}