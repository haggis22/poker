export class UserSummary {


    public id: number;
    public username: string;
    public name: string;

    constructor(id: number, username: string, name: string) {

        this.id = id;
        this.username = username;
        this.name = name;

    }


    public toString(): string {

        return `[ User id ${this.id}, username ${this.username}, name ${this.name} ]`;

    }

}