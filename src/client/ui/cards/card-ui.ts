import { DealtCard } from "../../../hands/dealt-card";


export class CardUI {

    public card: DealtCard;
    public isDealt: boolean;
    public isInHand: boolean;


    constructor(card: DealtCard) {

        this.card = card;

    }

}