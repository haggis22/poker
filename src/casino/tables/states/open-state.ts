﻿import { ITableState } from "./table-state";

export class OpenState implements ITableState {

    isHandInProgress(): boolean {
        return false;
    }


}