export class Blind {

    public static readonly SMALL: number = 1;
    public static readonly BIG: number = 2;

    public id: number;
    public name: string;
    public amount: number;
    public isOwed: boolean;

    constructor(id: number, name: string, amount: number, isOwed?: boolean) {
        this.id = id;
        this.name = name;
        this.amount = amount;
        this.isOwed = isOwed || false;
    }

}