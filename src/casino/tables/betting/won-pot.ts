import { HandEvaluation } from "../../../games/hand-evaluation";

export class WonPot {

    public potIndex: number;
    public amount: number;
    public seatIndex: number;
    public handEvaluation: HandEvaluation


    constructor(potIndex: number, amount: number, seatIndex: number, handEvaluation: HandEvaluation)
    {
        this.potIndex = potIndex;
        this.amount = amount;
        this.seatIndex = seatIndex;
        this.handEvaluation = handEvaluation;
    }

    getName(): string {
        return (this.potIndex === 0) ? 'the main pot' : `side pot #${this.potIndex}`;
    }


}