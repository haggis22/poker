import { Action } from "../action";
import { Player } from "../../players/player";

export class PlayerSeatedAction implements Action {

    public tableID: number;
    public player: Player;
    public seatID: number;


    constructor(tableID: number, player: Player, seatID: number) {
        this.tableID = tableID;
        this.player = player;
        this.seatID = seatID;
    }

}