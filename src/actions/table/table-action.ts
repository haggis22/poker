import { Action } from "../action";

export class TableAction extends Action {

    public tableID: number;

    constructor(tableID: number) {

        super();

        this.tableID = tableID;

    }

    serialize(): string {

        return JSON.stringify(['TableAction', { tableID: this.tableID }]);

    }

    deserialize(txt: string) {
        throw new Error("Method not implemented.");
    }


}