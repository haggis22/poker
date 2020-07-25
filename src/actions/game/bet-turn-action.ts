import { Action } from "../action";
import { BetTurn } from "../../casino/tables/betting/bet-turn";

export class BetTurnAction implements Action {

    public tableID: number;
    public turn: BetTurn

    constructor(tableID: number, turn: BetTurn) {

        this.tableID = tableID;
        this.turn = turn;

    }


}