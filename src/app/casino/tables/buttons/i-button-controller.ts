import { Table } from "../table";
import { Blind } from '../betting/blind';
import { Ante } from '../betting/ante';

export interface IButtonController {

    resetForOpenState(): void;

    resetHand(): void;

    // Returns true if the button was moved successfully
    moveButton(table: Table): boolean;

    addPayments(table: Table, userID: number, forcedBets: (Ante | Blind)[]): void;

    saveBlindPayments(): void;

    calculateNextForcedBet(table: Table): boolean;

    getBigBlindIndex(): number;


}