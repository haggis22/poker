import { Card } from "./card";

export class Hand {

    public cards: Array<Card>;

    constructor() {

        this.cards = new Array<Card>();

    }

    public reset(): void {

        this.cards.length = 0;

    }

    public deal(card: Card) : void {

        this.cards.push(card);

    }


    public display(): string {

        return this.cards.map(card => card.toString()).join(" ");

    }

}