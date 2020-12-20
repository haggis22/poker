import { Pot } from "./pot";
import { Seat } from "../seat";
import { Bet } from "./bet";
import { Fold } from "./fold";
import { BetStatus } from "./bet-status";
import { Table } from "../table";
import { AnteState } from "../states/betting/ante-state";
import { BetState } from "../states/betting/bet-state";
import { BlindState } from "../states/betting/blind-state";
import { Stakes } from "./stakes";

export class BetController {


    constructor() {
    }


    private log(message: string): void {

        console.log('\x1b[31m%s\x1b[0m', `BetController ${message}`);

    }


    public reset(status: BetStatus): void {

        status.bettingRound = 0;
        status.pots.length = 0;

        this.clearBets(status);

    }

    public clearBettorsToAct(status: BetStatus): void {

        status.seatIndexesRemainToAct.length = 0;

    }

    public clearBets(status: BetStatus): void {

        this.clearBettorsToAct(status);

        for (const prop of Object.getOwnPropertyNames(status.bets)) {
            delete status.bets[prop];
        }

        status.currentBet = status.lastLiveBet = 0;
        status.seatIndex = null;

    }   // clearBets


    public increaseBettingRound(status: BetStatus): void {

        status.bettingRound++;

    }  // increaseBettingRound


    public getNextBettorIndex(status: BetStatus): number {

        return status.seatIndexesRemainToAct.shift();

    }   // getNextBetterIndex




    public fold(status: BetStatus, seat: Seat): Fold {

        if (!seat) {

            return new Fold(false, "Invalid seat");

        }

        if (!seat.isInHand) {

            return new Fold(false, "You do not have a hand");

        }

        if (status.seatIndex != seat.index) {

            return new Fold(false, "It is not your turn to act");

        }

        // Remove the player from all pots up to this point
        for (let pot of status.pots) {
            pot.foldPlayer(seat.index);
        }

        return new Fold(true, null);

    }   // fold


    public getCurrentBet(status: BetStatus, seatIndex: number): number {

        return status.bets[seatIndex] ? status.bets[seatIndex].totalBet : 0;

    }


    private takeBet(status: BetStatus, seat: Seat, betAmount: number, betType: number, actionType: number, raisesAction: boolean): Bet {

        betAmount = Math.min(betAmount, seat.player.chips);

        seat.player.chips -= betAmount;

        // they have to have put in some chips with this bet to get marked as all-in. If they were previously all-in
        // and they're not putting in any chips this round, then don't mark them all-in again
        let isAllIn: boolean = (seat.player.chips === 0) && (betAmount > 0);

        let totalBetAmount: number = this.getCurrentBet(status, seat.index) + betAmount;

        let bet = new Bet(true, seat.index, totalBetAmount, betAmount, isAllIn, betType, actionType, null);
        bet.raisesAction = raisesAction;

        status.bets[seat.index] = bet;

        if (totalBetAmount > status.currentBet) {
            status.currentBet = totalBetAmount;
        }

        this.log(`Bet: seatIndex: ${seat.index}, chips: ${seat.player.chips}, betAmount: ${betAmount}, betType: ${betType}, actionType: ${actionType}, raisesAction: ${raisesAction}`);


        return bet;

    }


    private doesPlayerHaveChipsInPotAlready(betStatus: BetStatus, seatIndex: number): boolean {

        for (let pot of betStatus.pots) {
            if (pot.isSeatInPot(seatIndex)) {
                return true;
            }
        }

        return false;

    }   // doesPlayerHaveChipsInPotAlready



    public validateAnte(table: Table, seat: Seat): Bet {

        if (table.state instanceof AnteState) {

            if (!seat.isInHand) {

                return new Bet(false, seat.index, 0, 0, false, Bet.TYPE.ANTE, Bet.TYPE.INVALID, 'You are not in the hand');

            }

            if (table.betStatus.seatIndex != seat.index) {

                return new Bet(false, seat.index, 0, 0, false, Bet.TYPE.ANTE, Bet.ACTION.INVALID, "It is not your turn to act");

            }

            if (table.stakes.ante == 0) {

                // If there is no ante, then just force a check
                return new Bet(true, seat.index, 0, 0, false, Bet.TYPE.ANTE, Bet.ACTION.CHECK, null);

            }

            if (seat.player.chips === 0) {

                return new Bet(false, seat.index, 0, 0, false, Bet.TYPE.ANTE, Bet.TYPE.INVALID, 'You do not have any chips to ante');

            }

            return this.takeBet(table.betStatus, seat, table.stakes.ante, Bet.TYPE.ANTE, Bet.ACTION.CALL, false);

        }
        else {

            return new Bet(false, seat.index, 0, 0, false, Bet.TYPE.ANTE, Bet.TYPE.INVALID, 'It is not time to ante');

        }

    }  // validateAnte


