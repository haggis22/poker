import { HandEvaluation } from "./hand-evaluation";

export class HandDescriber {


    constructor() {

    }


    public describe(evaluation: HandEvaluation): string {

        switch (evaluation.rank) {

            case HandEvaluation.RANK.HIGH_CARD:
                return `high card, ${evaluation.values[0].text}`;

            case HandEvaluation.RANK.PAIR:
                return `pair of ${evaluation.values[0].plural}`;

            case HandEvaluation.RANK.TWO_PAIR:
                return `two pair, ${evaluation.values[0].plural} and ${evaluation.values[1].plural}`;

            case HandEvaluation.RANK.THREE_OF_A_KIND:
                return `three of a kind, ${evaluation.values[0].plural}`;

            case HandEvaluation.RANK.STRAIGHT:
                return `straight, ${evaluation.values[0].text}-high`;

            case HandEvaluation.RANK.FLUSH:
                return `flush, ${evaluation.values[0].text}-high`;

            case HandEvaluation.RANK.FULL_HOUSE:
                return `full house, ${evaluation.values[0].plural} over ${evaluation.values[0].plural}`;

            case HandEvaluation.RANK.FOUR_OF_A_KIND:
                return `four of a kind, ${evaluation.values[0].plural}`;

            case HandEvaluation.RANK.STRAIGHT:
                return `straight flush, ${evaluation.values[0].text}-high`;

        }

    }

}