"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.RequestSeatCommand = void 0;
const table_command_1 = require("./table-command");
class RequestSeatCommand extends table_command_1.TableCommand {
    constructor(tableID, user, seatIndex) {
        super(tableID);
        this.user = user;
        this.seatIndex = seatIndex;
    }
}
exports.RequestSeatCommand = RequestSeatCommand;
