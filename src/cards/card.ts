import { CardValue } from "./card-value"
import { CardSuit } from "./card-suit"

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

}