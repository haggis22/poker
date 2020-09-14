import { CardValue } from "./card-value"
import { CardSuit } from "./card-suit"

export class Card
{
    public sortValue: number;
    public value: CardValue;
    public suit: CardSuit;
    public isDealt: boolean;

    public constructor(value: CardValue, suit: CardSuit, isDealt: boolean)
    {
        this.value = value;
        this.suit = suit;
        this.sortValue = 0;
        this.isDealt = isDealt;
    }

    public toString(): string {

        return `${this.value.symbol}${this.suit.symbol}`;

    }

}