import { Card } from "../cards/card";

export class DealtCard {

    public card: Card;
    public isFaceUp: boolean;


    constructor(card: Card, isFaceUp: boolean) {
        this.card = card;
        this.isFaceUp = isFaceUp;
    }

    public toString(): string {

        return this.isFaceUp
            ? this.card.toString()
            : '??';


    }

}