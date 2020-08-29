"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.StartHandState = void 0;
class StartHandState {
    isHandInProgress() {
        return true;
    }
    // Perhaps - counter-intuitive, but this sets up the hand, so no-one has a hand yet
    requiresMultiplePlayers() {
        return false;
    }
}
exports.StartHandState = StartHandState;
