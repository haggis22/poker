import { TableAction } from "../table-action";
import { BetStatus } from "../../../casino/tables/betting/bet-status";

export class BetTurnAction extends TableAction {

    public tableID: number;
    public betStatus: BetStatus;
    public timesUp: number;

    constructor(tableID: number, betStatus: BetStatus, timesUp: number) {

        super(tableID);

        this.betStatus = betStatus;
        this.timesUp = timesUp;

    }


}