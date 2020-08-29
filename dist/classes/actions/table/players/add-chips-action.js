"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.AddChipsAction = void 0;
const table_action_1 = require("../table-action");
class AddChipsAction extends table_action_1.TableAction {
    constructor(tableID, userID, amount) {
        super(tableID);
        this.userID = userID;
        this.amount = amount;
    }
}
exports.AddChipsAction = AddChipsAction;
