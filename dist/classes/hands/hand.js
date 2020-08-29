"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Hand = void 0;
class Hand {
    constructor() {
        this.cards = new Array();
    }
    reset() {
        this.cards.length = 0;
    }
    deal(card) {
        this.cards.push(card);
    }
    flipCards() {
        for (let card of this.cards) {
            card.isFaceUp = true;
        }
    }
}
exports.Hand = Hand;
