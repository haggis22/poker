"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.WinPotAction = void 0;
const table_action_1 = require("../table-action");
class WinPotAction extends table_action_1.TableAction {
    constructor(tableID, seatIndex, potIndex, handEvaluation, amount) {
        super(tableID);
        this.seatIndex = seatIndex;
        this.potIndex = potIndex;
        this.handEvaluation = handEvaluation;
        this.amount = amount;
    }
}
exports.WinPotAction = WinPotAction;
