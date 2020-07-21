import { Table } from "../table";
import { ICommand } from "../../../commands/command";

export interface ITableStateMachine {

    handleCommand(table: Table, command: ICommand): void;

}