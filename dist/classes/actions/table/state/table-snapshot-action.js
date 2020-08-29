"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.TableSnapshotAction = void 0;
const table_action_1 = require("../table-action");
class TableSnapshotAction extends table_action_1.TableAction {
    constructor(tableID, table) {
        super(tableID);
        this.table = table;
    }
}
exports.TableSnapshotAction = TableSnapshotAction;
