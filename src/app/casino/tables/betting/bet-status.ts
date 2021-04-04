import { Pot } from "./pot";
import { Bet } from './bet';
import { Ante } from './ante';
import { Blind } from './blind';

export class BetStatus {


    public bettingRound: number;

    public seatIndex: number;
    public seatIndexesRemainToAct: number[];

    public currentBet: number;
    public lastLiveBet: number;
    public lastLiveRaise: number;

    public numRaises: number;

    // Tracks how much each seat has put in for an ante in this round
    // Key = seat index
    // Value = Bet object
    public antes: { [key: number]: Bet; };

    // Tracks how much each seat has bet so far in this round
    // Key = seat index
    // Value = Bet object
    public bets: { [key: number]: Bet };

    public pots: Pot[];

    public forcedBets: (Ante | Blind)[];




    constructor() {

        this.seatIndexesRemainToAct = [];

        this.pots = [];

        this.antes = {};
        this.bets = {};

        this.forcedBets = null;

    }

    public toString(): string {

        return `[ BetStatus, seatIndex: ${this.seatIndex}, currentBet: ${this.currentBet}, lastLiveBet: ${this.lastLiveBet}, lastLiveRaise: {$this.lastLiveRaise} ]`;

    }


    public doesSeatRemainToAct(seatIndex: number): boolean {

        return this.seatIndexesRemainToAct.includes(seatIndex);

    }

    public hasAntes(): boolean {

        return Object.keys(this.antes).length > 0;

    }

    public hasBets(): boolean {

        return Object.keys(this.bets).length > 0;

    }

}