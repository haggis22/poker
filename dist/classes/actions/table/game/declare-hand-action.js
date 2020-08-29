"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.DeclareHandAction = void 0;
const table_action_1 = require("../table-action");
class DeclareHandAction extends table_action_1.TableAction {
    constructor(tableID, seatIndex, handEvaluation) {
        super(tableID);
        this.seatIndex = seatIndex;
        this.handEvaluation = handEvaluation;
    }
}
exports.DeclareHandAction = DeclareHandAction;
