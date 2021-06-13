import { Board } from "./board";
import { Card } from "../../../cards/card";

export class NoBoard implements Board {

    public cards: Array<Card>;

    constructor() {

        this.cards = new Array<Card>();

    }

    reset(): void {
    }

    deal(card: Card): void {
        throw new Error("Method not implemented.");
    }


    public clone(): Board {

        return new NoBoard();

    }


}