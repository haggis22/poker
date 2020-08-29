"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.BetAction = void 0;
const table_action_1 = require("../table-action");
class BetAction extends table_action_1.TableAction {
    constructor(tableID, seatIndex, bet) {
        super(tableID);
        this.seatIndex = seatIndex;
        this.bet = bet;
    }
}
exports.BetAction = BetAction;
