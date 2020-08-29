"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Bet = void 0;
class Bet {
    constructor(isValid, totalBet, chipsAdded, isAllIn, betType, message) {
        this.isValid = isValid;
        this.totalBet = totalBet;
        this.chipsAdded = chipsAdded;
        this.isAllIn = isAllIn;
        this.betType = betType;
        this.message = message;
    }
    toString() {
        return JSON.stringify(this);
    }
}
exports.Bet = Bet;
Bet.INVALID = -1;
Bet.CHECK = 0;
Bet.OPEN = 1;
Bet.CALL = 2;
Bet.RAISE = 3;
Bet.DEAD_RAISE = 4;
