export class Player {

    public userID: number;
    public name: string;

    public chips: number;
    public chipsToAdd: number;

    public isSittingOut: boolean;


    constructor(userID: number, name: string) {

        this.userID = userID;
        this.name = name;

        this.chips = this.chipsToAdd = 0;

        this.isSittingOut = undefined;

    }


    public toString(): string {

        return `[ ${this.name}, chips: ${this.chips} ]`;

    }

}