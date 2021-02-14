import { Table } from "../table";

export interface IButtonController {

    reset(): void;

    // Returns true if the button was moved successfully
    moveButton(table: Table): boolean;

}