import { TableAction } from "../table-action";
import { Fold } from "../../../casino/tables/betting/fold";

export class FoldAction extends TableAction {

    public seatIndex: number;
    public fold: Fold;

    constructor(tableID: number, seatIndex: number, fold: Fold) {

        super(tableID);

        this.seatIndex = seatIndex;
        this.fold = fold;

    }

}