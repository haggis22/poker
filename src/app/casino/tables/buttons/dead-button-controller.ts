import { IButtonController } from "./i-button-controller";
import { Table } from "../table";
import { Seat } from "../seat";
import { Ante } from "../betting/ante";
import { Blind } from "../betting/blind";
import { Stakes } from '../betting/stakes';
import { RoundPayments } from './round-payments';
import { request } from 'express';
import { BlindTracker } from './blind-tracker';
import { IBlindAssigner } from './i-blind-assigner';

export class DeadButtonController implements IButtonController {

    private blindAssigner: IBlindAssigner;

    constructor(blindAssigner: IBlindAssigner) {

        this.blindAssigner = blindAssigner;

    }


    private log(message: string): void {

        console.log('\x1b[31m%s\x1b[0m', `DeadButtonController: ${message}`);

    }


    public calculateNextForcedBet(table: Table, blindTracker: BlindTracker): boolean {

        if (blindTracker.currentStep >= BlindTracker.STEP_DONE) {

            // No more steps, we're done
            return false;

        }

        const availableSeats: Seat[] = table.seats.filter(seat => seat.isAvailableForHand());
        const activeSeats: Seat[] = availableSeats.filter(seat => seat.isAvailableForHand() && blindTracker.activePlayers.has(seat.player.userID));

        console.log(`In calculateNextForcedBet, there are ${availableSeats.length} available seats and ${activeSeats.length} active seats`);

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
                    // We haven't set the big blind position, so pick one
                    ? this.blindAssigner.assignBigBlind(availableSeats)
                    // We previously had a big blind position, so move it to the next available player
                    : table.findNextAvailableSeatIndex(blindTracker.bigBlindIndex + 1);

                // Push the big blind onto the array of forced bets
                forcedBets.push(blindTracker.blinds[blindTracker.blinds.length - 1]);

                if (blindTracker.ante > 0) {

                    forcedBets.push(new Ante(blindTracker.ante));

                }

                table.betStatus.seatIndex = blindTracker.bigBlindIndex;
                table.betStatus.actionOnUserID = table.seats[blindTracker.bigBlindIndex].player.userID;
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

                let requiredSmallBlind: Blind = blindTracker.blinds[blindTracker.blinds.length - 1 - blindTracker.paidBlinds.size];

                // If we are heads-up then the button should pay the small blind
                if (activeSeats.length === 2) {

                    // Push the small blind onto the array of forced bets
                    forcedBets.push(requiredSmallBlind);

                    if (blindTracker.ante > 0) {

                        forcedBets.push(new Ante(blindTracker.ante));

                    }

                    // Assign the small blind to the button
                    table.betStatus.seatIndex = blindTracker.buttonIndex;
                    table.betStatus.actionOnUserID = table.seats[blindTracker.buttonIndex].player.userID;
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
                else {

                    // Push the small blind onto the array of forced bets
                    forcedBets.push(requiredSmallBlind);

                    if (blindTracker.ante > 0) {

                        forcedBets.push(new Ante(blindTracker.ante));

                    }

                    // Assign the small blind to its seat index
                    table.betStatus.seatIndex = smallBlindIndex;
                    table.betStatus.actionOnUserID = table.seats[smallBlindIndex].player.userID;
                    table.betStatus.forcedBets = forcedBets;
                    return true;

                }

            }   // still have some small blinds to pay

        }   // STEP_OTHER_REGULAR_BLINDS

        // Do NOT use an else here because we might have originally hit one of the other cases, it did some work, and updated the currentStep
        if (blindTracker.currentStep == BlindTracker.STEP_JOIN_BLINDS) {

            // Skip this for now
            blindTracker.currentStep = BlindTracker.STEP_ANTES;

        }

        // Do NOT use an else here because we might have originally hit one of the other cases, it did some work, and updated the currentStep
        if (blindTracker.currentStep == BlindTracker.STEP_ANTES) {

            if (blindTracker.ante > 0) {

                // Find the next available player after the Big Blind that has not already anted

                // There are different rules, depending on whether or not there are blinds.  
                // 1. If there are blinds, then the player must already be actively part of the game in order to ante
                // 2. If there are no blinds, then anyone can ante and join the game immediately
                const seatEligibility: (seat: Seat) => boolean = blindTracker.blinds.length
                    // there are blinds
                    ? (seat) => (seat.player && blindTracker.activePlayers.has(seat.player.userID) && !blindTracker.paidAntes.has(seat.player.userID))
                    : (seat) => (seat.player && !blindTracker.paidAntes.has(seat.player.userID));

                const anteSeatIndex: number = table.findNextSeat(blindTracker.bigBlindIndex + 1, seatEligibility);

                if (anteSeatIndex == null) {

                    // we're all paid up, so move on to the next step!
                    blindTracker.currentStep = BlindTracker.STEP_DONE;

                    return false;

                }

                // This person needs to pay their ante
                forcedBets.push(new Ante(blindTracker.ante));

                // Assign the ante to its seat index
                table.betStatus.seatIndex = anteSeatIndex;
                table.betStatus.actionOnUserID = table.seats[anteSeatIndex].player.userID;
                table.betStatus.forcedBets = forcedBets;
                return true;


            }
            else {

                /*
                // Credit everyone that remains as being in...
                for (let seat of availableSeats) {

                    if (seat.player) {

                        blindTracker.activePlayers.add(seat.player.userID);

                    }

                }
                */

                // we're all paid up, so move on to the next step!
                blindTracker.currentStep = BlindTracker.STEP_DONE;

                return false;


            }
            

        }

