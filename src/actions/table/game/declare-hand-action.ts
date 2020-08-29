import { TableAction } from "../table-action";
import { HandEvaluation } from "../../../games/hand-evaluation";

export class DeclareHandAction extends TableAction {

    public seatIndex: number;
    public handEvaluation: HandEvaluation;

    constructor(tableID: number, seatIndex: number, handEvaluation: HandEvaluation) {

        super(tableID);

        this.seatIndex = seatIndex;
        this.handEvaluation = handEvaluation;

    }

}