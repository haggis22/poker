"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.MoveButtonAction = void 0;
const table_action_1 = require("../table-action");
class MoveButtonAction extends table_action_1.TableAction {
    constructor(tableID, seatIndex) {
        super(tableID);
        this.seatIndex = seatIndex;
    }
}
exports.MoveButtonAction = MoveButtonAction;
