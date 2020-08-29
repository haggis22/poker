"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.PlayerSeatedAction = void 0;
const table_action_1 = require("../table-action");
class PlayerSeatedAction extends table_action_1.TableAction {
    constructor(tableID, player, seatIndex) {
        super(tableID);
        this.player = player;
        this.seatIndex = seatIndex;
    }
}
exports.PlayerSeatedAction = PlayerSeatedAction;
