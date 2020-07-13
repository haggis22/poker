import { Hand } from "../cards/hand";

export class Player {


    public name: string;

    public hand: Hand;


    constructor(name: string) {
        this.name = name;

        this.hand = new Hand();
        this.hand.reset();

    }

    public reset(): void {

        this.hand.reset();

    }


}