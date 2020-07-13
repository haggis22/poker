import { CardValue } from "../cards/card-value";

export interface HandEvaluation {

    rank: number;
    values: Array<CardValue>;

    compareTo(h2: HandEvaluation): number;

}