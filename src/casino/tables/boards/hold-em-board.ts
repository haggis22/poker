import { Board } from "./board";
import { Card } from "../../../cards/card";

export class HoldEmBoard implements Board {


    public cards: Array<Card>;


    constructor() {

        this.cards = new Array<Card>();

    }


    public reset(): void {

        console.log('Holdem Board clearing out the cards');
        this.cards.length = 0;

    }


    public deal(card: Card): void {

        this.cards.push(card);

    }

}