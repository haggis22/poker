"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Deck = void 0;
const card_1 = require("./card");
const card_value_1 = require("./card-value");
const card_suit_1 = require("./card-suit");
class Deck {
    constructor() {
        this.shuffle();
    }
    reset() {
        this.cards = new Array();
        for (let value of card_value_1.CardValue.VALUES) {
            for (let suit of card_suit_1.CardSuit.VALUES) {
                this.cards.push(new card_1.Card(value, suit));
            }
        }
    }
    shuffle() {
        this.reset();
        for (let card of this.cards) {
            card.sortValue = Math.random();
        }
        this.cards.sort((a, b) => a.sortValue - b.sortValue);
    }
    display() {
        return this.cards.map(card => card.toString()).join(" ");
    }
    deal() {
        return this.cards.pop();
    }
}
exports.Deck = Deck;