    public validateBlind(table: Table, seat: Seat, blindPosition: number): Bet {

        if (table.state instanceof BlindState) {

            if (!seat.isInHand) {

                return new Bet(false, seat.index, 0, 0, false, Bet.TYPE.BLIND, Bet.TYPE.INVALID, 'You are not in the hand');

            }

            if (table.betStatus.seatIndex != seat.index) {

                return new Bet(false, seat.index, 0, 0, false, Bet.TYPE.BLIND, Bet.ACTION.INVALID, "It is not your turn to act");

            }

            if (table.stakes.blinds.length == 0) {

                // If there is no blind, then just force a check
                return new Bet(true, seat.index, 0, 0, false, Bet.TYPE.BLIND, Bet.ACTION.CHECK, null);

            }

            // anyone posting a big blind after the big blind just posts the same amount as the largest blind
            blindPosition = Math.min(table.stakes.blinds.length, blindPosition);

            let blindAmount: number = table.stakes.blinds[blindPosition];

            if (blindAmount == 0) {

                // If there is no blind, then just force a check
                return new Bet(true, seat.index, 0, 0, false, Bet.TYPE.BLIND, Bet.ACTION.CHECK, null);

            }

            if (seat.player.chips === 0 && !this.doesPlayerHaveChipsInPotAlready(table.betStatus, seat.index)) {

                return new Bet(false, seat.index, 0, 0, false, Bet.TYPE.ANTE, Bet.TYPE.INVALID, 'You do not have any chips to pay the blind');

            }

            return this.takeBet(table.betStatus, seat, blindAmount, Bet.TYPE.BLIND, Bet.ACTION.CALL, false);

        }
        else {

            return new Bet(false, seat.index, 0, 0, false, Bet.TYPE.ANTE, Bet.TYPE.INVALID, 'It is not time to pay blinds');

        }

    }  // validateBlind


    public calculateCall(table: Table, seat: Seat): number {

        return Math.min(seat.player.chips, table.betStatus.currentBet - this.getCurrentBet(table.betStatus, seat.index));

    }  // calculateCall


    public calculateMinimumLiveRaise(table: Table, seat: Seat): number {

        // the minimum bump for both limit and no-limit is the size of the bet for the round
        let minRaiseTotal: number = table.betStatus.currentBet + table.stakes.bets[table.betStatus.bettingRound - 1];

        let chipsToRaise: number = minRaiseTotal - this.getCurrentBet(table.betStatus, seat.index);

        // If they don't have enough chips to actually meet this minimum live raise then return undefined - this will 
        // indicate that a live raise is not even possible
        return chipsToRaise > seat.player.chips ? undefined : chipsToRaise;

    }


    public calculateMinimumRaise(table: Table, seat: Seat): number {

        if (seat.player.chips === this.calculateCall(table, seat)) {

            // They only have enough chips to call - none extra to raise
            return undefined;
        }

        let raiseTotal: number = table.betStatus.currentBet + table.stakes.bets[table.betStatus.bettingRound - 1];

        // How many chips would they need to put in to meet that raise total?
        let chipsToRaise: number = raiseTotal - this.getCurrentBet(table.betStatus, seat.index);

        // At this point we know they have more chips than are necessary for a flat call, if they put in everything then it is a raise
        return Math.min(seat.player.chips, chipsToRaise);

    }


    public calculateMaximumRaise(table: Table, seat: Seat): number {

        if (table.stakes.limit === Stakes.LIMIT) {
            return this.calculateMinimumRaise(table, seat);
        }

        let minRaise: number = this.calculateMinimumRaise(table, seat);
        if (minRaise === undefined) {
            return undefined;
        }

        // if they have more chips than the min raise, then that is their max possibility
        return Math.max(minRaise, seat.player.chips);

    }


