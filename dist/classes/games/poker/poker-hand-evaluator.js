"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.PokerHandEvaluator = void 0;
const poker_hand_evaluation_1 = require("./poker-hand-evaluation");
const card_value_1 = require("../../cards/card-value");
class PokerHandEvaluator {
    constructor(numCardsRequiredForStraightAndFlushes) {
        this.DEFAULT_NUM_CARDS_REQUIRED_FOR_STRAIGHTS_AND_FLUSHES = 5;
        this.numCardsRequiredForStraightAndFlushes = typeof numCardsRequiredForStraightAndFlushes === 'undefined'
            ? this.DEFAULT_NUM_CARDS_REQUIRED_FOR_STRAIGHTS_AND_FLUSHES
            : numCardsRequiredForStraightAndFlushes;
    }
    sort(cards) {
        cards.sort((a, b) => b.value.value - a.value.value);
    }
    evaluate(cards) {
        this.sort(cards);
        let byValue = new Map();
        let bySuit = new Map();
        let isFlush = false;
        for (let card of cards) {
            byValue.set(card.value, (byValue.has(card.value) ? byValue.get(card.value) : 0) + 1);
            bySuit.set(card.suit, (bySuit.has(card.suit) ? bySuit.get(card.suit) : 0) + 1);
            if (bySuit.get(card.suit) === this.numCardsRequiredForStraightAndFlushes) {
                isFlush = true;
            }
        }
        let numPairs = 0;
        let numThrees = 0;
        let numFours = 0;
        for (let cardValue of byValue.keys()) {
            if (byValue.get(cardValue) === 2) {
                numPairs++;
            }
            else if (byValue.get(cardValue) === 3) {
                numThrees++;
            }
            else if (byValue.get(cardValue) === 4) {
                numFours++;
            }
        }
        // This will hold the values of the cards, in order of importance.
        // If the user has a pair, for example, then the first position will hold the face value of the pair. After that, in descending order, will be the kickers
        let values = new Array();
        if (numFours > 0) {
            for (let cardValue of byValue.keys()) {
                if (byValue.get(cardValue) === 4) {
                    // Always put the four-of-a-kind value at the start
                    values.unshift(cardValue);
                }
                else {
                    // put the non-four-of-a-kind at the end
                    values.push(cardValue);
                }
            }
            return new poker_hand_evaluation_1.PokerHandEvaluation(poker_hand_evaluation_1.PokerHandEvaluation.RANK.FOUR_OF_A_KIND, values, cards);
        }
        if (numThrees > 0 && numPairs > 0) {
            for (let cardValue of byValue.keys()) {
                if (byValue.get(cardValue) === 3) {
                    // Always put the three-of-a-kind value at the start
                    values.unshift(cardValue);
                }
                else {
                    // put the two-of-a-kind at the end
                    values.push(cardValue);
                }
            }
            return new poker_hand_evaluation_1.PokerHandEvaluation(poker_hand_evaluation_1.PokerHandEvaluation.RANK.FULL_HOUSE, values, cards);
        }
        if (numThrees > 0) {
            let kickers = new Array();
            for (let cardValue of byValue.keys()) {
                if (byValue.get(cardValue) === 3) {
                    // Always put the three-of-a-kind value at the start
                    values.unshift(cardValue);
                }
                else {
                    // remember the kickers and we'll sort them in order
                    kickers.push(cardValue);
                }
            }
            kickers.sort((k1, k2) => k2.value - k1.value);
            // Put the kickers at the end, in descending order
            values.push(kickers[0]);
            values.push(kickers[1]);
            return new poker_hand_evaluation_1.PokerHandEvaluation(poker_hand_evaluation_1.PokerHandEvaluation.RANK.THREE_OF_A_KIND, values, cards);
        }
        if (numPairs > 0) {
            let pairs = new Array();
            let kickers = new Array();
            for (let cardValue of byValue.keys()) {
                if (byValue.get(cardValue) === 2) {
                    // Remember the pair(s) and we'll sort them in order
                    pairs.push(cardValue);
                }
                else {
                    // remember the kickers and we'll sort them in order
                    kickers.push(cardValue);
                }
            }
            pairs.sort((p1, p2) => p2.value - p1.value);
            kickers.sort((k1, k2) => k2.value - k1.value);
            values = [...pairs, ...kickers];
            return new poker_hand_evaluation_1.PokerHandEvaluation(numPairs == 2 ? poker_hand_evaluation_1.PokerHandEvaluation.RANK.TWO_PAIR : poker_hand_evaluation_1.PokerHandEvaluation.RANK.PAIR, values, cards);
        }
        if (cards.length === this.numCardsRequiredForStraightAndFlushes && cards[0].value.value - cards[this.numCardsRequiredForStraightAndFlushes - 1].value.value === this.numCardsRequiredForStraightAndFlushes - 1) {
            // The cards are already ranked in order and we know we don't have any pairs, so if the first one to the last one is an in-order run of 
            // numbers, then we have a straight (or possibly a straight flush)
            values = [...cards.map(card => card.value)];
            return new poker_hand_evaluation_1.PokerHandEvaluation(isFlush ? poker_hand_evaluation_1.PokerHandEvaluation.RANK.STRAIGHT_FLUSH : poker_hand_evaluation_1.PokerHandEvaluation.RANK.STRAIGHT, values, cards);
        }
        if (cards.length === this.numCardsRequiredForStraightAndFlushes
            && cards[0].value.value == card_value_1.CardValue.ACE
            && cards[1].value.value == this.numCardsRequiredForStraightAndFlushes
            && cards[this.numCardsRequiredForStraightAndFlushes - 1].value.value == 2) {
            // The cards are already ranked in order and we know we don't have any pairs.
            // In this case the first one is an ace, and the others must be 5 / 4 / 3 / 2, so that's a wheel straight
            // In this case we want to sort the cards so that the 5 is the highest - a 6-high straight would beat a wheel
            // Start with them in order, with the ace up front...
            values = [...cards.map(card => card.value)];
            // ...then pop it off the front and push it on the back
            values.push(values.shift());
            return new poker_hand_evaluation_1.PokerHandEvaluation(isFlush ? poker_hand_evaluation_1.PokerHandEvaluation.RANK.STRAIGHT_FLUSH : poker_hand_evaluation_1.PokerHandEvaluation.RANK.STRAIGHT, values, cards);
        }
        if (isFlush) {
            values = cards.map(card => card.value);
            values.sort((v1, v2) => v2.value - v1.value);
            return new poker_hand_evaluation_1.PokerHandEvaluation(poker_hand_evaluation_1.PokerHandEvaluation.RANK.FLUSH, values, cards);
        }
        values = cards.map(card => card.value);
        values.sort((v1, v2) => v2.value - v1.value);
        return new poker_hand_evaluation_1.PokerHandEvaluation(poker_hand_evaluation_1.PokerHandEvaluation.RANK.HIGH_CARD, values, cards);
    }
    compare(hand1, hand2) {
        return this.evaluate(hand1).compareTo(this.evaluate(hand2));
    }
}
exports.PokerHandEvaluator = PokerHandEvaluator;
