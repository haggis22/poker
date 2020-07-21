import { ITableStateMachine } from "../../casino/tables/states/table-state-machine";
import { Table } from "../../casino/tables/table";
import { ICommand } from "../../commands/command";
import { ITableState } from "../../casino/tables/states/table-state";

export class PokerStateMachine implements ITableStateMachine {

    protected states: ITableState[];


    constructor() {

        this.states = new Array<ITableState>();

    }


    handleCommand(table: Table, command: ICommand): void {
        throw new Error("Method not implemented.");
    }


}