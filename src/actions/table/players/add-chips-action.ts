import { TableAction } from "../table-action";

export class AddChipsAction extends TableAction {

    public userID: number;
    public amount: number;


    constructor(tableID: number, userID: number, amount: number) {

        super(tableID);

        this.userID = userID;
        this.amount = amount;
    }

}