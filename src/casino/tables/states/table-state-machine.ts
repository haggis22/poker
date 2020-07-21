import { ITableState } from "./table-state";

export interface ITableStateMachine {

    nextState(): ITableState;

}