        // No blinds or antes remain to be paid
        return false;

    }  // calculateNextForcedBet




    private moveButton(table: Table, blindTracker: BlindTracker, availableSeats: Seat[]): boolean {

        if (blindTracker.blinds.length) {

            // When there are blinds then the button can only be held by a player that has established themselves as being in the rotation
            let activeSeats: Seat[] = availableSeats.filter(seat => seat.player && blindTracker.activePlayers.has(seat.player.userID));

            if (activeSeats.length === 2) {

                // The dealer is ALWAYS the player that is not the big blind
                blindTracker.buttonIndex = availableSeats.find(s => s.index != blindTracker.bigBlindIndex).index;

            }
            else {

                blindTracker.buttonIndex = this.determineLastPayorOfBlinds(table, blindTracker);

            }

        }
        else {

            let buttonIndex: number = blindTracker.buttonIndex == null
                // We have not previously picked a button, so pick one of the active seats to have the button
                ? this.blindAssigner.assignButton(availableSeats)
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
        const buttonSeat: Seat = table.seats[table.buttonIndex];
        this.log(`In moveButton for table ${table.id} - setting button to ${buttonSeat}`);

        return true;

    }


    private determineLastPayorOfBlinds(table: Table, blindTracker: BlindTracker): number {

/*
        for (let pr = 0; pr < blindTracker.roundPayments.length; pr++) {
            console.log(`RP ${pr}: ${blindTracker.roundPayments[pr]}`);
        }
*/
        // Only active players can be eligible to get the button

        this.log(`blindTracker has ${blindTracker.activePlayers.size} active players`);

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

        // If we have NEVER had a button, then it should be X players before the BB (X being the number of blinds in the game)
        if (blindTracker.buttonIndex == null) {

            let buttonIndex: number = blindTracker.bigBlindIndex;

            for (let b = 0; b < blindTracker.blinds.length; b++) {

                // Go backwards one spot
                buttonIndex = table.findPreviousAvailableSeatIndex(buttonIndex - 1);

            }

            let buttonSeat: Seat = table.seats[buttonIndex];
            this.log(`We are assigning the dealer to be seat ${buttonSeat.index} - ${buttonSeat.getName()}`);

            if (blindTracker.roundPayments.length === 0) {

                // Make up some fake blind payments that would result in the current button/blind situation so that the next hand(s) can proceed as you would expect
                // If we don't do this then the button will just stay in the same place until the blinds all get paid - we would rather that it starts moving normally immediately.

                let bbSeatIndex: number = blindTracker.bigBlindIndex;

                // Go back the number of rounds that we have active players
                for (let r = 0; r < blindTracker.activePlayers.size; r++) {

                    // This sets the Big Blind index for this previous round of betting
                    bbSeatIndex = table.findPreviousAvailableSeatIndex(bbSeatIndex - 1);

                    const rp: RoundPayments = new RoundPayments();

                    for (let blindIndex = 0; blindIndex < blindTracker.blinds.length; blindIndex++) {

                        // We are going to assign the blinds in increasing order (small blind, then big blind, etc)
                        // We need to jump back the number of spaces according to how many blinds there are.  
                        // If there are 2 blinds then,
                        // For the small blind (blind index = 0) we want to go back 1 space
                        // For the big blind (blind index = 1) we want to go back 0 spaces
                        let blindSeatIndex: number = bbSeatIndex;

                        for (let bi = 0; bi < (blindTracker.blinds.length - 1) - blindIndex; bi++) {

                            blindSeatIndex = table.findPreviousAvailableSeatIndex(blindSeatIndex - 1);

                        }

                        rp.addPayment(table.seats[blindSeatIndex].player.userID, blindIndex);

                    }   // for each blind

                    // we're going backwards in time, so put the fake round payments at the front of the queue each time
                    blindTracker.roundPayments.unshift(rp);

                }

            }

            return buttonIndex;

        }

        // Otherwise, we're going to leave the button exactly where it is

        let buttonSeat: Seat = table.seats[blindTracker.buttonIndex];
        this.log(`We are keeping the dealer at seat ${buttonSeat.index} - ${buttonSeat.getName()}`);

        return blindTracker.buttonIndex;

    }   // determineLastPayorOfBlinds






}