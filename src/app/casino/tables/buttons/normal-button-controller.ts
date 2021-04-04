import { IButtonController } from "./i-button-controller";
import { Table } from "../table";
import { Seat } from "../seat";
import { Ante } from "../betting/ante";
import { Blind } from "../betting/blind";
import { Stakes } from '../betting/stakes';
import { RoundPayments } from './round-payments';
import { request } from 'express';

export class NormalButtonController implements IButtonController {


    private ante: number;
    private blinds: Blind[];

    private roundPayments: RoundPayments[];

    private currentRoundPayments: RoundPayments;

    private buttonIndex: number;

    // Key = index of blind
    // Value = seatIndex that needs to pay the blind
    private blindSeatIndexes: Map<number, number>;

    private blindsNeedingPaying: Blind[];



    constructor(stakes: Stakes) {

        this.ante = stakes.ante;
        this.blinds = stakes.blinds;

        this.roundPayments = [];

        this.buttonIndex = null;
        this.blindSeatIndexes = new Map<number, number>();

        this.resetForOpenState();


    }


    private log(message: string): void {

        console.log('\x1b[31m%s\x1b[0m', `NormalButtonController: ${message}`);

    }


    public resetForOpenState(): void {

        this.resetHand();

    }

    public resetHand(): void {

        this.currentRoundPayments = null;

        const blinds: Blind[] = [];

        for (let b = this.blinds.length - 1; b >= 0; b--) {

            blinds.push(this.blinds[b]);

        }

        this.blindsNeedingPaying = blinds;

    }

    public moveButton(table: Table): boolean {

        this.log(`In moveButton for table ${table.id}`)

        const numPlayersInHand: number = table.seats.filter(seat => seat.isInHand).length;

        if (numPlayersInHand < 2) {

            // We don't have enough players, so can't set the button
            this.log(`In moveButton for table ${table.id} - not enough players, so returning null`);
            return null;

        }

        if (this.blinds.length) {

            this.buttonIndex = this.determineLastPayorOfBlinds(table);

        }
        else {

            this.buttonIndex = this.buttonIndex == null
                // randomly pick one of the active seats to have the button
                ? Math.floor(Math.random() * table.seats.length)
                // just move it to the next spot
                : (this.buttonIndex + 1);

        }

        // the button might have landed off the edge or on a non-playing seat. Keep it moving along until it's a playing seat
        let foundButton = false;

        while (!foundButton) {

            if (this.buttonIndex >= table.seats.length) {

                this.buttonIndex = 0;

            }

            if (table.seats[this.buttonIndex].isInHand) {
                foundButton = true;
            }
            else {
                this.buttonIndex++;
            }

        }

        table.buttonIndex = this.buttonIndex;
        this.log(`In moveButton for table ${table.id} - setting button to ${this.buttonIndex}`);

        return true;

    }


