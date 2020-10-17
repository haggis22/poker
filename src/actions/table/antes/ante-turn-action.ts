import { TableAction } from "../table-action";
import { BetTracker } from "../../../casino/tables/betting/bet-tracker";

export class AnteTurnAction extends TableAction {

    public tableID: number;
    public betTracker: BetTracker;

    constructor(tableID: number, betTracker: BetTracker) {

        super(tableID);

        this.betTracker = betTracker;

    }


}