import { TableAction } from "../../table-action";

export class ClearBoardAction extends TableAction {

    public tableID: number;

    constructor(tableID: number) {

        super(tableID);

    }

}