import { IButtonController } from "./i-button-controller";
import { Table } from "../table";

export class NormalButtonController implements IButtonController {


    private tableID: number;

    constructor(tableID: number) {

        this.tableID = tableID;

    }


    private log(message: string): void {

        console.log('\x1b[31m%s\x1b[0m', `NormalButtonController Table ${this.tableID}: ${message}`);

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
        let buttonIndex: number = table.buttonIndex == null ? Math.floor(Math.random() * table.seats.length) : (table.buttonIndex + 1);

        let foundButton = false;

        while (!foundButton) {

            if (buttonIndex >= table.seats.length) {

                buttonIndex = 0;

            }

            if (table.seats[buttonIndex].isInHand) {
                foundButton = true;
            }
            else {
                buttonIndex++;
            }

        }

        table.buttonIndex = buttonIndex;
        this.log(`In moveButton for table ${table.id} - setting button to ${buttonIndex}`);
        return true;

    }


}