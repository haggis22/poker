﻿import { Pot } from "./pot";
import { Seat } from "../seat";
import { Bet } from "./bet";
import { Fold } from "./fold";
import { BetStatus } from "./bet-status";
import { Table } from "../table";
import { BlindsAndAntesState } from "../states/betting/blinds-and-antes-state";
import { BetState } from "../states/betting/bet-state";
import { Stakes } from "./stakes";
import { Blind } from "./blind";
import { Ante } from "./ante";
import { InvalidBet } from "./invalid-bet";
import { InvalidFold } from "./invalid-fold";

export class BetController {


    constructor() {
    }


    private log(message: string): void {

        console.log('\x1b[31m%s\x1b[0m', `BetController ${message}`);

    }


    public reset(status: BetStatus): void {

        status.bettingRound = 0;
        status.pots.length = 0;
        status.bigBlindIndex = null;

        this.clearBets(status);

    }

    public clearBettorsToAct(status: BetStatus): void {

        status.seatIndexesRemainToAct.length = 0;

    }


    private clearRequiredBets(status: BetStatus): void {

        for (let seatIndex in status.requiredBets)
        {
            delete status.requiredBets[seatIndex];
        }

    }


    public clearBets(status: BetStatus): void {

        this.clearBettorsToAct(status);

        for (const prop of Object.getOwnPropertyNames(status.bets)) {
            delete status.bets[prop];
        }

        status.currentBet = status.lastLiveBet = status.lastLiveRaise = status.numRaises = 0;
        status.seatIndex = null;

    }   // clearBets


    public increaseBettingRound(status: BetStatus): void {

        status.bettingRound++;

    }  // increaseBettingRound


    public getNextBettorIndex(status: BetStatus): number {

        return status.seatIndexesRemainToAct.shift();

    }   // getNextBetterIndex




    public fold(status: BetStatus, seat: Seat): InvalidFold | Fold {

        if (!seat) {

            return new InvalidFold("Invalid seat");

        }

        if (!seat.isInHand) {

            return new InvalidFold("You do not have a hand");

        }

        if (status.seatIndex != seat.index) {

            return new InvalidFold("It is not your turn to act");

        }

        // Remove the player from all pots up to this point
        for (let pot of status.pots) {
            pot.foldPlayer(seat.index);
        }

        return new Fold();

    }   // fold


    public getCurrentBet(status: BetStatus, seatIndex: number): number {

        return status.bets[seatIndex] ? status.bets[seatIndex].totalBet : 0;

    }


