import { Pot } from "./pot";
import { Seat } from "../seat";
import { Bet } from "./bet";

export class BetTracker {


    public seatIndexInitiatingAction: number;
    public seatIndex: number;

    public currentBet: number;
    public minRaise: number;

    public isDeadRaise: boolean;
    public timeToAct: number;

    // Tracks how much each seat has bet so far in this round
    public bets: Map<number, number>;

    public pots: Pot[];

    constructor() {

        this.pots = [];
        this.bets = new Map<number, number>();

    }


    public reset(): void {

        this.pots.length = 0;
        this.clearBets();

    }

    public clearBets(): void {

        this.seatIndexInitiatingAction = null;
        this.bets.clear();
        this.currentBet = 0;
        this.isDeadRaise = false;


    }

    public isValidBet(seat: Seat, amount: number): boolean {

        return true;

    }  // isValidBet


    public addBet(seat: Seat, totalBetAmount: number): Bet {

        if (seat && seat.isPlaying && seat.player && seat.player.chips > 0) {

            let playerCurrentBet: number = this.bets.has(seat.index) ? this.bets.get(seat.index) : 0;

            let chipsRequired: number = totalBetAmount - playerCurrentBet;

            let isAllIn: boolean = false;

            if (chipsRequired >= seat.player.chips) {

                chipsRequired = seat.player.chips;
                isAllIn = true;

            }

            seat.player.chips -= chipsRequired;

            let playerTotalBet = playerCurrentBet + chipsRequired;

            this.bets.set(seat.index, playerTotalBet);

            return new Bet(playerTotalBet, chipsRequired, isAllIn);

        }

        // hasn't added any chips, so not suddenly all-in
        return new Bet(0, 0, false);

    }   // addBet


    public gatherBets(): void {

        if (this.pots.length == 0) {

            // Create a new pot
            this.pots.push(new Pot(0));

        }

        // Everyone still betting should be active in the most recent pot
        let pot = this.pots[this.pots.length - 1];

        let done: boolean = false;

        while (!done) {

            let smallestBet = Number.MAX_VALUE;

            for (let amount of this.bets.values()) {

                if (amount > 0) {

                    smallestBet = Math.min(smallestBet, amount);

                }

            }

            done = true;

            for (let seatIndex of this.bets.keys()) {

                pot.addChips(smallestBet, seatIndex);
                this.bets.set(seatIndex, this.bets.get(seatIndex) - smallestBet);

                if (this.bets.get(seatIndex) > 0) {

                    done = false;

                }

            }

            if (!done) {

                // Create a new side pot - it will become the active pot to which bets get added
                this.pots.push(new Pot(this.pots.length));
                pot = this.pots[this.pots.length = 1];

            }

        }   // while !done

        this.clearBets();

    }   // gatherBets

}