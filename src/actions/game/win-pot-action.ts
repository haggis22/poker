import { Action } from "../action";
import { HandEvaluation } from "../../games/hand-evaluation";

export class WinPotAction implements Action {

    public tableID: number;
    public seatIndex: number;
    public handEvaluation: HandEvaluation;
    public amount: number;

    constructor(tableID: number, seatIndex: number, handEvaluation: HandEvaluation, amount: number) {

        this.tableID = tableID;
        this.seatIndex = seatIndex;
        this.handEvaluation = handEvaluation;
        this.amount = amount;

    }

}