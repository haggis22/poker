import { IButtonController } from "./i-button-controller";
import { Table } from "../table";
import { Seat } from "../seat";
import { Ante } from "../betting/ante";
import { Blind } from "../betting/blind";
import { Stakes } from '../betting/stakes';
import { RoundPayments } from './round-payments';
import { request } from 'express';
import { BlindTracker } from './blind-tracker';

export class NormalButtonController implements IButtonController {


    constructor() {



    }


    private log(message: string): void {

        console.log('\x1b[31m%s\x1b[0m', `NormalButtonController: ${message}`);

    }



    public moveButton(table: Table, blindTracker: BlindTracker): boolean {

        const numPlayersAvailable: number = table.seats.filter(seat => seat.isAvailableForHand()).length;

        this.log(`In moveButton for table ${table.id}, numPlayersAvailable: ${numPlayersAvailable}`);

        if (numPlayersAvailable < 2) {

            // We don't have enough players, so can't set the button
            this.log(`In moveButton for table ${table.id} - not enough players, so returning false`);

            // Clear the table's button index, along with the one here.
            // If there is still a player sitting alone then they should be considered the active player
            // and will get the button if someone else sits down
            table.buttonIndex = blindTracker.buttonIndex = null;
            return false;

        }

        if (blindTracker.blinds.length) {

            blindTracker.buttonIndex = this.determineLastPayorOfBlinds(table, blindTracker);

        }
        else {

            let buttonIndex: number = blindTracker.buttonIndex == null
                // We have not previously picked a button, so 
                // randomly pick one of the active seats to have the button
                ? Math.floor(Math.random() * table.seats.length)
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


    private determineLastPayorOfBlinds(table: Table, blindTracker: BlindTracker): number {

        for (let pr = 0; pr < blindTracker.roundPayments.length; pr++) {
            console.log(`RP ${pr}: ${blindTracker.roundPayments[pr]}`);
        }

        // Only active players can be eligible to get the button

        this.log(`blindTracker has ${blindTracker.activePlayers.size} active players`);

        const playingSeats: Seat[] = table.seats.filter(seat => seat.player && blindTracker.activePlayers.has(seat.player.userID));

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

                // Two cases - heads-up, and regular

                if (playingSeats.length == 2) {

                    // Since we are counting backwards through time, then we want to player that played the small blind (and was thus dealer) 
                    // the longest ago to be the dealer now.  So the smallest blind should go first
                    finishedPlayers.sort((a, b) => a.smallestBlindIndex - b.smallestBlindIndex);

                }
                else {

                    // Otherwise the player that paid the BB the longest ago should now be the dealer
                    finishedPlayers.sort((a, b) => b.smallestBlindIndex - a.smallestBlindIndex);

                }

                const paidPlayerSeat: Seat = table.seats.find(seat => seat.player && seat.player.userID == finishedPlayers[0].userID);

                console.log(`paidPlayerSeat = ${paidPlayerSeat}`);

                if (paidPlayerSeat) {
                    return paidPlayerSeat.index;

                }


            }

        }


        // Just pick someone and then make it look as if they've paid up

        // Clear all tracked payments thus far
        blindTracker.roundPayments.length = 0;

        let playingSeatIndex: number = Math.floor(Math.random() * playingSeats.length);

        this.log(`We are randomly assigning the dealer to be seat ${playingSeats[playingSeatIndex].index} - ${playingSeats[playingSeatIndex].getName()}`);

        if (playingSeats.length == 2) {

            // We have to respect the different rules again for heads-up.  If we want the button to be Seat 1,
            // then we have to make it look like
            // 1   2   
            // SB  BB        <== Round payment 0
            // BB  SB        <== Round payment 1
            // So seat 1 will be the last one to have paid both, with the BB most recently
            for (let i = 0; i < blindTracker.blinds.length; i++) {

                const rp: RoundPayments = new RoundPayments();

                for (let j = 0; j < blindTracker.blinds.length; j++) {

                    let blindSeatIndex = playingSeatIndex + i + j;

                    // if it's off the front then wrap around to the end
                    if (blindSeatIndex < 0) {
                        blindSeatIndex += playingSeats.length;
                    }

                    // if it's off the back then wrap around to the front
                    if (blindSeatIndex >= playingSeats.length) {
                        blindSeatIndex -= playingSeats.length;
                    }

                    // Mark this player as having paid this blind
                    rp.addPayment(playingSeats[blindSeatIndex].player.userID, blindTracker.blinds[j].index);

                }

                // add this round of blinds
                blindTracker.roundPayments.push(rp);

            }


        }
        else {

            // Say we have 4 players, and we have randomly picked Seat #4 to be the button
            // After we have set up some fake blind payments then we want it to look like:
            // 1   2   3   4
            // BB          SB           <== Round payment 1
            //         SB  BB           <== Round payment 2
            // So seat 4 will be the last one to have paid both
            for (let i = 0; i < blindTracker.blinds.length; i++) {

                const rp: RoundPayments = new RoundPayments();

                for (let j = 0; j < blindTracker.blinds.length; j++) {

                    let blindSeatIndex = playingSeatIndex - i + j;

                    // if it's off the front then wrap around to the end
                    if (blindSeatIndex < 0) {
                        blindSeatIndex += playingSeats.length;
                    }

                    // if it's off the back then wrap around to the front
                    if (blindSeatIndex >= playingSeats.length) {
                        blindSeatIndex -= playingSeats.length;
                    }

                    // Mark this player as having paid this blind
                    rp.addPayment(playingSeats[blindSeatIndex].player.userID, blindTracker.blinds[j].index);

                }

                // add this round of blinds
                blindTracker.roundPayments.push(rp);

            }

        }   // more than 2 players

        // now that it's set up properly we can call this method again and it will (SHOULD) get a 
        // valid result this time
        return this.determineLastPayorOfBlinds(table, blindTracker);

    }   // determineLastPayorOfBlinds





