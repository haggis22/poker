import { IAction } from "./action";
import { DealtCard } from "../hands/dealt-card";

export class DealCardAction implements IAction {

    public playerID: number;
    public card: DealtCard;

    constructor(playerID: number, card: DealtCard) {

        this.playerID = playerID;
        this.card = card;

    }


}