import { TableAction } from "../table-action";

export class PlayerActiveAction extends TableAction {

    public userID: number;
    public seatIndex: number;
    public isActive: boolean;


    constructor(tableID: number, userID: number, seatIndex: number, isActive: boolean) {

        super(tableID);

        this.userID = userID;
        this.seatIndex = seatIndex;
        this.isActive = isActive;

    }

}