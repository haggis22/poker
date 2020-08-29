"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.BetReturnedAction = void 0;
const table_action_1 = require("../table-action");
class BetReturnedAction extends table_action_1.TableAction {
    constructor(tableID, seatIndex, amount) {
        super(tableID);
        this.seatIndex = seatIndex;
        this.amount = amount;
    }
}
exports.BetReturnedAction = BetReturnedAction;
