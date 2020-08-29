"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.DealCardAction = void 0;
const table_action_1 = require("../table-action");
class DealCardAction extends table_action_1.TableAction {
    constructor(tableID, seatIndex, card) {
        super(tableID);
        this.seatIndex = seatIndex;
        this.card = card;
    }
    toString() {
        return JSON.stringify(this);
    }
}
exports.DealCardAction = DealCardAction;
