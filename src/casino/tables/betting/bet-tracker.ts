import { Pot } from "./pot";
import { Seat } from "../seat";
import { Bet } from "./bet";
import { Fold } from "./fold";

export class BetTracker {


    public seatIndex: number;
    public seatIndexesRemainToAct: number[];

    public lastLiveBet: number;
    public currentBet: number;

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

        return `[BetTracker, seatIndex: ${this.seatIndex}, lastLiveBet: ${this.lastLiveBet}, currentBet: ${this.currentBet} ]`;

    }


    public getBets(): Bet[] {

        return Object.values(this.bets);

    }  // getBets


    public reset(): void {

        this.pots.length = 0;
        this.clearBets();

    }

    public clearBettorsToAct(): void {

        this.seatIndexesRemainToAct.length = 0;

    }

    public clearBets(): void {

        this.clearBettorsToAct();

        for (const prop of Object.getOwnPropertyNames(this.bets)) {
            delete this.bets[prop];
        }

        this.currentBet = this.lastLiveBet = 0;
        this.seatIndex = null;

    }   // clearBets


    public getNextBettorIndex(): number {

        return this.seatIndexesRemainToAct.shift();
          
    }   // getNextBetterIndex



    public isCheckAllowed(seatIndex: number): boolean {

        // TODO: what about if the player has already checked?
        // TODO: what about big blind options?
        // TODO: what about straddles?
        return this.currentBet == 0;

    }

    public getAmountToCall(seatIndex: number): number {

        // TODO: calculate less if the player has fewer chips than necessary
        return this.currentBet - this.getCurrentBet(seatIndex);

    }

    public getMinimumBet(seatIndex: number): number {

        return this.currentBet + 100;

    }  // getMinimumBet


    public getMaximumBet(seatIndex: number): number {

        // TODO: Limit vs No-Limit
        if (this.currentBet == this.getCurrentBet(seatIndex)) {

            return this.currentBet;

        }

        return this.currentBet + 100;

    }  // getMaximumBet


    public fold(seat: Seat): Fold {

        if (!seat) {

            return new Fold(false, "Invalid seat");

        }

        if (!seat.isInHand) {

            return new Fold(false, "You do not have a hand");

        }

        if (this.seatIndex != seat.index) {

            return new Fold(false, "It is not your turn to act");

        }

        // Remove the player from all pots up to this point
        for (let pot of this.pots) {
            pot.foldPlayer(seat.index);
        }

        return new Fold(true, null);

    }   // fold


    public getCurrentBet(seatIndex: number): number {

        return this.bets[seatIndex] ? this.bets[seatIndex].totalBet : 0;

    }

    public setAnte(anteAmount: number): void {

        // This will ensure that no-one can submit an ante less than the valid amount, unless they are all-in
        this.currentBet = anteAmount;

    }




    public addBet(seat: Seat, betType: number, totalBetAmount: number, minimumBet: number): Bet {

        // console.log(`In addBet: bet made by ${seat.getName()} at index ${seat.index}, current bettor is ${this.seatIndex} for amount ${totalBetAmount}, currentBet = ${this.currentBet}, lastLiveBet = ${this.lastLiveBet}, seatIndexInitiatingAction = ${this.seatIndexInitiatingAction}`);

        
        if (!seat || !seat.player) {

            return new Bet(false, seat.index, 0, 0, false, betType, Bet.ACTION.INVALID, "There is no player in that seat");

        }

        if (!seat.isInHand) {

            return new Bet(false, seat.index, 0, 0, false, betType, Bet.ACTION.INVALID, "You are not in the hand");

        }

        if (this.seatIndex != seat.index) {

            return new Bet(false, seat.index, 0, 0, false, betType, Bet.ACTION.INVALID, "It is not your turn to act");

        }

        // If there is no bet specified, then have it be 0.00
        totalBetAmount = totalBetAmount || 0;

        if (totalBetAmount < 0) {

            return new Bet(false, seat.index, 0, 0, false, betType, Bet.ACTION.INVALID, "You cannot be a negative amount");

        }

        let playerCurrentBet: number = this.getCurrentBet(seat.index);

        if (totalBetAmount < playerCurrentBet) {

            return new Bet(false, seat.index, playerCurrentBet, 0, false, betType, Bet.ACTION.INVALID, 'You cannot reduce your bet');

        }

        // If they tried to bet more than they have, then reduce it to an all-in
        totalBetAmount = Math.min(totalBetAmount, playerCurrentBet + seat.player.chips);

        let chipsRequired: number = totalBetAmount - playerCurrentBet;

        // See how many chips they would have left if they made this bet
        let chipsRemaining: number = seat.player.chips - chipsRequired;

        // they have to have put in some chips with this bet to get marked as all-in. If they were previously all-in
        // and they're not putting in any chips this round, then don't mark them all-in again
        let isAllIn: boolean = (chipsRemaining === 0) && (chipsRequired > 0);

        let actionType: number = null;
        let raisesAction = false;

        if (totalBetAmount == 0 && this.currentBet > 0) {

            // They are trying to bet less than the current, but they still have chips left
            return new Bet(false, seat.index, 0, 0, false, betType, Bet.ACTION.INVALID, 'You cannot bet less than the current bet');

        }

        if (totalBetAmount < this.currentBet) {

            if (chipsRemaining > 0) {

                // They are trying to bet less than the current, but they still have chips left
                return new Bet(false, seat.index, 0, 0, false, betType, Bet.ACTION.INVALID, 'You cannot bet less than the current bet');

            }

            actionType = Bet.ACTION.CALL;

        }

        else if (totalBetAmount > this.currentBet) {

            if (totalBetAmount < this.lastLiveBet + minimumBet) {

                if (chipsRemaining > 0) {

                    // They are trying to raise less than the minimum amount, but they still have chips left
                    return new Bet(false, seat.index, 0, 0, false, betType, Bet.ACTION.INVALID, `You cannot ${(this.currentBet == 0 ? 'bet' : 'raise')} less than the minimum`);

                }

                if (this.currentBet === 0) {

                    this.lastLiveBet = totalBetAmount;
                    this.currentBet = totalBetAmount;
                    actionType = Bet.ACTION.OPEN;

                }
                else {

                    // We are raising the current amount, but NOT the lastLiveAmount since it is a dead raise
                    this.currentBet = totalBetAmount;
                    actionType = Bet.ACTION.RAISE;

                }


            }
            else {

                actionType = this.currentBet === 0 ? Bet.ACTION.OPEN : Bet.ACTION.RAISE;

                // This is a live bet/raise, so update both metrics
                this.currentBet = totalBetAmount;
                this.lastLiveBet = totalBetAmount;

                raisesAction = true;


            }

        }

        else {

            actionType = this.currentBet === 0 ? Bet.ACTION.CHECK : Bet.ACTION.CALL;

        }

        seat.player.chips -= chipsRequired;

        let bet = new Bet(true, seat.index, totalBetAmount, chipsRequired, isAllIn, betType, actionType, null);
        bet.raisesAction = raisesAction;

        this.bets[seat.index] = bet;

        return bet;

    }   // addBet


    private createPot(): Pot {

        this.pots.push(new Pot(this.pots.length));

        return this.pots[this.pots.length - 1];

    }


    public checkBetsToReturn(): Array<Bet> {

        // We are going to determine whether any player has bet more than everyone else - if so, they'll get their bet reduced by the overage

        let returnedBets: Array<Bet> = new Array<Bet>();

        // Put the bets in descending order of size
        let rankedBets: Array<Bet> = Object.values(this.bets).sort((b1: Bet, b2: Bet) => b2.totalBet - b1.totalBet);

        if (rankedBets.length == 0) {

            // No bets at all, so nothing needs to be given back

        }

        else if (rankedBets[0].totalBet === 0) {

            // The biggest bet was 0, so nothing to give back

        }

        else if (rankedBets.length === 1) {

            // There was only one bet, and we know it wasn't 0, so they get it back
            returnedBets.push(new Bet(true, rankedBets[0].seatIndex, rankedBets[0].totalBet, 0, false, Bet.TYPE.RETURNED, Bet.ACTION.REGULAR, 'Returned bet'));

            // Take their bet entirely off the table
            delete this.bets[rankedBets[0].seatIndex];

        }

        else if (rankedBets[1].totalBet === 0) {

            // There was a non-zero bet, and the next largest was 0 (must have been a check), so they get it back
            returnedBets.push(new Bet(true, rankedBets[0].seatIndex, rankedBets[0].totalBet, 0, false, Bet.TYPE.RETURNED, Bet.ACTION.REGULAR, 'Returned bet'));

            // Take their bet entirely off the table
            delete this.bets[rankedBets[0].seatIndex];

        }

        else if (rankedBets[0].totalBet === rankedBets[1].totalBet) {

            // the two largest bets match, so nothing to give back

        }

        else {

            // The biggest bet is larger than the second biggest, so they get their bet reduced  (but some of it remains to match the 2nd biggest)
            let difference: number = rankedBets[0].totalBet - rankedBets[1].totalBet;
            returnedBets.push(new Bet(true, rankedBets[0].seatIndex, difference, 0, false, Bet.TYPE.RETURNED, Bet.ACTION.REGULAR, 'Reduced bet'));

            // This is still pointing at the original actual bet, so just reduce it by the proper amount
            rankedBets[0].totalBet -= difference;

        }

        return returnedBets;

    } // checkBetsToReturn



    public gatherBets(seatIndexesStillInHand: Set<number>): void {

        this.seatIndex = null;

        if (!Object.values(this.bets).find(bet => bet.totalBet > 0)) {

            // No bets greater than 0 to gather. Dump out or we will create extra pots because people from the last one are not in the "no-bets" round
            return;

        }

        // Find the most recent pot, or create one, if necessary
        let pot = this.pots.length == 0 ? this.createPot() : this.pots[this.pots.length - 1];

        // If there is only one player left in the pot, then just put them money in there
        // We have already checked at this point for bets that need to be returned.
        if (seatIndexesStillInHand.size === 1) {

            for (let seatIndex of Object.keys(this.bets)) {

                // the seatIndex is actually a number, but used as a key it will always be a string, so we need to parse it out
                pot.addChips(parseInt(seatIndex, 10), this.bets[seatIndex].totalBet);
                delete this.bets[seatIndex];

            }

            return;
        }

        let done: boolean = false;

        while (!done) {

            done = true;

            // Remove any bet that is just 0 at this point
            for (let seatIndex of Object.keys(this.bets)) {

                if (this.bets[seatIndex].totalBet == 0) {

                    delete this.bets[seatIndex];

                }

            }

            // If there is anyone in the current pot that is still active in the hand and has not put in a bet, then we need to create a new, split pot
            let needsNew: boolean = false;

            for (let seatIndexInPot of pot.getSeatsInPot()) {

                if ((this.getCurrentBet(seatIndexInPot)) === 0 && seatIndexesStillInHand.has(seatIndexInPot)) {

                    // we have non-zero bets in this pot, but this person didn't put in anything, and they are still in the hand (so all-in).
                    // If they put some into the last pot, but nothing into this one, then they just folded, and we don't need a side pot
                    needsNew = true;
                    break;
                }

            }

            if (needsNew) {

                // Create a new pot because someone in the last pot is not in this round of betting
                pot = this.createPot();

            }

            let smallestActiveBet: number = Number.MAX_VALUE;
            let largestActiveBet: number = Number.MIN_VALUE;

            for (let bet of Object.values(this.bets)) {

                if (seatIndexesStillInHand.has(bet.seatIndex)) {

                    if (bet.totalBet < smallestActiveBet) {

                        smallestActiveBet = bet.totalBet;

                    }

                    if (bet.totalBet > largestActiveBet) {

                        largestActiveBet = bet.totalBet;

                    }

                }

            }


            // If anyone has a bet that must be larger than 0, but smaller than the largest bet, then slice those out
            for (let seatIndex of Object.keys(this.bets)) {

                // only take the amount of the smallest bet. It might be from this seat (and thus their entire bet), or it might
                // be someone else that has the smallest, but we don't to put in more for this better than the other all-in person put in
                let amountToContribute: number = Math.min(this.bets[seatIndex].totalBet, smallestActiveBet);

                // iterating object keys will always give strings, but these are actually numbers
                pot.addChips(parseInt(seatIndex, 10), amountToContribute);


                this.bets[seatIndex].totalBet -= amountToContribute;

            }

            // Someone didn't put in the full amount, we're going to have a split pot
            if (smallestActiveBet < largestActiveBet) {

                done = false;

                // Create a new side pot - it will become the active pot to which the remaining bets get added
                pot = this.createPot();

            }

        }   // while !done

        this.clearBets();

    }   // gatherBets


    // Removes specified pots safely - no deleting while iterating issues
    public killPots(potIndexesToKill: Set<number>): void {

        this.pots = this.pots.filter(pot => !potIndexesToKill.has(pot.index));

    }   // killPots


    public calculateSeatIndexesRemainToAct(seats: Seat[], possibleStartingIndex: number, lastPossibleIndex: number): void {

        // Go through the rest of the players at the table and see whether or not they need to take an action
        let seatsToAct = [];

        if (seats.length) {

            while (possibleStartingIndex >= seats.length) {
                possibleStartingIndex -= seats.length;
            }

            while (lastPossibleIndex < 0) {
                lastPossibleIndex += seats.length;
            }

            let done: boolean = false;
            let ix: number = possibleStartingIndex;

            while (!done) {

                if (seats[ix] && seats[ix].isInHand && seats[ix].player && seats[ix].player.chips > 0) {

                    seatsToAct.push(ix);

                }

                if (ix == lastPossibleIndex) {
                    done = true;
                }
                else {

                    ix++;

                    if (ix >= seats.length) {
                        ix = 0;
                    }

                }   // keep going

            }  // !done

        }   // seats.length > 0


        this.seatIndexesRemainToAct = [...seatsToAct];

    }  // calculateSeatIndexesRemainToAct


}