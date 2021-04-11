import { IButtonController } from "./i-button-controller";
import { Table } from "../table";
import { Seat } from "../seat";
import { Ante } from "../betting/ante";
import { Blind } from "../betting/blind";
import { Stakes } from '../betting/stakes';
import { RoundPayments } from './round-payments';
import { request } from 'express';
import { BlindTracker } from './blind-tracker';

export class DeadButtonController implements IButtonController {


    constructor() {
    }


    private log(message: string): void {

        console.log('\x1b[31m%s\x1b[0m', `NormalButtonController: ${message}`);

    }



    private moveButton(table: Table, blindTracker: BlindTracker, availableSeats: Seat[]): boolean {

        if (blindTracker.blinds.length) {

            let activeSeats: Seat[] = availableSeats.filter(seat => seat.player && blindTracker.activePlayers.has(seat.player.userID));

            if (activeSeats.length === 2) {

                // The dealer is ALWAYS the player that is not the big blind
                blindTracker.buttonIndex = availableSeats.find(s => s.index != blindTracker.bigBlindIndex).index;

            }
            else {

                blindTracker.buttonIndex = this.determineLastPayorOfBlinds(table, blindTracker, availableSeats);

            }

        }
        else {

            let buttonIndex: number = blindTracker.buttonIndex == null
                // We have not previously picked a button, so 
                // randomly pick one of the active seats to have the button
                ? Math.floor(Math.random() * availableSeats.length)
                // otherwise, just move it to the next spot
                : (blindTracker.buttonIndex + 1);

            // In either case the button might have landed off the edge or on a non-playing seat. 
            // Keep it moving along until it's a playing seat
            let foundButton = false;

            while (!foundButton) {

                if (buttonIndex >= table.seats.length) {

                    buttonIndex = 0;

                }

                if (table.seats[buttonIndex].isAvailableForHand()) {
                    foundButton = true;
                }
                else {
                    buttonIndex++;
                }

            }

            blindTracker.buttonIndex = buttonIndex;

        }


        table.buttonIndex = blindTracker.buttonIndex;
        this.log(`In moveButton for table ${table.id} - setting button to ${blindTracker.buttonIndex}`);

        return true;

    }


    private determineLastPayorOfBlinds(table: Table, blindTracker: BlindTracker, availableSeats: Seat[]): number {

        for (let pr = 0; pr < blindTracker.roundPayments.length; pr++) {
            console.log(`RP ${pr}: ${blindTracker.roundPayments[pr]}`);
        }

        // Only active players can be eligible to get the button

        this.log(`blindTracker has ${blindTracker.activePlayers.size} active players`);

        const activeSeats: Seat[] = table.seats.filter(seat => seat.player && blindTracker.activePlayers.has(seat.player.userID));

        const paidMap: RoundPayments = new RoundPayments();

        // Count backwards from the most recent payment to the earliest
        for (let rp = blindTracker.roundPayments.length - 1; rp >= 0; rp--) {

            const finishedPlayers: { userID: number; smallestBlindIndex: number }[] = [];

            for (let [userID, payments] of blindTracker.roundPayments[rp].payments) {

                let hasPlayerPaidAllBlinds: boolean = false;
                let smallestBlindIndex: number = Number.MAX_VALUE;

                for (let blindIndex of payments) {

                    paidMap.addPayment(userID, blindIndex);

                    if (blindIndex < smallestBlindIndex) {
                        smallestBlindIndex = blindIndex;
                    }

                    // This player has paid blinds in all the positions
                    if (paidMap.payments.get(userID).size == blindTracker.blinds.length) {

                        hasPlayerPaidAllBlinds = true;

                    }

                }  // foreach blindIndex

                if (hasPlayerPaidAllBlinds) {

                    finishedPlayers.push({ userID: userID, smallestBlindIndex: smallestBlindIndex });

                }

            }  // all the payments that the player paid in the round (could be more than one if thet post both the big and small blinds at once)

            if (finishedPlayers.length) {

                // We have a tie - two players paid their blinds in the same round - give it to the one that paid their small blind most recently

                // The player that paid the BB the longest ago should now be the dealer
                finishedPlayers.sort((a, b) => b.smallestBlindIndex - a.smallestBlindIndex);

                const paidPlayerSeat: Seat = table.seats.find(seat => seat.player && seat.player.userID == finishedPlayers[0].userID);

                console.log(`paidPlayerSeat = ${paidPlayerSeat}`);

                if (paidPlayerSeat) {
                    return paidPlayerSeat.index;

                }


            }

        }


        // We can only be here if there are insufficient existing payments but there are blinds and more than 2 players.

        // Clear all tracked payments thus far so we're starting fresh
        blindTracker.roundPayments.length = 0;

        // The button should be X players before the BB (X being the number of blinds in the game)
        let buttonIndex: number = blindTracker.bigBlindIndex;

        for (let b = 0; b < blindTracker.blinds.length; b++) {

            // Go backwards one spot
            buttonIndex = table.findPreviousAvailableSeatIndex(buttonIndex - 1);

        }

        this.log(`We are assigning the dealer to be seat ${table.seats[buttonIndex].index} - ${table.seats[buttonIndex].getName()}`);

        // Say we have 3 players, and we have randomly picked Seat #2 to be the button
        // After we have set up some fake blind payments then we want it to look like:
        // 1    2    3    4 
        //      (D)  SB   BB         <== Round payment -2
        // BB        (D)  SB         <== Round payment -1
        // SB   BB        (D)        <== Round 0 that's happening right now
        // So seat 4 will be the last one to have paid both
        for (let i = 0; i < blindTracker.blinds.length; i++) {

            const rp: RoundPayments = new RoundPayments();

            for (let j = 0; j < blindTracker.blinds.length; j++) {

                let blindSeatIndex = buttonIndex + i + j;

                // if it's off the front then wrap around to the end
                if (blindSeatIndex < 0) {
                    blindSeatIndex += activeSeats.length;
                }

                // if it's off the back then wrap around to the front
                if (blindSeatIndex >= activeSeats.length) {
                    blindSeatIndex -= activeSeats.length;
                }

                // Mark this player as having paid this blind
                rp.addPayment(activeSeats[blindSeatIndex].player.userID, blindTracker.blinds[j].index);

            }

            // add this round of blinds to the front, so we're populating in reverse order  (-1, -2, etc...)
            blindTracker.roundPayments.unshift(rp);

        }

        // now that it's set up properly we can call this method again and it will (SHOULD) get a 
        // valid result this time
        return this.determineLastPayorOfBlinds(table, blindTracker, availableSeats);

    }   // determineLastPayorOfBlinds





