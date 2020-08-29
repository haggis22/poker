"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Card = void 0;
class Card {
    constructor(value, suit) {
        this.value = value;
        this.suit = suit;
        this.sortValue = 0;
    }
    toString() {
        return `${this.value.symbol}${this.suit.symbol}`;
    }
}
exports.Card = Card;
