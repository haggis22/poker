"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.UpdateBetsAction = void 0;
const table_action_1 = require("../table-action");
class UpdateBetsAction extends table_action_1.TableAction {
    constructor(tableID, betTracker) {
        super(tableID);
        this.betTracker = betTracker;
    }
}
exports.UpdateBetsAction = UpdateBetsAction;
