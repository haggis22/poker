"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.SetGameAction = void 0;
const table_action_1 = require("../table-action");
class SetGameAction extends table_action_1.TableAction {
    constructor(tableID, gameID) {
        super(tableID);
        this.gameID = gameID;
    }
}
exports.SetGameAction = SetGameAction;
