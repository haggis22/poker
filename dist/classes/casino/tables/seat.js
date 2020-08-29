"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Seat = void 0;
class Seat {
    constructor(index) {
        this.index = index;
        this.player = null;
        this.hand = null;
    }
    getName() {
        return this.player ? this.player.name : this.getSeatName();
    }
    getSeatName() {
        return `Seat ${(this.index + 1)}`;
    }
}
exports.Seat = Seat;
