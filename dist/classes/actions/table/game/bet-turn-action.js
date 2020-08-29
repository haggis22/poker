"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.BetTurnAction = void 0;
const table_action_1 = require("../table-action");
class BetTurnAction extends table_action_1.TableAction {
    constructor(tableID, bets) {
        super(tableID);
        this.bets = bets;
    }
}
exports.BetTurnAction = BetTurnAction;