    public validateBet(table: Table, seat: Seat, amount: number): Bet {

        if (table.state instanceof BetState) {

            if (!seat.isInHand) {

                return new Bet(false, seat.index, 0, 0, false, Bet.TYPE.REGULAR, Bet.TYPE.INVALID, 'You are not in the hand');

            }

            if (table.betStatus.seatIndex != seat.index) {

                return new Bet(false, seat.index, 0, 0, false, Bet.TYPE.REGULAR, Bet.ACTION.INVALID, "It is not your turn to act");

            }

            // If there is no bet specified, then have it be 0.00
            amount = amount || 0;

            if (amount < 0) {

                return new Bet(false, seat.index, 0, 0, false, Bet.TYPE.REGULAR, Bet.ACTION.INVALID, "You cannot be a negative amount");

            }

            if (amount > seat.player.chips) {

                return new Bet(false, seat.index, 0, 0, false, Bet.TYPE.REGULAR, Bet.ACTION.INVALID, "You cannot bet more than you have");

            }

            let amountToCall: number = this.calculateCall(table, seat);
            this.log(`   amountToCall: ${amountToCall}`);

            // amountToCall will take the fact that the player does not have enough chips into account and will allow a "call for less"
            if (amount < amountToCall) {

                return new Bet(false, seat.index, 0, 0, false, Bet.TYPE.REGULAR, Bet.ACTION.INVALID, `You must put in at least ${amountToCall}`);

            }

            if (amount == amountToCall) {

                let betAction: number = amount === 0 ? Bet.ACTION.CHECK : Bet.ACTION.CALL;

                return this.takeBet(table.betStatus, seat, amount, Bet.TYPE.REGULAR, betAction, false);

            }

            let minimumLiveRaise: number = this.calculateMinimumLiveRaise(table, seat);
            let minimumBet: number = this.calculateMinimumRaise(table, seat);
            let maximumBet: number = this.calculateMaximumRaise(table, seat);

            // If we've made it here, then the player must be betting/raising, so first make sure it is not too much
            if (amount > maximumBet) {

                this.log(`Invalid bet: seatIndex: ${seat.index}, chips: ${seat.player.chips}, maxBet: ${maximumBet}, bet amount: ${amount}`);
                return new Bet(false, seat.index, 0, 0, false, Bet.TYPE.REGULAR, Bet.ACTION.INVALID, "Bet is over the maximum");

            }

            // If we've made it here, then the player must be betting/raising, so first make sure it is not too much
            if (amount < minimumBet) {

                this.log(`Invalid bet: seatIndex: ${seat.index}, chips: ${seat.player.chips}, maxBet: ${minimumBet}, bet amount: ${amount}`);
                return new Bet(false, seat.index, 0, 0, false, Bet.TYPE.REGULAR, Bet.ACTION.INVALID, "Bet is under the maximum");

            }

            let actionType: number = table.betStatus.currentBet === 0 ? Bet.ACTION.OPEN : Bet.ACTION.RAISE;
            let raisesAction: boolean = amount >= minimumLiveRaise;

            return this.takeBet(table.betStatus, seat, amount, Bet.TYPE.REGULAR, actionType, raisesAction);

        }
        else {

            return new Bet(false, seat.index, 0, 0, false, Bet.TYPE.BET, Bet.TYPE.INVALID, 'It is not time to bet');

        }

    }   // validateBet


    private createPot(status: BetStatus): Pot {

        status.pots.push(new Pot(status.pots.length));

        return status.pots[status.pots.length - 1];

    }


    public checkBetsToReturn(status: BetStatus): Array<Bet> {

        // We are going to determine whether any player has bet more than everyone else - if so, they'll get their bet reduced by the overage

        let returnedBets: Array<Bet> = new Array<Bet>();

        // Put the bets in descending order of size
        let rankedBets: Array<Bet> = Object.values(status.bets).sort((b1: Bet, b2: Bet) => b2.totalBet - b1.totalBet);

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
            delete status.bets[rankedBets[0].seatIndex];

        }

