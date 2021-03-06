import { IButtonController } from "./i-button-controller";
import { Table } from "../table";
import { ForcedBets } from "../betting/forced-bets";
import { Seat } from "../seat";
import { Ante } from "../betting/ante";
import { Blind } from "../betting/blind";

export class NormalButtonController implements IButtonController {


    private buttonIndex: number;

    // A set of all the seat indexes that have already paid their ForcedBet. I was doing something where
    // it would go around until it hit the same number again, but when the original blinder didn't pay and
    // were folded, then they would always get skipped and so blinding would go on forever.
    private hasForcedBet: Set<number>;

    private expectedBlinds: Map<number, Array<Blind>>;

    private forcedBetIndex: number;



    constructor() {

        this.hasForcedBet = new Set<number>();

        this.resetOpenState();


    }


    private log(message: string): void {

        console.log('\x1b[31m%s\x1b[0m', `NormalButtonController: ${message}`);

    }


    public resetOpenState(): void {

        this.resetHand();

        this.buttonIndex = null;

    }

    public resetHand(): void {

        this.forcedBetIndex = null;
        this.hasForcedBet.clear();

    }


    private isHandStillLive(table: Table): boolean {

        return table.seats.filter(seat => seat.isInHand).length > 1;

    }   // isHandStillLive


    public moveButton(table: Table): boolean {

        this.log(`In moveButton for table ${table.id}`)

        this.expectedBlinds = new Map<number, Array<Blind>>();

        if (!this.isHandStillLive(table)) {

            // We don't have enough players, so can't set the button
            this.log(`In moveButton for table ${table.id} - not enough players, so returning false`);
            return false;

        }

        let numPlayers: number = table.seats.filter(seat => seat.isInHand).length;

        // If the button has not been set then randomly assign it to one of the seats
        this.buttonIndex = this.buttonIndex == null ? Math.floor(Math.random() * table.seats.length) : (this.buttonIndex + 1);

        table.betStatus.bigBlindIndex = null;

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


        if (table.stakes.blinds.length) {

            // TODO: parcel out the blinds according to the stakes properly
            let smallBlind: Blind = table.stakes.blinds.find(blind => blind.type == Blind.TYPE_SMALL);
            let bigBlind: Blind = table.stakes.blinds.find(blind => blind.type == Blind.TYPE_BIG);

            if (numPlayers == 2) {

                // heads-up, the button is the small blind...
                this.expectedBlinds.set(this.buttonIndex, [smallBlind]);

                // find the big blind index 
                let bbIndex = this.findNextActiveSeatIndex(table, this.buttonIndex + 1);
                if (bbIndex == null) {
                    throw new Error("Could not find Big Blind index");
                }

                this.expectedBlinds.set(bbIndex, [bigBlind]);
                table.betStatus.bigBlindIndex = bbIndex;


            }
            else {

                // ...usually, the blinds start from the left of the dealer
                let sbIndex: number = this.findNextActiveSeatIndex(table, this.buttonIndex + 1);

                if (sbIndex == null) {
                    throw new Error("Could not find Small Blind index");
                }

                this.expectedBlinds.set(sbIndex, [smallBlind]);

                // find the big blind index 
                let bbIndex = this.findNextActiveSeatIndex(table, sbIndex + 1);
                if (bbIndex == null) {
                    throw new Error("Could not find Big Blind index");
                }

                this.expectedBlinds.set(bbIndex, [bigBlind]);
                table.betStatus.bigBlindIndex = bbIndex;

            }

        }
            

        return true;

    }  // moveButton


    private findNextActiveSeatIndex(table: Table, startIndex: number): number {

        if (startIndex >= table.seats.length) {
            startIndex = 0;
        }

        let seatIndex: number = startIndex;

        while (true) {

            if (table.seats[seatIndex].isInHand) {

                return seatIndex;

            }

            seatIndex++;

            if (seatIndex >= table.seats.length) {
                seatIndex = 0;
            }

            // We went all the way around and found nothing
            if (seatIndex === startIndex) {
                return null;
            }

        }

    }


    public calculateForcedBets(table: Table): ForcedBets {

        if (this.buttonIndex == null) {
            throw new Error("Cannot determine forced bets if buttonIndex is null");
        }

        // we just did the button on a previous call, so we're all done
        if (this.buttonIndex === this.forcedBetIndex) {

            return null;

        }

        if (this.forcedBetIndex == null) {

            // start to the left of the button!
            this.forcedBetIndex = this.buttonIndex + 1;

        }
        else {

            this.forcedBetIndex = this.forcedBetIndex + 1;

        }

        let startingIndex: number = this.forcedBetIndex;

        while (true) {

            if (this.forcedBetIndex >= table.seats.length) {
                this.forcedBetIndex = 0;
            }

            let seat: Seat = table.seats[this.forcedBetIndex];

            if (seat.player && !seat.player.isSittingOut) {

                // mark them has having had their forced bet calculated
                this.hasForcedBet.add(seat.index);

                let bets: Array<Ante | Blind> = new Array<Ante | Blind>();

                if (table.stakes.ante > 0) {

                    bets.push(new Ante(table.stakes.ante));

                }

                if (this.expectedBlinds.has(seat.index)) {

                    bets.push(...this.expectedBlinds.get(seat.index));

                }

                if (bets.length) {

                    let forcedBets: ForcedBets = new ForcedBets(this.forcedBetIndex, bets);
                    table.betStatus.forcedBets = forcedBets;
                    return forcedBets;

                }

            }

            this.forcedBetIndex++;

            if (this.forcedBetIndex >= table.seats.length) {
                this.forcedBetIndex = 0;
            }

            if (this.hasForcedBet.has(this.forcedBetIndex))
            {
                // we've already given this seat a bet 

                table.betStatus.forcedBets = null;
                return null;

            }

        }

    }  // calculateForcedBets


}