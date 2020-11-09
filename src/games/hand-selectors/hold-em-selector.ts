import { BestHandSelector } from "./best-hand-selector";
import { Hand } from "../../hands/hand";
import { Board } from "../../casino/tables/boards/board";
import { HandEvaluator } from "../hand-evaluator";
import { HandEvaluation } from "../hand-evaluation";
import { Card } from "../../cards/card";

export class HoldEmSelector implements BestHandSelector {

    select(evaluator: HandEvaluator, playerHand: Hand, board: Board): HandEvaluation {

        let cards: Array<Card> = [];

        for (let card of playerHand.cards) {

            // Do not include FacedownCards
            if (card instanceof Card) {

                cards.push(card);

            }

        }

        cards = cards.concat(...board.cards);

        if (cards.length > 5) {

            cards = cards.slice(0, 5);

        }




        return evaluator.evaluate(cards);

    }



}