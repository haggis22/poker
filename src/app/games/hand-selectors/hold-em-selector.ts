import { BestHandSelector } from "./best-hand-selector";
import { Hand } from "../../hands/hand";
import { Board } from "../../casino/tables/boards/board";
import { HandEvaluator } from "../hand-evaluator";
import { HandEvaluation } from "../hand-evaluation";
import { Card } from "../../cards/card";
import { Combinator } from "../../math/combinator";

export class HoldEmSelector implements BestHandSelector {

    select(evaluator: HandEvaluator, playerHand: Hand, board: Board): HandEvaluation {

        let cards: Array<Card> = [];

        for (let card of playerHand.cards) {

            // Do not include FacedownCards
            if (card instanceof Card) {

                cards.push(card);

            }

        }

        // ...Add in the cards from the board
        cards = cards.concat(...board.cards);

        let bestHand: HandEvaluation = null;

        for (let possibleHand of Combinator.combine(cards, 5)) {

            let evaluation: HandEvaluation = evaluator.evaluate(possibleHand);

            if (bestHand == null || evaluation.compareTo(bestHand) > 0) {

                bestHand = evaluation;

            }

        }

        return bestHand;

    }



}