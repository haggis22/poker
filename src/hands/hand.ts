import { FacedownCard } from "../cards/face-down-card";
import { Card } from "../cards/card";

export class Hand {

    public cards: Array<Card | FacedownCard>;


    constructor() {

        this.cards = new Array<Card | FacedownCard>();

    }

    public reset(): void {

        this.cards.length = 0;

    }

    public deal(card: Card | FacedownCard): void {

        this.cards.push(card);

    }


    public flipCards(): void {

        for (let card of this.cards) {

            if (card instanceof Card) {

                card.isFaceUp = true;

            }

        }

    }


}