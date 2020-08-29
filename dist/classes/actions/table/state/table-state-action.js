"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.TableStateAction = void 0;
const table_action_1 = require("../table-action");
class TableStateAction extends table_action_1.TableAction {
    constructor(tableID, state) {
        super(tableID);
        this.state = state;
    }
}
exports.TableStateAction = TableStateAction;
