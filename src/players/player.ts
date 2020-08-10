import { Hand } from "../hands/hand";
import { User } from "./user";
import { Serializable } from "../communication/serializable";

export class Player implements Serializable {

    public isSerializable: boolean = true;

    public userID: number;
    public name: string;

    public chips: number;
    public chipsToAdd: number;

    public isActive: boolean;


    constructor() {

        // this.userID = user.id;
        // this.name = user.name;

        this.chips = this.chipsToAdd = 0;

        this.isActive = true;

    }

}