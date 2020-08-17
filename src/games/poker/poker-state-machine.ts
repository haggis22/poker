import { TableStateMachine } from "../../casino/tables/states/table-state-machine";
import { TableState } from "../../casino/tables/states/table-state";
import { OpenState } from "../../casino/tables/states/open-state";

export class PokerStateMachine implements TableStateMachine {

    private currentStateIndex: number;
    protected states: TableState[];


    constructor() {

        this.states = new Array<TableState>();

        // All state machines start with OpenState
        this.states.push(new OpenState());

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