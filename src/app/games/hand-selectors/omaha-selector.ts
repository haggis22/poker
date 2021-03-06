import { BestHandSelector } from "./best-hand-selector";
import { Hand } from "../../hands/hand";
import { Board } from "../../casino/tables/boards/board";
import { HandEvaluator } from "../hand-evaluator";
import { HandEvaluation } from "../hand-evaluation";
import { Card } from "../../cards/card";
import { Combinator } from "../../math/combinator";

export class OmahaSelector implements BestHandSelector {

    select(evaluator: HandEvaluator, playerHand: Hand, board: Board): HandEvaluation {

        let handCards: Array<Card> = [];

        for (let card of playerHand.cards) {

            // Do not include FacedownCards
            if (card instanceof Card) {

                handCards.push(card);

            }

        }

        // All combinations of exactly 2 cards from the player's hand...
        let handCombos: Array<Array<Card>> = Combinator.combine(handCards, 2);

        // ...Plus all combinations of exactly 3 cards from the board
        let boardCombos: Array<Array<Card>> = Combinator.combine([...board.cards], 3);

        let bestHand: HandEvaluation = null;

        for (let handCards of handCombos) {

            for (let boardCards of boardCombos) {

                let evaluation: HandEvaluation = evaluator.evaluate(handCards.concat(boardCards));

                if (bestHand == null || evaluation.compareTo(bestHand) > 0) {

                    bestHand = evaluation;

                }

            }

        }

        return bestHand;

    }



}