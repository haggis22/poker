"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Player = void 0;
class Player {
    constructor(userID, name) {
        this.userID = userID;
        this.name = name;
        this.chips = this.chipsToAdd = 0;
        this.isActive = true;
    }
}
exports.Player = Player;
