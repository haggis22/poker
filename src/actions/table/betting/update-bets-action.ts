import { TableAction } from "../table-action";
import { BetStatus } from "../../../casino/tables/betting/bet-status";

export class UpdateBetsAction extends TableAction {

    public betStatus: BetStatus

    constructor(tableID: number, betStatus: BetStatus) {

        super(tableID);

        this.betStatus = betStatus;

    }

}