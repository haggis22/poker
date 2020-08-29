"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ActionMessage = void 0;
const message_1 = require("./message");
class ActionMessage extends message_1.Message {
    constructor(action, userID) {
        // No separate text in an action Message
        super(null, userID);
        this.action = action;
    }
}
exports.ActionMessage = ActionMessage;
