import { TableState } from "./table-state";
import { BetweenHandsState } from "./between-hands-state";
import { OpenState } from "./open-state";

export class TableStateMachine {

    private currentStateIndex: number;
    protected states: TableState[];


    constructor(states: TableState[]) {

        this.states = new Array<TableState>();

        // All state machines start with BetweenHandsState
        this.states = [new BetweenHandsState(), ...states];

        this.currentStateIndex = null;

    }

    public goToOpenState(): TableState {

        this.currentStateIndex = null;

        return new OpenState();

    }


    public nextState(): TableState {

        this.currentStateIndex = this.currentStateIndex == null ? 0 : this.currentStateIndex + 1;

        if (this.currentStateIndex >= this.states.length) {

            // Go back to the beginning
            this.currentStateIndex = 0;

        }

        return this.states[this.currentStateIndex];

    }

}