import { PokerHandEvaluation } from "./poker-hand-evaluation";
import { HandEvaluation } from "../hand-evaluation";
import { HandDescriber } from "../hand-describer";

export class PokerHandDescriber implements HandDescriber {


    constructor() {

    }


    public describe(evaluation: HandEvaluation): string {

        if (!(evaluation instanceof PokerHandEvaluation)) {
            throw new Error("Hand evaluation is the wrong type");
        }

        let pokerHandEvaluation: PokerHandEvaluation = evaluation as PokerHandEvaluation;

        if (!evaluation.values || !evaluation.values.length) {

            return 'unknown hand';

        }

        switch (pokerHandEvaluation.rank) {

            case PokerHandEvaluation.RANK.HIGH_CARD:
                return `high card, ${evaluation.values[0].text}`;

            case PokerHandEvaluation.RANK.PAIR:
                return `pair of ${evaluation.values[0].plural}`;

            case PokerHandEvaluation.RANK.TWO_PAIR:
                return `two pair, ${evaluation.values[0].plural} and ${evaluation.values[1].plural}`;

            case PokerHandEvaluation.RANK.THREE_OF_A_KIND:
                return `three of a kind, ${evaluation.values[0].plural}`;

            case PokerHandEvaluation.RANK.STRAIGHT:
                return `straight, ${evaluation.values[0].text}-high`;

            case PokerHandEvaluation.RANK.FLUSH:
                return `flush, ${evaluation.values[0].text}-high`;

            case PokerHandEvaluation.RANK.FULL_HOUSE:
                return `full house, ${evaluation.values[0].plural} over ${evaluation.values[0].plural}`;

            case PokerHandEvaluation.RANK.FOUR_OF_A_KIND:
                return `four of a kind, ${evaluation.values[0].plural}`;

            case PokerHandEvaluation.RANK.STRAIGHT_FLUSH:
                return `straight flush, ${evaluation.values[0].text}-high`;

        }

    }

}