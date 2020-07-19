import { Action } from "../action";

export class BetAction implements Action {


    public static FIRST_POSITION: number = 1;
    public static BEST_HAND: number = 2;
    public static AFTER_BIG_BLIND: number = 3;


    public firstToBet: number;

    constructor(firstToBet: number) {
        this.firstToBet = firstToBet;
    }

}