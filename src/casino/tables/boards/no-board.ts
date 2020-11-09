import { Board } from "./board";
import { Card } from "../../../cards/card";

export class NoBoard implements Board {

    constructor() {

    }

    reset(): void {
    }

    deal(card: Card) {
        throw new Error("Method not implemented.");
    }

}