import { CardValue } from "../cards/card-value";
import { Card } from "../cards/card";

export interface HandEvaluation {

    rank: number;
    values: Array<CardValue>;
    cards: Card[];

    compareTo(h2: HandEvaluation): number;

}