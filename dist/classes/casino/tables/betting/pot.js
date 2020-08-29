"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Pot = void 0;
class Pot {
    constructor(index) {
        this.index = index;
        this.amount = 0;
        this.seats = {};
    }
    addChips(chips, seatIndex) {
        if (chips > 0) {
            this.amount += chips;
            this.seats[seatIndex] = true;
        }
    }
    foldPlayer(seatIndex) {
        delete this.seats[seatIndex];
    }
    getNumPlayers() {
        return Object.keys(this.seats).length;
    }
    isInPot(seatIndex) {
        return this.seats[seatIndex] || false;
    }
    getSeatsInPot() {
        return Object.keys(this.seats);
    }
    getName() {
        return (this.index === 0) ? 'the main pot' : `side pot #${this.index}`;
    }
}
exports.Pot = Pot;
