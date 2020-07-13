import { Hand } from "../hands/hand";
import { HandEvaluation } from "./hand-evaluation";

export interface HandEvaluator {

    evaluate(hand: Hand): HandEvaluation;

}