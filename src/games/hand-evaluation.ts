import { CardValue } from "../cards/card-value";
import { Hand } from "../hands/hand";

export interface HandEvaluation {

    rank: number;
    values: Array<CardValue>;
    hand: Hand;

    compareTo(h2: HandEvaluation): number;

}