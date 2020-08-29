import { Pot } from "./pot";
import { Seat } from "../seat";
import { Bet } from "./bet";
import { Fold } from "./fold";

export class BetTracker {


    public seatIndexInitiatingAction: number;
    public seatIndex: number;

    public lastLiveBet: number;
    public currentBet: number;

    public timeToAct: number;

    // Tracks how much each seat has bet so far in this round
    public bets: object;

    public pots: Pot[];

    constructor() {

        this.pots = [];
        this.bets = {};

    }

    public toString(): string {

        return `[BetTracker, seatIndex: ${this.seatIndex}, seatIndexInitiatingAction: ${this.seatIndexInitiatingAction}, lastLiveBet: ${this.lastLiveBet}, currentBet: ${this.currentBet} ]`;

    }


    public reset(): void {

        this.pots.length = 0;
        this.clearBets();

    }

    public clearBets(): void {

        this.seatIndexInitiatingAction = null;

        for (const prop of Object.getOwnPropertyNames(this.bets)) {
            delete this.bets[prop];
        }

        this.currentBet = this.lastLiveBet = 0;
        this.seatIndex = null;

    }   // clearBets


    public fold(seat: Seat): Fold {

        if (!seat) {

            return new Fold(false, "Invalid seat");

        }

        if (!seat.hand) {

            return new Fold(false, "You do not have a hand");

        }

        if (this.seatIndex != seat.index) {

            return new Fold(false, "It is not your turn to act");

        }

        return new Fold(true, null);

    }   // fold


    public getCurrentBet(seatIndex: number): number {

        return this.bets[seatIndex] || 0;

    }


    public addBet(seat: Seat, totalBetAmount: number, minimumBet: number): Bet {

        // console.log(`In addBet: bet made by ${seat.getName()} at index ${seat.index}, current bettor is ${this.seatIndex} for amount ${totalBetAmount}, currentBet = ${this.currentBet}, lastLiveBet = ${this.lastLiveBet}, seatIndexInitiatingAction = ${this.seatIndexInitiatingAction}`);

        
        if (!seat || !seat.player) {

            return new Bet(false, 0, 0, false, Bet.INVALID, "There is no player in that seat");

        }

        if (!seat.hand) {

            return new Bet(false, 0, 0, false, Bet.INVALID, "You are not in the hand");

        }

        if (this.seatIndex != seat.index) {

            return new Bet(false, 0, 0, false, Bet.INVALID, "It is not your turn to act");

        }

        // If there is no bet specified, then have it be 0.00
        totalBetAmount = totalBetAmount || 0;

        if (totalBetAmount < 0) {

            return new Bet(false, 0, 0, false, Bet.INVALID, "You cannot be a negative amount");

        }


        let playerCurrentBet: number = this.getCurrentBet(seat.index);

        if (totalBetAmount < playerCurrentBet) {

            return new Bet(false, playerCurrentBet, 0, false, Bet.INVALID, 'You cannot reduce your bet');

        }

        // If they tried to bet more than they have, then reduce it to an all-in
        totalBetAmount = Math.min(totalBetAmount, playerCurrentBet + seat.player.chips);

        let chipsRequired: number = totalBetAmount - playerCurrentBet;

        // See how many chips they would have left if they made this bet
        let chipsRemaining: number = seat.player.chips - chipsRequired;

        // they have to have put in some chips with this bet to get marked as all-in. If they were previously all-in
        // and they're not putting in any chips this round, then don't mark them all-in again
        let isAllIn: boolean = (chipsRemaining === 0) && (chipsRequired > 0);

        let betType: number = null;

        if (totalBetAmount < this.currentBet) {

            if (chipsRemaining > 0) {

                // They are trying to bet less than the current, but they still have chips left
                return new Bet(false, 0, 0, false, Bet.INVALID, 'You cannot bet less than the current bet');

            }

            betType = Bet.CALL;

        }

        else if (totalBetAmount > this.currentBet) {

            if (totalBetAmount < this.lastLiveBet + minimumBet) {

                if (chipsRemaining > 0) {

                    // They are trying to raise less than the minimum amount, but they still have chips left
                    return new Bet(false, 0, 0, false, Bet.INVALID, `You cannot ${(this.currentBet == 0 ? 'bet' : 'raise')} less than the minimum`);

                }

                if (this.currentBet === 0) {

                    // If there is no existing bet, then this functions as an opening bet, and resets the first actor and the last "live" bet
                    this.seatIndexInitiatingAction = seat.index;
                    this.lastLiveBet = totalBetAmount;
                    this.currentBet = totalBetAmount;
                    betType = Bet.OPEN;

                }
                else {

                    // We are raising the current amount, but NOT the lastLiveAmount since it is a dead raise
                    this.currentBet = totalBetAmount;
                    betType = Bet.DEAD_RAISE;

                }


            }
            else {

                // They have bet/raise at least the mininum, so mark them as the new betting actor
                this.seatIndexInitiatingAction = seat.index;

                betType = this.currentBet === 0 ? Bet.OPEN : Bet.RAISE;

                // This is a live bet/raise, so update both metrics
                this.currentBet = totalBetAmount;
                this.lastLiveBet = totalBetAmount;

            }

        }

        else {

            betType = this.currentBet === 0 ? Bet.CHECK : Bet.CALL;

        }

        seat.player.chips -= chipsRequired;

        if (totalBetAmount > 0) {

            this.bets[seat.index] = totalBetAmount;

        }

        // console.log(`BetType is ${betType}`);

        if (this.seatIndexInitiatingAction == null) {
            this.seatIndexInitiatingAction = seat.index;
        }

        return new Bet(true, totalBetAmount, chipsRequired, isAllIn, betType, null);

    }   // addBet


