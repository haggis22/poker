import { Pot } from "./pot";

export class BetStatus {


    public bettingRound: number;

    public seatIndex: number;
    public seatIndexesRemainToAct: number[];

    public currentBet: number;
    public lastLiveBet: number;
    public lastLiveRaise: number;

    public numRaises: number;


    // Tracks how much each seat has bet so far in this round
    // Key = seat index
    // Value = Bet object
    public bets: object;

    public pots: Pot[];


    constructor() {

        this.seatIndexesRemainToAct = [];

        this.pots = [];
        this.bets = {};

    }

    public toString(): string {

        return `[ BetStatus, seatIndex: ${this.seatIndex}, currentBet: ${this.currentBet}, lastLiveBet: ${this.lastLiveBet}, lastLiveRaise: {$this.lastLiveRaise} ]`;

    }


    public doesSeatRemainToAct(seatIndex: number): boolean {

        return this.seatIndexesRemainToAct.includes(seatIndex);

    }

}