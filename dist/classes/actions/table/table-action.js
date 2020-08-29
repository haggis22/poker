"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.TableAction = void 0;
const action_1 = require("../action");
class TableAction extends action_1.Action {
    constructor(tableID) {
        super();
        this.tableID = tableID;
    }
}
exports.TableAction = TableAction;
