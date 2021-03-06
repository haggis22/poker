import { Board } from "./board";
import { Card } from "../../../cards/card";

export class HoldEmBoard implements Board {


    public cards: Array<Card>;


    constructor() {

        this.cards = new Array<Card>();

    }


    public reset(): void {

        this.cards.splice(0);

    }


    public deal(card: Card): void {

        this.cards.push(card);

    }

}