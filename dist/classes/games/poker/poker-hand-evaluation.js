"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.PokerHandEvaluation = void 0;
class PokerHandEvaluation {
    constructor(rank, values, cards) {
        this.rank = rank;
        this.values = values;
        this.cards = [...cards];
    }
    compareTo(h2) {
        if (!(h2 instanceof PokerHandEvaluation)) {
            throw new Error(`Cannot compare poker hand with ${(typeof h2)}`);
        }
        // let poker2: PokerHandEvaluation = h2 as PokerHandEvaluation;
        if (this.rank > h2.rank) {
            return 1;
        }
        else if (this.rank < h2.rank) {
            return -1;
        }
        for (let v = 0; v < this.values.length; v++) {
            if (this.values[v].value > h2.values[v].value) {
                return 1;
            }
            else if (this.values[v].value < h2.values[v].value) {
                return -1;
            }
        }
        return 0;
    }
}
exports.PokerHandEvaluation = PokerHandEvaluation;
PokerHandEvaluation.RANK = {
    HIGH_CARD: 0,
    PAIR: 1,
    TWO_PAIR: 2,
    THREE_OF_A_KIND: 3,
    STRAIGHT: 4,
    FLUSH: 5,
    FULL_HOUSE: 6,
    FOUR_OF_A_KIND: 7,
    STRAIGHT_FLUSH: 8
};
