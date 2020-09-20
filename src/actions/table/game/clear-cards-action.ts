import { TableAction } from "../table-action";

export class ClearCardsAction extends TableAction {

    public tableID: number;

    constructor(tableID: number) {

        super(tableID);

    }


    public toString(): string {
        return JSON.stringify(this);
    }

}