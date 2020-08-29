"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.AddChipsCommand = void 0;
const table_command_1 = require("./table-command");
class AddChipsCommand extends table_command_1.TableCommand {
    constructor(tableID, userID, amount) {
        super(tableID);
        this.userID = userID;
        this.amount = amount;
    }
}
exports.AddChipsCommand = AddChipsCommand;
