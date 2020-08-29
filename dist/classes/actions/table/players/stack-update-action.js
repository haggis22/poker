"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.StackUpdateAction = void 0;
const table_action_1 = require("../table-action");
class StackUpdateAction extends table_action_1.TableAction {
    constructor(tableID, playerID, chips) {
        super(tableID);
        this.playerID = playerID;
        this.chips = chips;
    }
}
exports.StackUpdateAction = StackUpdateAction;
