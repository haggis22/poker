import { TableAction } from "../table-action";
import { Bet } from "../../../casino/tables/betting/bet";

export class AnteAction extends TableAction {

    public seatIndex: number;
    public ante: Bet;

    constructor(tableID: number, seatIndex: number, ante: Bet) {

        super(tableID);

        this.seatIndex = seatIndex;
        this.ante = ante;

    }

}