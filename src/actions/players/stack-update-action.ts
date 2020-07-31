import { Action } from "../action";

export class StackUpdateAction implements Action {

    public tableID: number;
    public playerID: number;
    public chips: number;


    constructor(tableID: number, playerID: number, chips: number) {
        this.tableID = tableID;
        this.playerID = playerID;
        this.chips = chips;
    }

}