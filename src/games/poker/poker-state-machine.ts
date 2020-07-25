import { ITableStateMachine } from "../../casino/tables/states/table-state-machine";
import { Table } from "../../casino/tables/table";
import { ICommand } from "../../commands/command";
import { ITableState } from "../../casino/tables/states/table-state";

export class PokerStateMachine implements ITableStateMachine {

    private currentStateIndex: number;
    protected states: ITableState[];


    constructor() {

        this.states = new Array<ITableState>();
        this.currentStateIndex = null;

    }

    nextState(): ITableState {

        if (this.currentStateIndex === null) {

            this.currentStateIndex = 0;

        }
        else {
            this.currentStateIndex++;
        }

        if (this.currentStateIndex >= this.states.length) {
            this.currentStateIndex = null;

            // we are done with the hand - no more state
            return null;
        }

        return this.states[this.currentStateIndex];

    }



}