import { Pot } from "./pot";
import { Ante } from "./ante";
import { ForcedBets } from "./forced-bets";
import { Blind } from './blind';
import { Bet } from './bet';

export class BetStatus {


    public bettingRound: number;

    public seatIndex: number;
    public seatIndexesRemainToAct: number[];

    public forcedBets: ForcedBets;

    public currentBet: number;
    public lastLiveBet: number;
    public lastLiveRaise: number;

    public numRaises: number;

    public bigBlindIndex: number;

    // Tracks how much each seat will be forced to post for a blind
    // Key = seat index
    // Value = Array of Blind|Array objects
    public requiredBets: { [key: number]: Blind | Array<Blind>; };

    // Tracks how much each seat has put in for an ante in this round
    // Key = seat index
    // Value = Bet object
    public antes: { [key: number]: Bet; };

    // Tracks how much each seat has bet so far in this round
    // Key = seat index
    // Value = Bet object
    public bets: { [key: number]: Bet };

    public pots: Pot[];


    constructor() {

        this.seatIndexesRemainToAct = [];

        this.pots = [];

        this.requiredBets = {};

        this.bets = {};
        this.antes = {};

        this.bigBlindIndex = null;

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