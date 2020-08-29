"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.DealState = void 0;
class DealState {
    constructor(isFaceUp) {
        this.isFaceUp = isFaceUp;
    }
    isHandInProgress() {
        return true;
    }
    requiresMultiplePlayers() {
        return true;
    }
}
exports.DealState = DealState;
