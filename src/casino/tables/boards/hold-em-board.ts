import { Board } from "./board";
import { Card } from "../../../cards/card";

export class HoldEmBoard implements Board {


    public cards: Array<Card>;


    constructor() {

        this.cards = new Array<Card>();

    }



}