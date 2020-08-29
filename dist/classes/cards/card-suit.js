"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.CardSuit = void 0;
class CardSuit {
    constructor(value, symbol, text) {
        this.value = value;
        this.symbol = symbol;
        this.text = text;
    }
    static lookup(value) {
        return CardSuit.VALUES.find(val => val.value == value);
    }
}
exports.CardSuit = CardSuit;
CardSuit.VALUES = [
    new CardSuit(1, '\u2663', 'club'),
    new CardSuit(2, '\u2666', 'diamond'),
    new CardSuit(3, '\u2665', 'heart'),
    new CardSuit(4, '\u2660', 'spade')
];
