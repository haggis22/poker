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
        this.seatIndex = null;

    }   // clearBets


    public addBet(seat: Seat, totalBetAmount: number): Bet {

        if (!seat || !seat.player) {

            return new Bet(false, 0, 0, false, Bet.INVALID, "There is no player in that seat");

        }

        if (this.seatIndex != seat.index) {

            return new Bet(false, 0, 0, false, Bet.INVALID, "It is not your turn to bet");

        }

        if (!seat.hand) {

            return new Bet(false, 0, 0, false, Bet.INVALID, "You are not in the hand");

        }

        // TODO: Make sure the bet is enough to call, or put the player all-in
        let playerCurrentBet: number = this.bets.has(seat.index) ? this.bets.get(seat.index) : 0;

        let chipsRequired: number = totalBetAmount - playerCurrentBet;

        let isAllIn: boolean = false;

        if (chipsRequired >= seat.player.chips) {

            chipsRequired = seat.player.chips;

            if (chipsRequired > 0) {
                isAllIn = true;
            }

        }

        seat.player.chips -= chipsRequired;

        let playerTotalBet = playerCurrentBet + chipsRequired;

        let betType: number = null;

        if (playerTotalBet > this.currentBet) {

            this.isDeadRaise = playerTotalBet < this.minRaise;

            if (this.currentBet === 0) {

                betType = Bet.OPEN;

            }
            else {

                betType = Bet.RAISE;

            }

            this.currentBet = playerTotalBet;

        }
        else if (this.currentBet === 0) {

            betType = Bet.CHECK;

        }
        else {

            betType = Bet.CALL;

        }

        this.bets.set(seat.index, playerTotalBet);

        // console.log(`BetType is ${betType}`);

        return new Bet(true, playerTotalBet, chipsRequired, isAllIn, betType, null);


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
                pot = this.pots[this.pots.length - 1];

            }

        }   // while !done

        this.clearBets();

    }   // gatherBets

}