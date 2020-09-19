export class User {


    public id: number;
    public name: string;
    public chips: number;

    constructor(id: number, name: string, chips: number) {

        this.id = id;
        this.name = name;
        this.chips = chips;

    }


    public toString(): string {

        return `[ User id ${this.id}, name ${this.name}, chips: ${this.chips} ]`;

    }

}