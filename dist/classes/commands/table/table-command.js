"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.TableCommand = void 0;
const command_1 = require("../command");
class TableCommand extends command_1.Command {
    constructor(tableID) {
        super();
        this.tableID = tableID;
    }
}
exports.TableCommand = TableCommand;
