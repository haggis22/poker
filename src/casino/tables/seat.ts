import { Hand } from "../../hands/hand";
import { Player } from "../../players/player";
import { Serializable } from "../../communication/serializable";

export class Seat implements Serializable {

    public isSerializable: boolean = true;

    public index: number;
    public player: Player;
    public hand: Hand;


    constructor(index: number) {

        this.index = index;

        this.player = null;
        this.hand = null;

    }

    public getName(): string {

        return this.player ? this.player.name : `Seat ${(this.index + 1)}`;

    }

}