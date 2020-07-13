import { HandEvaluation } from "./hand-evaluation";

export interface HandDescriber {

    describe(handEvaluation: HandEvaluation): string;

}