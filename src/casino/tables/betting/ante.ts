export class Ante {

    public amount: number;

    constructor(amount: number) {
        this.amount = amount;
    }

    public toString(): string {

        return `[ Ante, amount: ${this.amount} ]`;
    }

}