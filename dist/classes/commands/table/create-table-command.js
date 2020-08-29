"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.CreateTableCommand = void 0;
const command_1 = require("../command");
class CreateTableCommand extends command_1.Command {
    constructor(rules, game, stakes) {
        super();
        this.rules = rules;
        this.game = game;
        this.stakes = stakes;
    }
}
exports.CreateTableCommand = CreateTableCommand;
