import { HandEvaluation } from "../../../games/hand-evaluation";

export class WonPot {

    public index: number;
    public amount: number;
    public seatIndex: number;
    public handEvaluation: HandEvaluation


    constructor(index: number, amount: number, seatIndex: number, handEvaluation: HandEvaluation)
    {
        this.index = index;
        this.amount = amount;
        this.seatIndex = seatIndex;
        this.handEvaluation = handEvaluation;
    }

    getName(): string {
        return (this.index === 0) ? 'the main pot' : `side pot #${this.index}`;
    }


}