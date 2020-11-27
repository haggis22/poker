import { BestHandSelector } from "./best-hand-selector";
import { Hand } from "../../hands/hand";
import { Board } from "../../casino/tables/boards/board";
import { HandEvaluator } from "../hand-evaluator";
import { HandEvaluation } from "../hand-evaluation";
import { Card } from "../../cards/card";
import { Combinator } from "../../math/combinator";

export class Best5InHandSelector implements BestHandSelector {

    select(evaluator: HandEvaluator, playerHand: Hand, board: Board): HandEvaluation {

        let cards: Array<Card> = [];

        for (let card of playerHand.cards) {

            // Do not include FacedownCards
            if (card instanceof Card && card.isFaceUp) {

                cards.push(card);

            }

        }

/*

        console.log(`Player has [ ${cards.map(card => card.value.symbol + card.suit.symbol).join(" ")} ]`);
        let combos: Array<Array<Card>> = Combinator.combine(cards, 5);

        for (let c = 0; c < combos.length; c++) {
            console.log(`Possible #${(c + 1)}: [ ${combos[c].map(card => card.value.symbol + card.suit.symbol).join(" ")} ] `);
        }
*/

        let bestHand: HandEvaluation = null;

        for (let possibleHand of Combinator.combine(cards, 5)) {

            let evaluation: HandEvaluation = evaluator.evaluate(possibleHand);

            if (bestHand == null || evaluation.compareTo(bestHand) > 0) {

                bestHand = evaluation;

            }

        }

        console.log(`Best hand: [ ${bestHand.cards.map(card => card.value.symbol + card.suit.symbol).join(" ")} ]\n`);


        return evaluator.evaluate(cards);

    }



}