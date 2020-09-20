import { Card } from "../../../cards/card";
import { FacedownCard } from "../../../cards/face-down-card";

export class CardUI {

    public card: Card | FacedownCard;
    public isDealerHolding: boolean;
    public isDealing: boolean;


    constructor(card: Card | FacedownCard, isDealerHolding: boolean, isDealing: boolean) {

        this.card = card;
        this.isDealerHolding = isDealerHolding;
        this.isDealing = isDealing;

    }

}