    private takeBet(status: BetStatus, seat: Seat, betAmount: number, betType: number, actionType: number, raisesAction: boolean, raisesLiveAction: boolean): Bet {

        betAmount = Math.min(betAmount, seat.player.chips);

        seat.player.chips -= betAmount;

        let totalBetAmount: number = this.getCurrentBet(status, seat.index) + betAmount;

        let bet = new Bet(seat.index, totalBetAmount, betAmount, betType, actionType);
        bet.raisesAction = raisesAction;

        if (raisesAction) {

            status.numRaises++;

        }

        status.bets[seat.index] = bet;

        if (raisesLiveAction) {

            status.lastLiveRaise = totalBetAmount - status.currentBet;

            if (totalBetAmount > status.lastLiveBet) {
                status.lastLiveBet = totalBetAmount;
            }

        }

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



    public validateBlindsAndAnte(table: Table, seat: Seat): InvalidBet | Bet[] {

        if (table.state instanceof BlindsAndAntesState) {

            if (!seat.isInHand) {

                return new InvalidBet(seat.index, 'You are not in the hand');

            }

            if (table.betStatus.seatIndex != seat.index) {

                return new InvalidBet(seat.index, "It is not your turn to act");

            }

            if (seat.player.chips === 0) {

                return new InvalidBet(seat.index, 'You do not have any chips with which to ante or post blinds');

            }

            let betResults: Bet[] = new Array<Bet>();

            let requiredBets: Array<Blind| Ante> = table.betStatus.requiredBets[seat.index] || new Array<Blind | Ante>();

            for (let requiredBet of requiredBets) {

                if (requiredBet instanceof Ante) {

                    if (seat.player && seat.player.chips) {

                        let anteAmount: number = Math.min(requiredBet.amount, seat.player.chips);
                        seat.player.chips -= anteAmount;

                        let ante = new Bet(seat.index, anteAmount, anteAmount, Bet.TYPE.ANTE, Bet.ACTION.CALL);
                        table.betStatus.antes[seat.index] = ante;

                        betResults.push(ante);

                    }

                }
                else if (requiredBet instanceof Blind) {

                    if (seat.player && seat.player.chips) {

                        let blind: Bet = this.takeBet(table.betStatus, seat, requiredBet.amount, Bet.TYPE.BLIND, Bet.ACTION.CALL, false, false);

                        betResults.push(blind);

                    }

                }

            }  // for each requiredBet

            return betResults;

        }
        else {

            return new InvalidBet(seat.index, 'It is not time to ante');

        }

    }  // validateBlindsAndAnte





    public calculateCall(table: Table, seat: Seat): number {

        // If they don't have a seat, or chips then they can't call
        if (!seat || !seat.player || seat.player.chips === 0) {

            return null;

        }

        if (table.state instanceof BlindsAndAntesState) {

            // If we are ante-ing and the player still needs to act, then calculate the amount they need to put in
            if (table.stakes.ante > 0) {

                if (table.betStatus.seatIndex == seat.index || table.betStatus.doesSeatRemainToAct(seat.index)) {

                    return Math.min(seat.player.chips, table.stakes.ante);

                }

            }

        }
        else if (table.state instanceof BetState) {

            if (table.betStatus.seatIndex == seat.index || table.betStatus.doesSeatRemainToAct(seat.index)) {

                return Math.min(seat.player.chips, table.betStatus.currentBet - this.getCurrentBet(table.betStatus, seat.index));

            }

        }

        return null;


    }  // calculateCall


    public calculateMinimumLiveRaise(table: Table, seat: Seat, amountToCall?: number): number {

        // If they don't have chips then they can't call, much less raise
        if (!seat || !seat.player || seat.player.chips === 0) {
            return null;
        }

        // Next, check to see if we already have our maximum number of bets/raises. If there is a limit specified, and we've hit it, then no more raises are possible
        if (table.stakes.maxRaises != null && table.betStatus.numRaises >= table.stakes.maxRaises) {
            return null;
        }

        if (table.state instanceof BetState) {

            if (table.betStatus.seatIndex == seat.index || table.betStatus.doesSeatRemainToAct(seat.index)) {

                if (amountToCall === undefined) {
                    amountToCall = this.calculateCall(table, seat);
                }

                // If they can't call, then they can't raise
                if (amountToCall === null) {
                    return null;
                }

                if (seat.player.chips === amountToCall) {

                    // They only have enough chips to call - none extra to raise
                    return null;
                }

                // the minimum bump for both limit and no-limit is the size of the bet for the round
                // If anyone else has raised live, then our new raise must be at least that same amount
                let minRaiseAmount: number = Math.max(table.stakes.bets[table.betStatus.bettingRound - 1], table.betStatus.lastLiveRaise);

                // the live raise amount goes against the current betting amount, even if it was a dead raise
                // Source: http://neilwebber.com/notes/2013/07/25/the-most-misunderstood-poker-rule-nlhe-incomplete-raise-all-in/
                let minRaiseTotal: number = table.betStatus.currentBet + minRaiseAmount;

                let chipsToRaise: number = minRaiseTotal - this.getCurrentBet(table.betStatus, seat.index);

                // This is how many chips it would take to make it a live raise. This does NOT necessarily indicate that
                // the player has enough chips to make that live raise.
                return chipsToRaise;

            }  // it is (or soon will be) the player's turn to act

        }

        return null;

    }


    public calculateMinimumRaise(table: Table, seat: Seat, amountToCall?: number): number {

        let minimumLiveRaise: number = this.calculateMinimumLiveRaise(table, seat, amountToCall);

        if (minimumLiveRaise !== null) {

            return Math.min(seat.player.chips, minimumLiveRaise);

        }

        return null;

    }


    public calculateMaximumRaise(table: Table, seat: Seat, amountToCall?: number): number {

        let minRaise: number = this.calculateMinimumRaise(table, seat, amountToCall);
        if (minRaise === null) {
            return null;
        }

        if (table.stakes.limit === Stakes.LIMIT) {
            return minRaise;
        }

        // if they have more chips than the min raise, then that is their max possibility
        return Math.max(minRaise, seat.player.chips);

    }


    public validateBet(table: Table, seat: Seat, amount: number): Bet | InvalidBet {

        if (table.state instanceof BetState) {

            if (!seat.isInHand) {

                return new InvalidBet(seat.index, 'You are not in the hand');

            }

            if (table.betStatus.seatIndex != seat.index) {

                return new InvalidBet(seat.index, "It is not your turn to act");

            }

            // If there is no bet specified, then have it be 0.00
            amount = amount || 0;

            if (amount < 0) {

                return new InvalidBet(seat.index, "You cannot be a negative amount");

            }

            if (amount > seat.player.chips) {

                return new InvalidBet(seat.index, "You cannot bet more than you have");

            }

            let amountToCall: number = this.calculateCall(table, seat);
            this.log(`   amountToCall: ${amountToCall}`);

            // amountToCall will take the fact that the player does not have enough chips into account and will allow a "call for less"
            if (amount < amountToCall) {

                return new InvalidBet(seat.index, `You must put in at least ${amountToCall}`);

            }

            if (amount == amountToCall) {

                let betAction: number = amount === 0 ? Bet.ACTION.CHECK : Bet.ACTION.CALL;

                return this.takeBet(table.betStatus, seat, amount, Bet.TYPE.REGULAR, betAction, false, false);

            }

            let minimumBet: number = this.calculateMinimumRaise(table, seat, amountToCall);

            if (minimumBet === null) {

                this.log(`We should not be here - they are raising but the min raise is null: seatIndex: ${seat.index}, chips: ${seat.player.chips}, minBet: ${minimumBet}, bet amount: ${amount}`);
                throw new Error('Error calculating minimum raise');

            }

            let minimumLiveRaise: number = this.calculateMinimumLiveRaise(table, seat, amountToCall);
            let maximumBet: number = this.calculateMaximumRaise(table, seat, amountToCall);

            // If we've made it here, then the player must be betting/raising, so first make sure it is not too much
            // We know maximumBet will not be null if the minBet is not null
            if (amount > maximumBet) {

                this.log(`Invalid bet: seatIndex: ${seat.index}, chips: ${seat.player.chips}, maxBet: ${maximumBet}, bet amount: ${amount}`);
                return new InvalidBet(seat.index, "Bet is over the maximum");

            }

            // If we've made it here, then the player must be betting/raising, so first make sure it is not too much
            if (amount < minimumBet) {

                this.log(`Invalid bet: seatIndex: ${seat.index}, chips: ${seat.player.chips}, maxBet: ${minimumBet}, bet amount: ${amount}`);
                return new InvalidBet(seat.index, "Bet is under the maximum");

            }

            let actionType: number = table.betStatus.currentBet === 0 ? Bet.ACTION.OPEN : Bet.ACTION.RAISE;

            // if they cannot meet the minimum live raise then minimumLiveRaise will be null
            let raisesLiveAction: boolean = minimumLiveRaise !== null && amount >= minimumLiveRaise;

            // This bet/raise will have raiseAction = true so that others are required to respond
            // Whether it raises the liveAction or not depends on the size of the bet
            return this.takeBet(table.betStatus, seat, amount, Bet.TYPE.REGULAR, actionType, true, raisesLiveAction);

        }
        else {

            return new InvalidBet(seat.index, 'It is not time to bet');

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
            returnedBets.push(new Bet(rankedBets[0].seatIndex, rankedBets[0].totalBet, 0, Bet.TYPE.RETURNED, Bet.ACTION.REGULAR));

            // Take their bet entirely off the table
            delete status.bets[rankedBets[0].seatIndex];

        }

        else if (rankedBets[1].totalBet === 0) {

            // There was a non-zero bet, and the next largest was 0 (must have been a check), so they get it back
            returnedBets.push(new Bet(rankedBets[0].seatIndex, rankedBets[0].totalBet, 0, Bet.TYPE.RETURNED, Bet.ACTION.REGULAR));

            // Take their bet entirely off the table
            delete status.bets[rankedBets[0].seatIndex];

        }

        else if (rankedBets[0].totalBet === rankedBets[1].totalBet) {

            // the two largest bets match, so nothing to give back

        }

        else {

            // The biggest bet is larger than the second biggest, so they get their bet reduced  (but some of it remains to match the 2nd biggest)
            let difference: number = rankedBets[0].totalBet - rankedBets[1].totalBet;
            returnedBets.push(new Bet(rankedBets[0].seatIndex, difference, 0, Bet.TYPE.RETURNED, Bet.ACTION.REGULAR));

            // This is still pointing at the original actual bet, so just reduce it by the proper amount
            rankedBets[0].totalBet -= difference;

        }

        return returnedBets;

    } // checkBetsToReturn



    // wagers parameter will be an object that is either status.bets or status.antes
    public gatherChips(status: BetStatus, wagers: object, seatIndexesStillInHand: Set<number>): void {

        if (Object.values(wagers).every(bet => bet.totalBet === 0)) {

            // No bets greater than 0 to gather. Dump out or we will create extra pots because people from the last one are not in the "no-bets" round
            return;

        }

        // Find the most recent pot, or create one, if necessary
        let pot = status.pots.length == 0 ? this.createPot(status) : status.pots[status.pots.length - 1];

        // this.log(`Bets: [ ${Object.keys(wagers).map(seatIndex => '(Seat ' + seatIndex + ': ' + wagers[seatIndex] + ')').join("  ")}`);

        // If there is only one player left in the pot, then just put them money in there
        // We have already checked at this point for bets that need to be returned.
        if (seatIndexesStillInHand.size === 1) {

            for (let seatIndex of Object.keys(wagers)) {

                // the seatIndex is actually a number, but used as a key it will always be a string, so we need to parse it out
                pot.addChips(parseInt(seatIndex, 10), wagers[seatIndex].totalBet);
                delete wagers[seatIndex];

            }

            return;
        }

        let done: boolean = false;

        while (!done) {

            done = true;

            // Remove any bet that is just 0 at this point
            for (let seatIndex of Object.keys(wagers)) {

                if (wagers[seatIndex].totalBet == 0) {

                    delete wagers[seatIndex];

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

            for (let bet of Object.values(wagers)) {

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
            for (let seatIndex of Object.keys(wagers)) {

                // only take the amount of the smallest bet. It might be from this seat (and thus their entire bet), or it might
                // be someone else that has the smallest, but we don't to put in more for this better than the other all-in person put in
                let amountToContribute: number = Math.min(wagers[seatIndex].totalBet, smallestActiveBet);

                // iterating object keys will always give strings, but these are actually numbers
                pot.addChips(parseInt(seatIndex, 10), amountToContribute);


                wagers[seatIndex].totalBet -= amountToContribute;

            }

            // Someone didn't put in the full amount, we're going to have a split pot
            if (smallestActiveBet < largestActiveBet) {

                done = false;

                // Create a new side pot - it will become the active pot to which the remaining bets get added
                pot = this.createPot(status);

            }

        }   // while !done


    }   // gatherChips


    public gatherBets(status: BetStatus, seatIndexesStillInHand: Set<number>): void {

        this.gatherChips(status, status.bets, seatIndexesStillInHand);
        this.clearBets(status);

    }


    public gatherAntes(status: BetStatus, seatIndexesStillInHand: Set<number>): void {

        this.gatherChips(status, status.antes, seatIndexesStillInHand);
        // don't clear out all the bets

    }   // gatherAntes


    // Removes specified pots safely - no deleting while iterating issues
    public killPots(status: BetStatus, potIndexesToKill: Set<number>): void {

        status.pots = status.pots.filter(pot => !potIndexesToKill.has(pot.index));

    }   // killPots


    public calculateSeatIndexesRemainToAct(table: Table, possibleStartingIndex: number, lastPossibleIndex: number, seatIsEligibile: (seat: Seat) => boolean): void {

        // Go through the rest of the players at the table and see whether or not they need to take an action
        let seatsToAct = [];

        if (table.seats.length) {

            while (possibleStartingIndex >= table.seats.length) {
                possibleStartingIndex -= table.seats.length;
            }

            while (lastPossibleIndex < 0) {
                lastPossibleIndex += table.seats.length;
            }

            let done: boolean = false;
            let ix: number = possibleStartingIndex;

            console.log(`BETTRACKER: calculateSeatIndexesRemainToAct possibleStartingIndex: ${possibleStartingIndex}, lastPossibleIndex: ${lastPossibleIndex}, numSeats: ${table.seats.length}`);

            while (!done) {

                if (seatIsEligibile(table.seats[ix])) {

                    seatsToAct.push(ix);

                }

                if (ix == lastPossibleIndex) {
                    done = true;
                }
                else {

                    ix++;

                    if (ix >= table.seats.length) {
                        ix = 0;
                    }

                }   // keep going

            }  // !done

            console.log(`BETTRACKER: calculateSeatIndexesRemainToAct seatsToAct: [ ${seatsToAct.join("  ")} ]`);


        }   // seats.length > 0


        table.betStatus.seatIndexesRemainToAct = [...seatsToAct];

    }  // calculateSeatIndexesRemainToAct


    public calculateForcedBets(table: Table, isSeatEligible: (seat: Seat) => boolean): void {

        this.clearBettorsToAct(table.betStatus);
        this.clearRequiredBets(table.betStatus);

        if (table.stakes.ante === 0 && table.stakes.blinds.length === 0) {

            // No blinds or antes, so we're done
            return;

        }

        // First count how many players CAN act this round - if only 1 (or 0) then there's nothing to do
        // This is not the same as blowing through rounds because we're down to just one player because everyone else folded.
        // In this case, at least one person must be all-in, so we're going to keep dealing cards, but we don't need to bet.
        let numEligibleSeats: number = table.seats.filter(s => isSeatEligible(s)).length;
        if (numEligibleSeats < table.stakes.blinds.length) {

            // we don't have enough players with money to pay the blinds, so dump out
            return;

        }

        // Usually start to the left of the button...
        let possibleStartingIndex: number = table.buttonIndex + 1;
        let lastPossibleIndex: number = table.buttonIndex;

        if (numEligibleSeats === table.stakes.blinds.length) {

            // When the number of players matches the blinds, then put the button on the small blind so that they act first pre-flop
            // So button is first to act...
            possibleStartingIndex = table.buttonIndex;

            // ...and the player before the button is last to act
            lastPossibleIndex = table.buttonIndex - 1;

        }


        // Make sure that our start and finish spots are within the valid range of seat indexes
        while (possibleStartingIndex >= table.seats.length) {
            possibleStartingIndex -= table.seats.length;
        }

        while (lastPossibleIndex < 0) {
            lastPossibleIndex += table.seats.length;
        }


        // Go through the rest of the players at the table and see whether or not they need to take an action
        let seatsToAct = [];

        let done: boolean = false;
        let ix: number = possibleStartingIndex;

        let blindsToHandOut: Blind[] = [...table.stakes.blinds];

        while (!done) {

            if (isSeatEligible(table.seats[ix])) {

                seatsToAct.push(ix);

                if (table.stakes.ante > 0) {

                    if (!table.betStatus.requiredBets.hasOwnProperty(ix)) {
                        table.betStatus.requiredBets[ix] = new Array<Ante | Blind>();
                    }

                    table.betStatus.requiredBets[ix].push(new Ante(table.stakes.ante));

                }

                if (blindsToHandOut.length) {

                    if (!table.betStatus.requiredBets.hasOwnProperty(ix)) {
                        table.betStatus.requiredBets[ix] = new Array<Ante | Blind>();
                    }

                    // Pop the first blind off the front of the array
                    let blind: Blind = blindsToHandOut.shift();

                    if (blind.type == Blind.TYPE_BIG) {

                        table.betStatus.bigBlindIndex = ix;

                    }

                    // the blind is not "owed" - this is just the usual blind order
                    table.betStatus.requiredBets[ix].push(new Blind(blind.type, blind.name, blind.amount, false));

                }

            }

            if (ix === lastPossibleIndex) {
                done = true;
            }
            else {

                ix++;

                if (ix >= table.seats.length) {
                    ix = 0;
                }

            }

        }

        this.log(`End calculateForcedBets, seatsToAct: [ ${seatsToAct.join(" ")} ]`);
        for (let seatIndex in table.betStatus.requiredBets) {

            this.log(`  ForcedBets, seatIndex ${seatIndex}: [ ${table.betStatus.requiredBets[seatIndex].map(bet => `${bet.constructor.name} ${bet.amount}`).join(",") } ]`)

        }


        table.betStatus.seatIndexesRemainToAct = [...seatsToAct];

    }  // calculateForcedBets


}