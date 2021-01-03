export class Blind {

    public static readonly TYPE_SMALL: number = 1;
    public static readonly TYPE_BIG: number = 2;

    public type: number;
    public name: string;
    public amount: number;
    public isOwed: boolean;

    constructor(type: number, name: string, amount: number, isOwed?: boolean) {

        this.type = type;
        this.name = name;
        this.amount = amount;
        this.isOwed = isOwed || false;

    }

}