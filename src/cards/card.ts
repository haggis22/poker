import { CardValue } from "./card-value"
import { CardSuit } from "./card-suit"
import { FacedownCard } from "./face-down-card";

export class Card
{
    public sortValue: number;
    public value: CardValue;
    public suit: CardSuit;
    public isFaceUp: boolean;

    public constructor(value: CardValue, suit: CardSuit, isFaceUp: boolean)
    {
        this.value = value;
        this.suit = suit;
        this.isFaceUp = isFaceUp;

        this.sortValue = 0;
    }

    public toString(): string {

        return `${this.value.symbol}${this.suit.symbol}`;

    }

    public equals(card: Card | FacedownCard): boolean {

        return card
            && card instanceof Card
            && card.value && this.value && card.value.value === this.value.value
            && card.suit && this.suit && card.suit.value === this.suit.value;

    }

}