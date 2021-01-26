import { Action } from "../action";

export class CashierAction extends Action {


    public userID: number;


    constructor(userID: number) {

        super();

        this.userID = userID;

    }

}