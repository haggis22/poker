import { Hand } from "../../hands/hand";
import { Player } from "../../players/player";
import { Card } from "../../cards/card";
import { FacedownCard } from "../../cards/face-down-card";

export class Seat {

    public index: number;
    public player: Player;
    public hand: Hand;

    // set to true by the TableController whenever a hand is started and the player is not sitting out
    public isInHand: boolean;


    constructor(index: number) {

        this.index = index;

        this.player = null;
        this.hand = null;
        this.isInHand = false;

    }

    public getName(): string {

        return this.player ? this.player.name : this.getSeatName();

    }

    public getSeatName(): string {

        return `Seat ${(this.index + 1)}`;

    }

    public deal(card: Card | FacedownCard): void {

        if (!this.hand) {
            this.hand = new Hand();
        }

        this.hand.deal(card);

    }


    public clearHand(): void {

        this.hand = null;
        this.isInHand = false;

    }


}