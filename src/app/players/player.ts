export class Player {

    public userID: number;
    public name: string;

    public chips: number;

    public isSittingOut: boolean;


    constructor(userID: number, name: string) {

        this.userID = userID;
        this.name = name;

        this.chips = 0;

        this.isSittingOut = null;

    }


    public toString(): string {

        return `[ ${this.name}, chips: ${this.chips} ]`;

    }

}