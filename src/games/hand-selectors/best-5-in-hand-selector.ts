import { BestHandSelector } from "./best-hand-selector";
import { Hand } from "../../hands/hand";
import { Board } from "../../casino/tables/boards/board";
import { HandEvaluator } from "../hand-evaluator";
import { HandEvaluation } from "../hand-evaluation";

export class Best5InHandSelector implements BestHandSelector {

    select(evaluator: HandEvaluator, hand: Hand, board: Board): HandEvaluation {

        let bestHand = null;

        let cards = hand.cards.filter(card => card.isFaceUp);

        if (cards.length > 5) {

            bestHand = new Hand();
            bestHand.cards = [...cards.slice(0, 5)];
            return bestHand;

        }

        bestHand = new Hand();
        bestHand.cards = [...cards];

        return bestHand;

    }



}