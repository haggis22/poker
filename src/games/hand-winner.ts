import { HandEvaluation } from "./hand-evaluation";
import { FacedownCard } from "../cards/face-down-card";
import { Card } from "../cards/card";

export class HandWinner {

    public evaluation: HandEvaluation;
    public seatIndex: number;

    constructor(evaluation: HandEvaluation, seatIndex: number) {

        this.evaluation = evaluation;
        this.seatIndex = seatIndex;

    }

}