    private createPot(): Pot {

        this.pots.push(new Pot(this.pots.length));

        return this.pots[this.pots.length - 1];

    }


    public gatherBets(): void {

        if (Object.keys(this.bets).length === 0) {

            // No bets to gather. Dump out or we will create extra pots because people from the last one are not in the "no-bets" round
            return;
        }

        let pot = null;

        if (this.pots.length == 0) {

            pot = this.createPot();

        }
        else {
            pot = this.pots[this.pots.length - 1];
        }

        // Everyone still betting should be active in the most recent pot, but it's not necessarily true
        // that everyone in the most recent pot should also be in this one
        let needsNew = false;

        for (let previousBettorIndex of pot.getSeatsInPot()) {
            if ((this.getCurrentBet(previousBettorIndex)) === 0) {
                needsNew = true;
                break;
            }
        }

        if (needsNew) {

            // Create a new pot because someone in the last pot is not in this round of betting
            pot = this.createPot();

        }

        let done: boolean = false;

        while (!done) {

            let smallestBet = Number.MAX_VALUE;

            for (let amount of Object.values(this.bets)) {

                smallestBet = Math.min(smallestBet, amount);

            }

            done = true;

            // TODO: Clean this up - we shouldn't need to parse the seatIndex from a string to number
            for (let seatIndex of Object.keys(this.bets)) {

                pot.addChips(smallestBet, seatIndex);
                this.bets[seatIndex] = this.bets[seatIndex] - smallestBet;

                if ((this.getCurrentBet(parseInt(seatIndex, 10))) > 0) {

                    done = false;

                }
                else {
                    delete this.bets[seatIndex];
                }

            }

            if (!done) {

                // Create a new side pot - it will become the active pot to which bets get added
                pot = this.createPot();

            }

        }   // while !done

        this.clearBets();

    }   // gatherBets


    // Removes specified pots safely - no deleting while iterating issues
    public killPots(potIndexesToKill: Set<number>): void {

        this.pots = this.pots.filter(pot => !potIndexesToKill.has(pot.index));

    }   // killPots

}