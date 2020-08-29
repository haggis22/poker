"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ShowdownState = void 0;
class ShowdownState {
    isHandInProgress() {
        return true;
    }
    requiresMultiplePlayers() {
        return false;
    }
}
exports.ShowdownState = ShowdownState;
