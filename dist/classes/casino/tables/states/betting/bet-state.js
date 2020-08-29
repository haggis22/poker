"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.BetState = void 0;
class BetState {
    constructor(firstToBet) {
        this.firstToBet = firstToBet;
    }
    isHandInProgress() {
        return true;
    }
    requiresMultiplePlayers() {
        return true;
    }
}
exports.BetState = BetState;
BetState.FIRST_POSITION = 1;
BetState.BEST_HAND = 2;
BetState.AFTER_BIG_BLIND = 3;
