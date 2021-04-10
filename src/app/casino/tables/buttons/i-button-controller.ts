import { Table } from "../table";
import { BlindTracker } from './blind-tracker';

export interface IButtonController {

    // Returns true if the button was moved successfully
    moveButton(table: Table, blindTracker: BlindTracker): boolean;

    calculateNextForcedBet(table: Table, blindTracker: BlindTracker): boolean;

}