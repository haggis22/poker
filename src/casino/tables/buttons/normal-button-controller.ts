import { IButtonController } from "./i-button-controller";
import { Table } from "../table";

export class NormalButtonController implements IButtonController {


    private buttonIndex: number;


    constructor() {

        this.buttonIndex = null;

    }


    private log(message: string): void {

        console.log('\x1b[31m%s\x1b[0m', `NormalButtonController: ${message}`);

    }


    public reset() {


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

    }


}