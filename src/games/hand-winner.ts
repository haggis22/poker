import { HandEvaluation } from "./hand-evaluation";

export class HandWinner {

    public evaluation: HandEvaluation;
    public seatIndex: number;
    public amount: number;

    constructor(evaluation: HandEvaluation, seatIndex: number, amount: number) {

        this.evaluation = evaluation;
        this.seatIndex = seatIndex;
        this.amount = amount;

    }

}