        else if (rankedBets[1].totalBet === 0) {

            // There was a non-zero bet, and the next largest was 0 (must have been a check), so they get it back
            returnedBets.push(new Bet(true, rankedBets[0].seatIndex, rankedBets[0].totalBet, 0, false, Bet.TYPE.RETURNED, Bet.ACTION.REGULAR, 'Returned bet'));

            // Take their bet entirely off the table
            delete status.bets[rankedBets[0].seatIndex];

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



    public gatherBets(status: BetStatus, seatIndexesStillInHand: Set<number>): void {

        status.seatIndex = null;

        if (Object.values(status.bets).every(bet => bet.totalBet === 0)) {

            // No bets greater than 0 to gather. Dump out or we will create extra pots because people from the last one are not in the "no-bets" round
            return;

        }

        // Find the most recent pot, or create one, if necessary
        let pot = status.pots.length == 0 ? this.createPot(status) : status.pots[status.pots.length - 1];

        // this.log(`Bets: [ ${Object.keys(status.bets).map(seatIndex => '(Seat ' + seatIndex + ': ' + status.bets[seatIndex] + ')').join("  ")}`);

        // If there is only one player left in the pot, then just put them money in there
        // We have already checked at this point for bets that need to be returned.
        if (seatIndexesStillInHand.size === 1) {

            for (let seatIndex of Object.keys(status.bets)) {

                // the seatIndex is actually a number, but used as a key it will always be a string, so we need to parse it out
                pot.addChips(parseInt(seatIndex, 10), status.bets[seatIndex].totalBet);
                delete status.bets[seatIndex];

            }

            return;
        }

        let done: boolean = false;

        while (!done) {

            done = true;

            // Remove any bet that is just 0 at this point
            for (let seatIndex of Object.keys(status.bets)) {

                if (status.bets[seatIndex].totalBet == 0) {

                    delete status.bets[seatIndex];

                }

            }

            // If there is anyone in the current pot that is still active in the hand and has not put in a bet, then we need to create a new, split pot
            let needsNew: boolean = false;

            for (let seatIndexInPot of pot.getSeatsInPot()) {

                if ((this.getCurrentBet(status, seatIndexInPot)) === 0 && seatIndexesStillInHand.has(seatIndexInPot)) {

                    // we have non-zero bets in this pot, but this person didn't put in anything, and they are still in the hand (so all-in).
                    // If they put some into the last pot, but nothing into this one, then they just folded, and we don't need a side pot
                    needsNew = true;
                    break;
                }

            }

            if (needsNew) {

                // Create a new pot because someone in the last pot is not in this round of betting
                pot = this.createPot(status);

            }

            let smallestActiveBet: number = Number.MAX_VALUE;
            let largestActiveBet: number = Number.MIN_VALUE;

            for (let bet of Object.values(status.bets)) {

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
            for (let seatIndex of Object.keys(status.bets)) {

                // only take the amount of the smallest bet. It might be from this seat (and thus their entire bet), or it might
                // be someone else that has the smallest, but we don't to put in more for this better than the other all-in person put in
                let amountToContribute: number = Math.min(status.bets[seatIndex].totalBet, smallestActiveBet);

                // iterating object keys will always give strings, but these are actually numbers
                pot.addChips(parseInt(seatIndex, 10), amountToContribute);


                status.bets[seatIndex].totalBet -= amountToContribute;

            }

            // Someone didn't put in the full amount, we're going to have a split pot
            if (smallestActiveBet < largestActiveBet) {

                done = false;

                // Create a new side pot - it will become the active pot to which the remaining bets get added
                pot = this.createPot(status);

            }

        }   // while !done

        this.clearBets(status);

    }   // gatherBets


    // Removes specified pots safely - no deleting while iterating issues
    public killPots(status: BetStatus, potIndexesToKill: Set<number>): void {

        status.pots = status.pots.filter(pot => !potIndexesToKill.has(pot.index));

    }   // killPots


    public calculateSeatIndexesRemainToAct(status: BetStatus, seats: Seat[], possibleStartingIndex: number, lastPossibleIndex: number): void {

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

            console.log(`BETTRACKER: calculateSeatIndexesRemainToAct possibleStartingIndex: ${possibleStartingIndex}, lastPossibleIndex: ${lastPossibleIndex}, numSeats: ${seats.length}`);

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

            console.log(`BETTRACKER: calculateSeatIndexesRemainToAct seatsToAct: [ ${seatsToAct.join("  ")} ]`);


        }   // seats.length > 0


        status.seatIndexesRemainToAct = [...seatsToAct];

    }  // calculateSeatIndexesRemainToAct


}