export class User {


    public id: number;
    public username: string;
    public name: string;
    public chips: number;

    constructor(id: number, username: string, name: string, chips: number) {

        this.id = id;
        this.username = username;
        this.name = name;
        this.chips = chips;

    }


    public toString(): string {

        return `[ User id ${this.id}, username ${this.username}, name ${this.name}, chips: ${this.chips} ]`;

    }

}