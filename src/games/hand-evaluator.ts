import { HandEvaluation } from "./hand-evaluation";
import { Card } from "../cards/card";

export interface HandEvaluator {

    evaluate(cards: Card[]): HandEvaluation;

}