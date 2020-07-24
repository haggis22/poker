import { Hand } from "../../hands/hand";
import { Player } from "../../players/player";

export class Seat {

    public id: number;
    public player: Player;
    public hand: Hand


    constructor(id) {

        this.id = id;

        this.player = null;
        this.hand = null;

    }

}