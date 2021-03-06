import { TableAction } from "../table-action";
import { Player } from "../../../players/player";

export class PlayerSeatedAction extends TableAction {

    public player: Player;
    public seatIndex: number;


    constructor(tableID: number, player: Player, seatIndex: number) {

        super(tableID);

        this.player = player;
        this.seatIndex = seatIndex;

    }

}