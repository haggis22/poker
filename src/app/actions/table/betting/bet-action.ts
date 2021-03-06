import { TableAction } from "../table-action";
import { Bet } from "../../../casino/tables/betting/bet";

export class BetAction extends TableAction {

    public seatIndex: number;
    public bet: Bet;

    constructor(tableID: number, seatIndex: number, bet: Bet) {

        super(tableID);

        this.seatIndex = seatIndex;
        this.bet = bet;

    }

}