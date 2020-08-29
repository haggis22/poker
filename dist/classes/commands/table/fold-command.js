"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.FoldCommand = void 0;
const table_command_1 = require("./table-command");
class FoldCommand extends table_command_1.TableCommand {
    constructor(tableID, userID) {
        super(tableID);
        this.userID = userID;
    }
}
exports.FoldCommand = FoldCommand;
