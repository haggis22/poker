"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.FoldAction = void 0;
const table_action_1 = require("../table-action");
class FoldAction extends table_action_1.TableAction {
    constructor(tableID, seatIndex, fold) {
        super(tableID);
        this.seatIndex = seatIndex;
        this.fold = fold;
    }
}
exports.FoldAction = FoldAction;
