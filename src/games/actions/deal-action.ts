import { Action } from "./action";

export class DealAction implements Action {

    public isFaceUp: boolean;

    constructor(isFaceUp: boolean) {

        this.isFaceUp = isFaceUp;

    }


}