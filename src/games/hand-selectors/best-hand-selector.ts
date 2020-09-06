import { Hand } from "../../hands/hand";
import { Board } from "../../casino/tables/boards/board";
import { HandEvaluator } from "../hand-evaluator";
import { HandEvaluation } from "../hand-evaluation";

export interface BestHandSelector {

    select(evaluator: HandEvaluator, playerHand: Hand, board: Board): HandEvaluation

}