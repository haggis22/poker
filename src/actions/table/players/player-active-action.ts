import { TableAction } from "../table-action";

export class PlayerActiveAction extends TableAction {

    public userID: number;
    public isActive: boolean;


    constructor(tableID: number, userID: number, isActive: boolean) {

        super(tableID);

        this.userID = userID;
        this.isActive = isActive;

    }

}