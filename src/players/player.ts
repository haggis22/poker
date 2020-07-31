import { Hand } from "../hands/hand";

export class Player {


    public id: number;
    public name: string;

    public chips: number;
    public chipsToAdd: number;

    public isActive: boolean;


    constructor(id: number, name: string) {

        this.id = id;
        this.name = name;

        this.chips = this.chipsToAdd = 0;

        this.isActive = true;

    }

}