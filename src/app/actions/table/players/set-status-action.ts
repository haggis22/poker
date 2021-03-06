import { TableAction } from "../table-action";

export class SetStatusAction extends TableAction {

    public userID: number;
    public isSittingOut: boolean;


    constructor(tableID: number, userID: number, isSittingOut: boolean) {

        super(tableID);

        this.userID = userID;
        this.isSittingOut = isSittingOut;

    }

}