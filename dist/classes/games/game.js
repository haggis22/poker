"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Game = void 0;
const table_state_machine_1 = require("../casino/tables/states/table-state-machine");
class Game {
    constructor(id, selector, evaluator, describer) {
        this.id = id;
        this.stateMachine = new table_state_machine_1.TableStateMachine(this.getStates());
        this.handSelector = selector;
        this.handEvaluator = evaluator;
        this.handDescriber = describer;
    }
}
exports.Game = Game;
