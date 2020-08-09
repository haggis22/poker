import { TableAction } from "../table-action";
import { BetTracker } from "../../../casino/tables/betting/bet-tracker";

export class BetTurnAction extends TableAction {

    public tableID: number;
    public bets: BetTracker;

    constructor(tableID: number, bets: BetTracker) {

        super(tableID);

        this.bets = bets;

    }


}