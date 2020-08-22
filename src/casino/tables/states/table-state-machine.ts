import { TableState } from "./table-state";
import { OpenState } from "./open-state";

export class TableStateMachine {

    private currentStateIndex: number;
    protected states: TableState[];


    constructor(states: TableState[]) {

        this.states = new Array<TableState>();

        // All state machines start with OpenState
        this.states = [new OpenState(), ...states];

        this.currentStateIndex = 0;

    }


    public nextState(): TableState {

        this.currentStateIndex++;

        if (this.currentStateIndex >= this.states.length) {

            // Go back to the beginning
            this.currentStateIndex = 0;

        }

        return this.states[this.currentStateIndex];

    }

}