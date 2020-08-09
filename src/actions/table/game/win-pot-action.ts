import { TableAction } from "../table-action";
import { HandEvaluation } from "../../../games/hand-evaluation";

export class WinPotAction extends TableAction {

    public seatIndex: number;
    public potIndex: number;
    public handEvaluation: HandEvaluation;
    public amount: number;

    constructor(tableID: number, seatIndex: number, potIndex: number, handEvaluation: HandEvaluation, amount: number) {

        super(tableID);

        this.seatIndex = seatIndex;
        this.potIndex = potIndex;
        this.handEvaluation = handEvaluation;
        this.amount = amount;

    }

}