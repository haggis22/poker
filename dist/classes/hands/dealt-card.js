"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.DealtCard = void 0;
class DealtCard {
    constructor(card, isFaceUp) {
        this.card = card;
        this.isFaceUp = isFaceUp;
    }
    toString() {
        return this.isFaceUp
            ? this.card.toString()
            : '??';
    }
}
exports.DealtCard = DealtCard;
