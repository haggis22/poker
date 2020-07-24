import { Action } from "../action";

export class MoveButtonAction implements Action {

    public seatID: number;

    constructor(seatID: number) {
        this.seatID = seatID;
    }

}