import { Board } from "./board";
import { Card } from "../../../cards/card";

export class NoBoard implements Board {

    public cards: Array<Card>;

    constructor() {

        this.cards = new Array<Card>();

    }

    reset(): void {
    }

    deal(card: Card) {
        throw new Error("Method not implemented.");
    }

}