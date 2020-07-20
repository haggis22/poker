import { HandEvaluation } from "./hand-evaluation";
import { Hand } from "../hands/hand";

export class HandWinner {

    public evaluation: HandEvaluation;
    public seat: number;
    public amount: number;

    constructor(evaluation: HandEvaluation, seat: number, amount: number) {

        this.evaluation = evaluation;
        this.seat = seat;
        this.amount = amount;

    }

}