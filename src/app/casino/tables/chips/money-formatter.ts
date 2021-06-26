import { IChipFormatter } from "./chip-formatter";

export class MoneyFormatter implements IChipFormatter
{

    public static readonly ID: string = 'money';

    private formatter: Intl.NumberFormat;


    constructor() {

        let options =
        {
            style: 'currency',
            currency: 'USD'
        };

        this.formatter = new Intl.NumberFormat(undefined, options);

    }

    public format(chips: number): string {

        return this.formatter.format(chips / 100);

    }

}