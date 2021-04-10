export class Blind {

    public static readonly TYPE_SMALL: number = 1;
    public static readonly TYPE_BIG: number = 2;

    public index: number;
    public type: number;
    public name: string;
    public amount: number;
    public isLiveBet: boolean;
    public isBasicBlind: boolean;

    constructor(index: number, type: number, name: string, amount: number, isLiveBet: boolean, isBasicBlind: boolean) {

        this.index = index;
        this.type = type;
        this.name = name;
        this.amount = amount;
        this.isLiveBet = isLiveBet;
        this.isBasicBlind = isBasicBlind;

    }

    public toString(): string {

        return `[ Blind, index: ${this.index}, type: ${this.type}, name: ${this.name}, amount: ${this.amount}, isLiveBet: ${this.isLiveBet} , isBasicBlind ${this.isBasicBlind} ]`;
    }


}