"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Best5InHandSelector = void 0;
class Best5InHandSelector {
    select(evaluator, playerHand, board) {
        let cards = playerHand.cards.reduce((cardArray, dealtCard) => { if (dealtCard.isFaceUp) {
            cardArray.push(dealtCard.card);
        } return cardArray; }, []);
        if (cards.length > 5) {
            cards = cards.slice(0, 5);
        }
        return evaluator.evaluate(cards);
    }
}
exports.Best5InHandSelector = Best5InHandSelector;
