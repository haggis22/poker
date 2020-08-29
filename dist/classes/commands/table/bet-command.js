"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.BetCommand = void 0;
const table_command_1 = require("./table-command");
class BetCommand extends table_command_1.TableCommand {
    constructor(tableID, userID, amount) {
        super(tableID);
        this.userID = userID;
        this.amount = amount;
    }
    toString() {
        return `[ BetCommand, userID: ${this.userID}, amount: ${this.amount} ]`;
    }
}
exports.BetCommand = BetCommand;
