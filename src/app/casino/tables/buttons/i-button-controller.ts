import { Table } from "../table";
import { BlindTracker } from './blind-tracker';

export interface IButtonController {

    calculateNextForcedBet(table: Table, blindTracker: BlindTracker): boolean;

}