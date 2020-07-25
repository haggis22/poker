import { DealtCard } from "./dealt-card";

export class Hand {

    public cards: Array<DealtCard>;

    constructor() {

        this.cards = new Array<DealtCard>();

    }

    public reset(): void {

        this.cards.length = 0;

    }

    public deal(card: DealtCard) : void {

        this.cards.push(card);

    }


    public flipCards(): void {

        for (let card of this.cards) {

            card.isFaceUp = true;

        }

    }


}