    public calculateNextForcedBet(table: Table, blindTracker: BlindTracker): boolean {

        if (blindTracker.currentStep >= BlindTracker.STEP_DONE) {

            // No more steps, we're done
            return false;

        }

        const availableSeats: Seat[] = table.seats.filter(seat => seat.isAvailableForHand());
        console.log(`In calculateNextForcedBet, there are ${availableSeats.length} available seats`);

        if (availableSeats.length < 2) {

            // Not enough players for a hand
            return false;

        }

        const forcedBets: (Ante | Blind)[] = [];

        if (blindTracker.currentStep == BlindTracker.STEP_BIG_BLIND) {

            if (blindTracker.blinds.length == 0) {

                // There are no blinds, so just try to assign the button and move on
                if (!this.moveButton(table, blindTracker, availableSeats)) {

                    // We couldn't establish the button, so we can't progress further with this hand
                    return false;
                }

                blindTracker.currentStep = BlindTracker.STEP_ANTES;

            }
            else if (blindTracker.paidBlinds.size === 1) {

                // Somone has paid the big blind, so try to assign the button and then move on to the other required blinds
                if (!this.moveButton(table, blindTracker, availableSeats)) {

                    // We couldn't establish the button, so we can't progress further with this hand
                    return false;
                }

                blindTracker.currentStep = BlindTracker.STEP_OTHER_REGULAR_BLINDS;

            }
            else if (blindTracker.paidBlinds.size === 0) {

                // No blinds have been paid at all, so we need to find who should pay the Biggest Blind first
                blindTracker.bigBlindIndex = blindTracker.bigBlindIndex == null
                    // We haven't set the big blind position, so just assign it randomly
                    ? availableSeats[Math.floor(Math.random() * availableSeats.length)].index
                    // We previously had a big blind position, so move it to the next available player
                    : table.findNextAvailableSeatIndex(blindTracker.bigBlindIndex + 1);

                // Push the big blind onto the array of forced bets
                forcedBets.push(blindTracker.blinds[blindTracker.blinds.length - 1]);

                if (blindTracker.ante > 0) {

                    forcedBets.push(new Ante(blindTracker.ante));

                }

                table.betStatus.seatIndex = blindTracker.bigBlindIndex;
                table.betStatus.forcedBets = forcedBets;
                return true;

            }
            else {
                throw new Error("Still in Big Blind step, but we have paid multiple blinds!");
            }

        }  // STEP_BIG_BLIND


        // Do NOT use an else here because we might have originally hit one of the other cases, it did some work, and updated the currentStep
        if (blindTracker.currentStep == BlindTracker.STEP_OTHER_REGULAR_BLINDS) {

            if (blindTracker.blinds.length == 0) {

                // Should never get here if there are no blinds!
                throw new Error('In Other Regular blinds but there are no blinds!')

            }

            if (blindTracker.paidBlinds.size === blindTracker.blinds.length) {

                // We have paid all the blinds, so move on
                blindTracker.currentStep = BlindTracker.STEP_JOIN_BLINDS;

            }
            else {

                let requiredBlind: Blind = blindTracker.blinds[blindTracker.blinds.length - 1 - blindTracker.paidBlinds.size];

                // If we are heads-up then the button should pay the small blind
                if (availableSeats.length === 2) {

                    // Push the small blind onto the array of forced bets
                    forcedBets.push(requiredBlind);

                    if (blindTracker.ante > 0) {

                        forcedBets.push(new Ante(blindTracker.ante));

                    }

                    // Assign the small blind to the button
                    table.betStatus.seatIndex = blindTracker.buttonIndex;
                    table.betStatus.forcedBets = forcedBets;
                    return true;

                }

                // We have more than 2 players, so the small blind will be the player before the big blind
                // For the Big Blind it can be any available player - that is how players join the game, after all.
                // For the Small Blind it *must* be a player already in the game
                let smallBlindIndex: number = table.findPreviousSeat(blindTracker.bigBlindIndex - 1, (seat) => seat.player && blindTracker.activePlayers.has(seat.player.userID));

                if (smallBlindIndex === blindTracker.buttonIndex) {

                    // if the small blind is the same seat as the button, then we don't have a small blind this round and we're done
                    blindTracker.markAllBlindsPaid();

                    // We can continue on to look for other players to join, however
                    blindTracker.currentStep = BlindTracker.STEP_JOIN_BLINDS;

                }

            }   // still have some small blinds to pay

        }   // STEP_OTHER_REGULAR_BLINDS


        // No blinds or antes remain to be paid
        return false;

    }  // calculateForcedBets

}