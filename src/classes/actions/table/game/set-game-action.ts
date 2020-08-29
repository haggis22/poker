import { TableAction } from "../table-action";

export class SetGameAction extends TableAction {

    public tableID: number;
    public gameID: string;

    constructor(tableID: number, gameID: string) {

        super(tableID);

        this.gameID = gameID;

    }


}