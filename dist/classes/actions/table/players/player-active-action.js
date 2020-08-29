"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.PlayerActiveAction = void 0;
const table_action_1 = require("../table-action");
class PlayerActiveAction extends table_action_1.TableAction {
    constructor(tableID, userID, seatIndex, isActive) {
        super(tableID);
        this.userID = userID;
        this.seatIndex = seatIndex;
        this.isActive = isActive;
    }
}
exports.PlayerActiveAction = PlayerActiveAction;
