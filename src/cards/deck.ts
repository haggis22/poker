import { Card } from "./card";
import { CardValue } from "./card-value";
import { CardSuit } from "./card-suit";

export class Deck {

    private cards: Array<Card>

    constructor() {

        this.shuffle();

    }

    private reset(): void 
    {
        this.cards = new Array();

        for (let value of CardValue.VALUES) {

            for (let suit of CardSuit.VALUES) {

                    this.cards.push(new Card(value, suit));

            }

        }

    }


    public shuffle(): void {

        this.reset();

        console.log(`Num items: ${this.cards.length}`);

        for (let card of this.cards) {
            card.sortValue = Math.random();
        }

        this.cards.sort((a, b) => a.sortValue - b.sortValue);

    }

    public display(): string {

        return this.cards.map(card => card.toString()).join(" ");

    }

    public deal(): Card {

        return this.cards.pop();

    }

}