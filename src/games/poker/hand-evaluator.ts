import { Hand } from "../../cards/hand";
import { HandEvaluation as PokerHandEvaluation} from "./hand-evaluation";
import { CardValue } from "../../cards/card-value";

export class HandEvaluator {


    public sort(hand: Hand): void {

        hand.cards.sort((a, b) => b.value.value - a.value.value);

    }


    public evaluate(hand: Hand): PokerHandEvaluation {

        this.sort(hand);

        let byValue: Map<number, number> = new Map<number, number>();
        let bySuit: Map<number, number> = new Map<number, number>();

        for (let card of hand.cards) {

            byValue.set(card.value.value, (byValue.get(card.value.value) || 0) + 1);
            bySuit.set(card.suit.value, (bySuit.get(card.suit.value) || 0) + 1);

        }

        let isFlush: boolean = false;

        for (let [suit, numSuit] of bySuit) {

            if (numSuit == 5) {

                isFlush = true;
                break;

            }

        }

        let numPairs = 0;
        let numThrees = 0;
        let numFours = 0;

        for (let [value, numValue] of byValue) {

            if (numValue == 2) {
                numPairs++;
            }
            else if (numValue == 3) {
                numThrees++;
            }
            else if (numValue == 4) {
                numFours++;
            }

        }


        let values = new Array<CardValue>();

        if (isFlush) {

            let kickers = new Array<number>();
            for (let [value, numValue] of byValue) {

                kickers.push(value);

            }

            kickers.sort((k1, k2) => k2 - k1);
            values = kickers.map(kickValue => CardValue.lookup(kickValue));

            return new PokerHandEvaluation(PokerHandEvaluation.RANK.FLUSH, values);

        }

        if (numFours > 0) {

            for (let [value, numValue] of byValue) {

                if (numValue == 4) {
                    // Always put the four-of-a-kind value at the start
                    values.unshift(CardValue.lookup(value));
                }
                else {
                    // put the non-four-of-a-kind at the end
                    values.push(CardValue.lookup(value));
                }

            }

            return new PokerHandEvaluation(PokerHandEvaluation.RANK.FOUR_OF_A_KIND, values);

        }

        if (numThrees > 0 && numPairs > 0) {

            for (let [value, numValue] of byValue) {

                if (numValue == 3) {
                    // Always put the three-of-a-kind value at the start
                    values.unshift(CardValue.lookup(value));
                }
                else {
                    // put the two-of-a-kind at the end
                    values.push(CardValue.lookup(value));
                }

            }

            return new PokerHandEvaluation(PokerHandEvaluation.RANK.FULL_HOUSE, values);

        }

        if (numThrees > 0) {

            let kickers = new Array<number>();

            for (let [value, numValue] of byValue) {

                if (numValue == 3) {
                    // Always put the three-of-a-kind value at the start
                    values.unshift(CardValue.lookup(value));
                }
                else {
                    // remember the kickers and we'll sort them in order
                    kickers.push(value);
                }

            }

            kickers.sort((k1, k2) => k2 - k1);

            values.push(CardValue.lookup(kickers[0]));
            values.push(CardValue.lookup(kickers[1]));

            return new PokerHandEvaluation(PokerHandEvaluation.RANK.THREE_OF_A_KIND, values);

        }

        if (numPairs > 0) {

            let pairs = new Array<number>();
            let kickers = new Array<number>();

            for (let [value, numValue] of byValue) {

                if (numValue == 2) {
                    // Remember the pair(s) and we'll sort them in order
                    pairs.push(value);
                }
                else {
                    // remember the kickers and we'll sort them in order
                    kickers.push(value);
                }

            }

            pairs.sort((p1, p2) => p2 - p1);
            kickers.sort((k1, k2) => k2 - k1);

            values = [...pairs.map(pairValue => CardValue.lookup(pairValue)), ...kickers.map(kickValue => CardValue.lookup(kickValue))];

            return new PokerHandEvaluation(numPairs == 2 ? PokerHandEvaluation.RANK.TWO_PAIR : PokerHandEvaluation.RANK.PAIR, values);

        }

        let kickers = new Array<number>();
        for (let [value, numValue] of byValue) {

            kickers.push(value);

        }

        kickers.sort((k1, k2) => k2 - k1);
        values = kickers.map(kickValue => CardValue.lookup(kickValue));

        return new PokerHandEvaluation(PokerHandEvaluation.RANK.HIGH_CARD, values);

    }


    public compare(hand1: Hand, hand2: Hand): number {

        return this.evaluate(hand1).compareTo(this.evaluate(hand2));

    }


}