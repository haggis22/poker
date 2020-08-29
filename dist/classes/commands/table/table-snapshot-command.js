"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.TableSnapshotCommand = void 0;
const table_command_1 = require("./table-command");
class TableSnapshotCommand extends table_command_1.TableCommand {
    constructor(tableID, userID) {
        super(tableID);
        this.userID = userID;
    }
}
exports.TableSnapshotCommand = TableSnapshotCommand;
