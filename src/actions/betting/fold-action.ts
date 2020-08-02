import { Action } from "../action";
import { Fold } from "../../casino/tables/betting/fold";

export class FoldAction implements Action {

    public tableID: number;
    public seatIndex: number;
    public fold: Fold;

    constructor(tableID: number, seatIndex: number, fold: Fold) {

        this.tableID = tableID;
        this.seatIndex = seatIndex;
        this.fold = fold;

    }

}