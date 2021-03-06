import { Table } from "../table";
import { ForcedBets } from "../betting/forced-bets";

export interface IButtonController {

    resetOpenState(): void;

    resetHand(): void;

    // Returns true if the button was moved successfully
    moveButton(table: Table): boolean;

    calculateForcedBets(table: Table): ForcedBets;


}