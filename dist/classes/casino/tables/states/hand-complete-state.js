"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.HandCompleteState = void 0;
class HandCompleteState {
    isHandInProgress() {
        return true;
    }
    requiresMultiplePlayers() {
        return false;
    }
}
exports.HandCompleteState = HandCompleteState;
