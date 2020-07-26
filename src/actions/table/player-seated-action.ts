import { Action } from "../action";
import { Player } from "../../players/player";

export class PlayerSeatedAction implements Action {

    public tableID: number;
    public player: Player;
    public seatIndex: number;


    constructor(tableID: number, player: Player, seatIndex: number) {
        this.tableID = tableID;
        this.player = player;
        this.seatIndex = seatIndex;
    }

}