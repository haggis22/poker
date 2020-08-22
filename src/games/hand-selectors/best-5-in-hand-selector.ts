import { BestHandSelector } from "./best-hand-selector";
import { Hand } from "../../hands/hand";
import { Board } from "../../casino/tables/boards/board";
import { HandEvaluator } from "../hand-evaluator";
import { HandEvaluation } from "../hand-evaluation";
import { Card } from "../../cards/card";

export class Best5InHandSelector implements BestHandSelector {

    select(evaluator: HandEvaluator, playerHand: Hand, board: Board): HandEvaluation {

        let cards: Card[] = playerHand.cards.reduce((cardArray, dealtCard) => { if (dealtCard.isFaceUp) { cardArray.push(dealtCard.card); } return cardArray; }, []);

        if (cards.length > 5) {

            cards = cards.slice(0, 5);

        }

        return evaluator.evaluate(cards);

    }



}