﻿import { TableStateMachine } from "../../casino/tables/states/table-state-machine";
import { Table } from "../../casino/tables/table";
import { Command } from "../../commands/command";
import { TableState } from "../../casino/tables/states/table-state";

export class PokerStateMachine implements TableStateMachine {

    private currentStateIndex: number;
    protected states: TableState[];


    constructor() {

        this.states = new Array<TableState>();
        this.currentStateIndex = null;

    }

    nextState(): TableState {

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