import { Card } from "../../../cards/card";

export interface Board {

    cards: Array<Card>;

    reset(): void;

    deal(card: Card): void;

}