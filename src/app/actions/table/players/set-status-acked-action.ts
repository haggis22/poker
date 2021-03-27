import { TableAction } from "../table-action";

export class SetStatusAckedAction extends TableAction {

    public userID: number;


    constructor(tableID: number, userID: number) {

        super(tableID);

        this.userID = userID;

    }

}