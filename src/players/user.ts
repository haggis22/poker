export class User {


    public id: number;
    public username: string;
    public name: string;
    public balance: number;

    constructor(id: number, username: string, name: string, balance: number) {

        this.id = id;
        this.username = username;
        this.name = name;
        this.balance = balance;

    }


    public toString(): string {

        return `[ User id ${this.id}, username ${this.username}, name ${this.name}, balance: ${this.balance} ]`;

    }

}