    private determineLastPayorOfBlinds(table: Table): number {

        const playingSeats: Seat[] = table.seats.filter(seat => seat.isInHand);

        debugger;

        const paidMap: RoundPayments = new RoundPayments();

        // Count backwards from the most recent payment to the earliest
        for (let rp = this.roundPayments.length - 1; rp >= 0; rp--) {

            const finishedPlayers: { userID: number; smallestBlindIndex: number }[] = [];

            for (let [userID, payments] of this.roundPayments[rp].payments) {

                let hasPlayerPaidAllBlinds: boolean = false;
                let smallestBlindIndex: number = Number.MAX_VALUE;

                for (let blindIndex of payments) {

                    paidMap.addPayment(userID, blindIndex);

                    if (blindIndex < smallestBlindIndex) {
                        smallestBlindIndex = blindIndex;
                    }

                    // This player has paid blinds in all the positions
                    if (paidMap.payments.get(userID).size == this.blinds.length) {

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

                if (paidPlayerSeat) {

                    return paidPlayerSeat.index;

                }


            }

        }


        // Just pick someone and then make it look as if they've paid up

        // Clear all tracked payments thus far
        this.roundPayments.length = 0;

        let playingSeatIndex: number = Math.floor(Math.random() * playingSeats.length);

        if (playingSeats.length == 2) {

            // We have to respect the different rules again for heads-up.  If we want the button to be Seat 1,
            // then we have to make it look like
            // 1   2   
            // SB  BB        <== Round payment 0
            // BB  SB        <== Round payment 1
            // So seat 1 will be the last one to have paid both, with the BB most recently
            for (let i = 0; i < this.blinds.length; i++) {

                const rp: RoundPayments = new RoundPayments();

                for (let j = 0; j < this.blinds.length; j++) {

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
                    rp.addPayment(playingSeats[blindSeatIndex].player.userID, this.blinds[j].index);

                }

                // add this round of blinds
                this.roundPayments.push(rp);

            }


        }
        else {


            // Say we have 4 players, and we have randomly picked Seat #4 to be the button
            // After we have set up some fake blind payments then we want it to look like:
            // 1   2   3   4
            // BB          SB           <== Round payment 1
            //         SB  BB           <== Round payment 2
            // So seat 4 will be the last one to have paid both
            for (let i = 0; i < this.blinds.length; i++) {

                const rp: RoundPayments = new RoundPayments();

                for (let j = 0; j < this.blinds.length; j++) {

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
                    rp.addPayment(playingSeats[blindSeatIndex].player.userID, this.blinds[j].index);

                }

                // add this round of blinds
                this.roundPayments.push(rp);

            }

        }   // more than 2 players

        debugger;

        // now that it's set up properly we can call this method again and it will (SHOULD) get a 
        // valid result this time
        return this.determineLastPayorOfBlinds(table);

    }   // determineLastPayorOfBlinds


    public addPayments(table: Table, userID: number, forcedBets: (Ante | Blind)[]) {

        if (!this.currentRoundPayments) {
            this.currentRoundPayments = new RoundPayments();
        }

        for (let bet of forcedBets) {

            if (bet instanceof Blind) {

                if (this.blindsNeedingPaying.length
                    && this.blindsNeedingPaying[0].index == bet.index
                    && this.blindSeatIndexes.has(bet.index)
                    && table.seats[this.blindSeatIndexes.get(bet.index)].player?.userID === userID) {

                    // This is who is supposed to pay the X blind, so cross it off the list
                    this.blindsNeedingPaying.shift();

                }

                // Mark each blind index that they paid this round
                this.currentRoundPayments.addPayment(userID, bet.index);

            }

        }

    }

    public saveBlindPayments(): void {

        debugger;
        this.roundPayments.push(this.currentRoundPayments);
        this.currentRoundPayments = null;

    }



    public calculateNextForcedBet(table: Table): boolean {

        if (this.buttonIndex == null) {
            throw new Error("Cannot determine forced bets if buttonIndex is null");
        }

        const forcedBets: (Ante | Blind)[] = [];

        if (this.blindsNeedingPaying.length) {

            let requiredBlind: Blind = this.blindsNeedingPaying[0];
            let requiredBlindIndex: number = requiredBlind.index;

            let seatIndex: number = null;

            if (!this.blindSeatIndexes.has(requiredBlindIndex)) {

                // Figure out who should pay the blind.  
                // Usually it would go D -> SB -> BB, but heads up the dealer is also the small blind

                const playingSeats: Seat[] = table.seats.filter(seat => seat.isInHand);

                if (playingSeats.length == 2) {

                    if (requiredBlindIndex == 0) {

                        // it's the small blind, so set it to be the button
                        seatIndex = this.buttonIndex;

                    }
                    else {

                        // it must be the big blind, so it's whatever player is NOT the button
                        seatIndex = table.findNextActiveSeatIndex(this.buttonIndex + 1);

                    }

                }
                else {

                    // More than 2 players, so do the usual DE -> SB -> BB

                    seatIndex = this.buttonIndex;

                    // Set the BB 2 seats past the button
                    // Set the SB 1 seat past the button
                    for (let b = 0; b < (requiredBlindIndex + 1); b++) {

                        seatIndex = table.findNextActiveSeatIndex(seatIndex + 1);

                    }

                }

            }
            else {

                // Find the next player AFTER the most recent payee
                seatIndex = table.findNextActiveSeatIndex(this.blindSeatIndexes.get(requiredBlindIndex) + 1);

            }

            this.blindSeatIndexes.set(requiredBlindIndex, seatIndex);

            forcedBets.push(new Blind(requiredBlindIndex, this.blinds[requiredBlindIndex].type, this.blinds[requiredBlindIndex].name, this.blinds[requiredBlindIndex].amount, this.blinds[requiredBlindIndex].isLiveBet));
            if (this.ante > 0) {

                forcedBets.push(new Ante(this.ante));

            }

            table.betStatus.seatIndex = seatIndex;
            table.betStatus.forcedBets = forcedBets;
            return true;

        }  // if blinds are still required

        if (this.ante > 0) {

        }

        // No blinds or antes remain to be paid
        return false;

    }  // calculateForcedBets


    public getBigBlindIndex(): number {

        if (this.blinds.length && this.blindSeatIndexes && this.blindSeatIndexes.has(this.blinds.length - 1)) {

            return this.blindSeatIndexes.get(this.blinds.length - 1);

        }

        return null;

    }


}