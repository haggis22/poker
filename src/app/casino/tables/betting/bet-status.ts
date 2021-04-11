import { Pot } from "./pot";
import { Bet } from './bet';
import { Ante } from './ante';
import { Blind } from './blind';
import { RemainingActor } from './remaining-actor';

export class BetStatus {


    public bettingRound: number;

    // Indicates which seat needs to act
    public seatIndex: number;

    // Indicates which user needs to act
    public actionOnUserID: number;


    public remainingActors: RemainingActor[];

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

        this.remainingActors = [];

        this.pots = [];

        this.antes = {};
        this.bets = {};

        this.forcedBets = null;

    }

    public toString(): string {

        return `[ BetStatus, seatIndex: ${this.seatIndex}, actionOnUserID: ${this.actionOnUserID}, currentBet: ${ this.currentBet }, lastLiveBet: ${ this.lastLiveBet }, lastLiveRaise: { $this.lastLiveRaise } ]`;

    }

    public isActionOn(seatIndex: number, userID: number): boolean {

        return seatIndex != null && userID != null && this.seatIndex === seatIndex && this.actionOnUserID === userID;

    }



    public doesSeatRemainToAct(seatIndex: number, userID: number): boolean {

        return (seatIndex != null && userID != null && this.remainingActors.find(ra => ra.seatIndex === seatIndex && ra.userID === userID) != null);

    }

    public hasAntes(): boolean {

        return Object.keys(this.antes).length > 0;

    }

    public hasBets(): boolean {

        return Object.keys(this.bets).length > 0;

    }

}