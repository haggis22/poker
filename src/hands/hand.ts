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


    public display(): string {

        return this.cards.map(dealtCard => dealtCard.toString()).join(" ");

    }

}