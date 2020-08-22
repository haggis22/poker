import { Hand } from "../../hands/hand";
import { PokerHandEvaluation} from "./poker-hand-evaluation";
import { CardValue } from "../../cards/card-value";
import { Card } from "../../cards/card";
import { HandEvaluation } from "../hand-evaluation";
import { HandEvaluator } from "../hand-evaluator";

export class PokerHandEvaluator implements HandEvaluator {


    private readonly DEFAULT_NUM_CARDS_REQUIRED_FOR_STRAIGHTS_AND_FLUSHES: number = 5;

    private numCardsRequiredForStraightAndFlushes: number;

    constructor(numCardsRequiredForStraightAndFlushes?: number) {
        this.numCardsRequiredForStraightAndFlushes = typeof numCardsRequiredForStraightAndFlushes === 'undefined'
                                                        ? this.DEFAULT_NUM_CARDS_REQUIRED_FOR_STRAIGHTS_AND_FLUSHES
                                                        : numCardsRequiredForStraightAndFlushes;
    }


    private sort(cards: Array<Card>): void {

        cards.sort((a, b) => b.value.value - a.value.value);

    }


    public evaluate(cards: Card[]): HandEvaluation {

        this.sort(cards);

        let byValue: object = {};
        let bySuit: object = {};

        let isFlush: boolean = false;

        for (let card of cards) {

            byValue[card.value.value] = (byValue[card.value.value] || 0) + 1;
            bySuit[card.suit.value] = (bySuit[card.suit.value] || 0) + 1;

            if (bySuit[card.suit.value] === this.numCardsRequiredForStraightAndFlushes) {
                isFlush = true;
            }

        }

        let numPairs = 0;
        let numThrees = 0;
        let numFours = 0;

        for (let cardValue of Object.keys(byValue)) {

            if (byValue[cardValue] === 2) {
                numPairs++;
            }
            else if (byValue[cardValue] === 3) {
                numThrees++;
            }
            else if (byValue[cardValue] === 4) {
                numFours++;
            }

        }


        // This will hold the values of the cards, in order of importance.
        // If the user has a pair, for example, then the first position will hold the face value of the pair. After that, in descending order, will be the kickers
        let values = new Array<CardValue>();

        if (numFours > 0) {

            for (let cardValue of Object.keys(byValue)) {

                if (typeof cardValue === 'number') {

                    if (byValue[cardValue] === 4) {
                        // Always put the four-of-a-kind value at the start
                        values.unshift(CardValue.lookup(cardValue));
                    }
                    else {
                        // put the non-four-of-a-kind at the end
                        values.push(CardValue.lookup(cardValue));
                    }

                }

            }

            return new PokerHandEvaluation(PokerHandEvaluation.RANK.FOUR_OF_A_KIND, values, cards);

        }

        if (numThrees > 0 && numPairs > 0) {

            for (let cardValue of Object.keys(byValue)) {

                if (typeof cardValue === 'number') {

                    if (byValue[cardValue] === 3) {
                        // Always put the three-of-a-kind value at the start
                        values.unshift(CardValue.lookup(cardValue));
                    }
                    else {
                        // put the two-of-a-kind at the end
                        values.push(CardValue.lookup(cardValue));
                    }

                }

            }

            return new PokerHandEvaluation(PokerHandEvaluation.RANK.FULL_HOUSE, values, cards);

        }

        if (numThrees > 0) {

            let kickers = new Array<number>();

            for (let cardValue of Object.keys(byValue)) {

                if (typeof cardValue === 'number') {

                    if (byValue[cardValue] === 3) {
                        // Always put the three-of-a-kind value at the start
                        values.unshift(CardValue.lookup(cardValue));
                    }
                    else {
                        // remember the kickers and we'll sort them in order
                        kickers.push(cardValue);
                    }

                }

            }

            kickers.sort((k1, k2) => k2 - k1);

            values.push(CardValue.lookup(kickers[0]));
            values.push(CardValue.lookup(kickers[1]));

            return new PokerHandEvaluation(PokerHandEvaluation.RANK.THREE_OF_A_KIND, values, cards);

        }

        if (numPairs > 0) {

            let pairs = new Array<number>();
            let kickers = new Array<number>();

            for (let cardValue of Object.keys(byValue)) {

                if (typeof cardValue === 'number') {

                    if (byValue[cardValue] === 2) {
                        // Remember the pair(s) and we'll sort them in order
                        pairs.push(cardValue);
                    }
                    else {
                        // remember the kickers and we'll sort them in order
                        kickers.push(cardValue);
                    }

                }

            }

            pairs.sort((p1, p2) => p2 - p1);
            kickers.sort((k1, k2) => k2 - k1);

            values = [...pairs.map(pairValue => CardValue.lookup(pairValue)), ...kickers.map(kickValue => CardValue.lookup(kickValue))];

            return new PokerHandEvaluation(numPairs == 2 ? PokerHandEvaluation.RANK.TWO_PAIR : PokerHandEvaluation.RANK.PAIR, values, cards);

        }

        if (cards.length === this.numCardsRequiredForStraightAndFlushes && cards[0].value.value - cards[this.numCardsRequiredForStraightAndFlushes - 1].value.value === this.numCardsRequiredForStraightAndFlushes - 1) {

            // The cards are already ranked in order and we know we don't have any pairs, so if the first one to the last one is an in-order run of 
            // numbers, then we have a straight (or possibly a straight flush)
            values = [...cards.map(card => card.value)];

            return new PokerHandEvaluation(isFlush ? PokerHandEvaluation.RANK.STRAIGHT_FLUSH : PokerHandEvaluation.RANK.STRAIGHT, values, cards);

        }

        if (cards.length === this.numCardsRequiredForStraightAndFlushes
            && cards[0].value.value == CardValue.ACE
            && cards[1].value.value == this.numCardsRequiredForStraightAndFlushes
            && cards[this.numCardsRequiredForStraightAndFlushes-1].value.value == 2) {

            // The cards are already ranked in order and we know we don't have any pairs.
            // In this case the first one is an ace, and the others must be 5 / 4 / 3 / 2, so that's a wheel straight

            // In this case we want to sort the cards so that the 5 is the highest - a 6-high straight would beat a wheel
            // Start with them in order, with the ace up front...
            values = [...cards.map(card => card.value)];
            // ...then pop it off the front and push it on the back
            values.push(values.shift());

            return new PokerHandEvaluation(isFlush ? PokerHandEvaluation.RANK.STRAIGHT_FLUSH : PokerHandEvaluation.RANK.STRAIGHT, values, cards);

        }

        if (isFlush) {

            let kickers = new Array<number>();
            for (let value of Object.keys(byValue)) {

                if (typeof value === 'number') {
                    kickers.push(value);
                } 

            }

            kickers.sort((k1, k2) => k2 - k1);
            values = kickers.map(kickValue => CardValue.lookup(kickValue));

            return new PokerHandEvaluation(PokerHandEvaluation.RANK.FLUSH, values, cards);

        }


        let kickers = new Array<number>();
        for (let value of Object.keys(byValue)) {

            if (typeof value === 'number') {

                kickers.push(value);

            }

        }

        kickers.sort((k1, k2) => k2 - k1);
        values = kickers.map(kickValue => CardValue.lookup(kickValue));

        return new PokerHandEvaluation(PokerHandEvaluation.RANK.HIGH_CARD, values, cards);

    }


    public compare(hand1: Card[], hand2: Card[]): number {

        return this.evaluate(hand1).compareTo(this.evaluate(hand2));

    }


}