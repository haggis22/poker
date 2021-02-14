import { IButtonController } from "./i-button-controller";
import { Table } from "../table";
import { ForcedBets } from "../betting/forced-bets";
import { Seat } from "../seat";
import { Ante } from "../betting/ante";
import { Blind } from "../betting/blind";

export class NormalButtonController implements IButtonController {


    private buttonIndex: number;

    private forcedBetIndex: number;



    constructor() {

        this.resetOpenState();

    }


    private log(message: string): void {

        console.log('\x1b[31m%s\x1b[0m', `NormalButtonController: ${message}`);

    }


    public resetOpenState(): void {

        this.buttonIndex = null;

    }

    public resetHand(): void {

        this.forcedBetIndex = null;

    }


    private isHandStillLive(table: Table): boolean {

        return table.seats.filter(seat => seat.isInHand).length > 1;

    }   // isHandStillLive


    public moveButton(table: Table): boolean {

        this.log(`In moveButton for table ${table.id}`)

        if (!this.isHandStillLive(table)) {

            // We don't have enough players, so can't set the button
            this.log(`In moveButton for table ${table.id} - not enough players, so returning false`);
            return false;

        }

        // If the button has not been set then randomly assign it to one of the seats
        this.buttonIndex = this.buttonIndex == null ? Math.floor(Math.random() * table.seats.length) : (this.buttonIndex + 1);

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

    }  // moveButton


    public calculateForcedBets(table: Table): ForcedBets {

        if (this.buttonIndex == null) {
            throw new Error("Cannot determine forced bets if buttonIndex is null");
        }

        // we just did the button on a previous call, so we're all done
        if (this.buttonIndex === this.forcedBetIndex) {

            return null;

        }

        let startingIndex: number = this.forcedBetIndex = this.forcedBetIndex == null ? this.buttonIndex + 1 : this.forcedBetIndex + 1;

        while (true) {

            if (this.forcedBetIndex >= table.seats.length) {
                this.forcedBetIndex = 0;
            }

            let seat: Seat = table.seats[this.forcedBetIndex];

            if (seat.player && !seat.player.isSittingOut) {

                let bets: Array<Ante | Blind> = new Array<Ante | Blind>();

                if (table.stakes.ante > 0) {

                    bets.push(new Ante(table.stakes.ante));

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

            if (this.forcedBetIndex == startingIndex)
            {
                table.betStatus.forcedBets = null;
                return null;

            }

        }

    }  // calculateForcedBets


}