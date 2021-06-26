import { IChipFormatter } from "./chip-formatter";

export class TourneyFormatter implements IChipFormatter
{

    public static readonly ID: string = 'tournament';

    private formatter: Intl.NumberFormat;


    constructor() {

        this.formatter = new Intl.NumberFormat();

    }

    public format(chips: number): string {

        return this.formatter.format(chips);

    }

}