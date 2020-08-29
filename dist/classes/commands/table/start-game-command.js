"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.StartGameCommand = void 0;
const table_command_1 = require("./table-command");
class StartGameCommand extends table_command_1.TableCommand {
    constructor(tableID) {
        super(tableID);
    }
}
exports.StartGameCommand = StartGameCommand;
