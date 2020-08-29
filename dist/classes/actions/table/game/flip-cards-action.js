"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.FlipCardsAction = void 0;
const table_action_1 = require("../table-action");
class FlipCardsAction extends table_action_1.TableAction {
    constructor(tableID, seatIndex, hand) {
        super(tableID);
        this.seatIndex = seatIndex;
        this.hand = hand;
    }
}
exports.FlipCardsAction = FlipCardsAction;
