"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Table = void 0;
const open_state_1 = require("./states/open-state");
const seat_1 = require("./seat");
const bet_tracker_1 = require("./betting/bet-tracker");
class Table {
    constructor(id, stakes, rules) {
        this.id = id;
        this.stakes = stakes;
        this.rules = rules;
        this.seats = new Array();
        for (let s = 0; s < rules.numSeats; s++) {
            this.seats.push(new seat_1.Seat(s));
        }
        // Button is not yet assigned
        this.buttonIndex = null;
        this.betTracker = new bet_tracker_1.BetTracker();
        this.state = new open_state_1.OpenState();
    }
}
exports.Table = Table;
