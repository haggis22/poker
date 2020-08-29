"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.AnteAction = void 0;
const table_action_1 = require("../table-action");
class AnteAction extends table_action_1.TableAction {
    constructor(tableID, seatIndex, ante) {
        super(tableID);
        this.seatIndex = seatIndex;
        this.ante = ante;
    }
}
exports.AnteAction = AnteAction;
