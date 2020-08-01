import { TableState } from "./table-state";

export interface TableStateMachine {

    nextState(): TableState;

}