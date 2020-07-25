import { HandEvaluation } from "./hand-evaluation";

export class HandWinner {

    public evaluation: HandEvaluation;
    public seatID: number;
    public amount: number;

    constructor(evaluation: HandEvaluation, seatID: number, amount: number) {

        this.evaluation = evaluation;
        this.seatID = seatID;
        this.amount = amount;

    }

}