    public calculateNextForcedBet(table: Table, blindTracker: BlindTracker): boolean {

        if (blindTracker.buttonIndex == null) {
            throw new Error("Cannot determine forced bets if buttonIndex is null");
        }

        const availableSeats: Seat[] = table.seats.filter(seat => seat.isAvailableForHand());

        console.log(`In calculateNextForcedBet, there are ${availableSeats.length} available seats`);

        if (availableSeats.length < 2) {

            // Not enough players for a hand
            return false;

        }

        const forcedBets: (Ante | Blind)[] = [];

        let requiredBlind: Blind = null;

        // Counting backwards from the big blind on down, find the next blind that still needs to be paid
        for (let bi: number = blindTracker.blinds.length - 1; bi >= 0; bi--) {

            if (!blindTracker.paidBlinds.has(bi)) {

                requiredBlind = blindTracker.blinds[bi];
                break;

            }

        }

        if (requiredBlind) {

            let blindSeat: Seat = null;

            if (availableSeats.length == 2) {

                if (blindTracker.paidBlinds.size == 0) {

                    // No blinds have been paid at all, so we need to find who should pay the Biggest Blind first
                    // There are 2 players, so the big blind should be the player that is NOT the button
                    blindSeat = availableSeats.find(s => s.index != table.buttonIndex);

                    // Move the big blind to the appropriate seat
                    blindTracker.bigBlindIndex = blindSeat.index;

                }
                else if (blindTracker.paidBlinds.size < availableSeats.length) {

                    // we must be on the small blind here, so give it to the button
                    blindSeat = availableSeats.find(s => s.index == table.buttonIndex);

                }

            }
            else {

                // More than 2 available seats


                if (blindTracker.paidBlinds.size == 0) {

                    // We haven't paid any blinds at all, so work on the Big Blind

                    let bigBlindIndex: number = blindTracker.bigBlindIndex;

                    if (bigBlindIndex == null) {

                        bigBlindIndex = table.buttonIndex;

                        // we have not yet assigned the big blind, so put the X number of seats down from the button (where X is the number of blinds)
                        for (let b = 0; b < blindTracker.blinds.length; b++) {

                            // This will move the marker exactly 1 available seat down the line
                            bigBlindIndex = table.findNextAvailableSeatIndex(bigBlindIndex + 1);

                        }

                    }
                    else {

                        // Move the big blind one seat down
                         bigBlindIndex = table.findNextAvailableSeatIndex(bigBlindIndex + 1);

                    }

                    // No blinds have been paid at all, so we need to find who should pay the Biggest Blind first
                    // There are 2 players, so the big blind should be the player that is NOT the button
                    blindSeat = availableSeats.find(s => s.index == bigBlindIndex);

                    blindTracker.bigBlindIndex = bigBlindIndex;

                }

            }


            if (blindSeat != null) {

                forcedBets.push(requiredBlind);

                if (blindTracker.ante > 0) {

                    forcedBets.push(new Ante(blindTracker.ante));

                }

                table.betStatus.seatIndex = blindSeat.index;
                table.betStatus.forcedBets = forcedBets;
                return true;

            }

        }  // if blinds are still required


        if (blindTracker.ante > 0) {

        }

        // No blinds or antes remain to be paid
        return false;

    }  // calculateForcedBets

}