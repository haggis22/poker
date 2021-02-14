import { TableAction } from "../table-action";
import { BetStatus} from "../../../casino/tables/betting/bet-status";

export class AnteTurnAction extends TableAction {

    public tableID: number;
    public timesUp: number;

    constructor(tableID: number, timesUp: number) {

        super(tableID);

        this.timesUp = timesUp;

    }


}