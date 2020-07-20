import { BestHandSelector } from "./best-hand-selector";
import { Hand } from "../../hands/hand";
import { Board } from "../../casino/tables/boards/board";
import { HandEvaluator } from "../hand-evaluator";
import { HandEvaluation } from "../hand-evaluation";

export class Best5InHandSelector implements BestHandSelector {

    select(evaluator: HandEvaluator, playerHand: Hand, board: Board): HandEvaluation {

        let cards = playerHand.cards.filter(card => card.isFaceUp);

        if (cards.length > 5) {

            // for now, just choose the first 5 cards
            // TODO: look at all the permutations
            let hand = new Hand();
            hand.cards = [...cards.slice(0, 5)];

            return evaluator.evaluate(hand);

        }

        let hand = new Hand();
        hand.cards = [...cards];

        return evaluator.evaluate(hand);

    }



}