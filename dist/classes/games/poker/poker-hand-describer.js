"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.PokerHandDescriber = void 0;
const poker_hand_evaluation_1 = require("./poker-hand-evaluation");
class PokerHandDescriber {
    constructor() {
    }
    describe(evaluation) {
        if (!(evaluation instanceof poker_hand_evaluation_1.PokerHandEvaluation)) {
            throw new Error("Hand evaluation is the wrong type");
        }
        let pokerHandEvaluation = evaluation;
        if (!evaluation.values || !evaluation.values.length) {
            return 'unknown hand';
        }
        switch (pokerHandEvaluation.rank) {
            case poker_hand_evaluation_1.PokerHandEvaluation.RANK.HIGH_CARD:
                return `high card, ${evaluation.values[0].text}`;
            case poker_hand_evaluation_1.PokerHandEvaluation.RANK.PAIR:
                return `pair of ${evaluation.values[0].plural}`;
            case poker_hand_evaluation_1.PokerHandEvaluation.RANK.TWO_PAIR:
                return `two pair, ${evaluation.values[0].plural} and ${evaluation.values[1].plural}`;
            case poker_hand_evaluation_1.PokerHandEvaluation.RANK.THREE_OF_A_KIND:
                return `three of a kind, ${evaluation.values[0].plural}`;
            case poker_hand_evaluation_1.PokerHandEvaluation.RANK.STRAIGHT:
                return `straight, ${evaluation.values[0].text}-high`;
            case poker_hand_evaluation_1.PokerHandEvaluation.RANK.FLUSH:
                return `flush, ${evaluation.values[0].text}-high`;
            case poker_hand_evaluation_1.PokerHandEvaluation.RANK.FULL_HOUSE:
                return `full house, ${evaluation.values[0].plural} over ${evaluation.values[0].plural}`;
            case poker_hand_evaluation_1.PokerHandEvaluation.RANK.FOUR_OF_A_KIND:
                return `four of a kind, ${evaluation.values[0].plural}`;
            case poker_hand_evaluation_1.PokerHandEvaluation.RANK.STRAIGHT_FLUSH:
                return `straight flush, ${evaluation.values[0].text}-high`;
        }
    }
}
exports.PokerHandDescriber = PokerHandDescriber;
