import { Hand } from "../hands/hand";

export class Player {


    public id: number;
    public name: string;
    public chips: number;

    public chipsToAdd: number;

    public hand: Hand;


    constructor(id: number, name: string) {

        this.id = id;
        this.name = name;

        this.hand = new Hand();
        this.hand.reset();

        this.chips = this.chipsToAdd = 0;

    }

    public reset(): void {

        this.hand.reset();

    }

    public hasHand(): boolean {

        return this.hand != null;

    }

}