import { Card } from "./card";
import { CardValue } from "./card-value";
import { CardSuit } from "./card-suit";

export class Deck {

    public cards: Array<Card>

    constructor() {

        this.cards = new Array();

    }

    private reset(): void 
    {
        this.cards.length = 0;

        for (let value of CardValue.VALUES) {

            for (let suit of CardSuit.VALUES) {

                    this.cards.push(new Card(value, suit, false));

            }

        }

    }


    public shuffle(): void {

        // Build a fresh deck and then shuffle up
        this.reset();

        this.shuffleRemaining();

    }

    public shuffleRemaining(): void {

        for (let card of this.cards) {
            card.sortValue = Math.random();
        }

        this.cards.sort((a, b) => a.sortValue - b.sortValue);

    }


    public clone(): Deck {

        const cloneDeck: Deck = new Deck();

        cloneDeck.cards.push(...this.cards);

        return cloneDeck;

    }


    public display(): string {

        return this.cards.map(card => card.toString()).join(" ");

    }

    public deal(): Card {

        return this.cards.pop();

    }

}