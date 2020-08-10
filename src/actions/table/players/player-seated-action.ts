import { TableAction } from "../table-action";
import { Player } from "../../../players/player";
import { Serializable } from "../../../communication/serializable";

export class PlayerSeatedAction extends TableAction implements Serializable {

    public isSerializable: boolean = true;

    public player: Player;
    public seatIndex: number;


    constructor(tableID: number, player: Player, seatIndex: number) {

        super(tableID);

        this.player = player;
        this.seatIndex = seatIndex;
    }

}