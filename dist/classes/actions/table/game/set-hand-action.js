"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.SetHandAction = void 0;
const table_action_1 = require("../table-action");
class SetHandAction extends table_action_1.TableAction {
    constructor(tableID, seatIndex, hasHand) {
        super(tableID);
        this.seatIndex = seatIndex;
        this.hasHand = hasHand;
    }
}
exports.SetHandAction = SetHandAction;
