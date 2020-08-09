import { TableAction } from "../table-action";
import { BetTracker } from "../../../casino/tables/betting/bet-tracker";

export class UpdateBetsAction extends TableAction {

    public betTracker: BetTracker

    constructor(tableID: number, betTracker: BetTracker) {

        super(tableID);

        this.betTracker = betTracker;

    }

}