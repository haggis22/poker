"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.TableStateMachine = void 0;
const open_state_1 = require("./open-state");
class TableStateMachine {
    constructor(states) {
        this.states = new Array();
        // All state machines start with OpenState
        this.states = [new open_state_1.OpenState(), ...states];
        this.currentStateIndex = 0;
    }
    goToOpenState() {
        this.currentStateIndex = 0;
        // ALL state machines start with OpenState()
        return this.states[this.currentStateIndex];
    }
    nextState() {
        this.currentStateIndex++;
        if (this.currentStateIndex >= this.states.length) {
            // Go back to the beginning
            this.currentStateIndex = 0;
        }
        return this.states[this.currentStateIndex];
    }
}
exports.TableStateMachine = TableStateMachine;
