import { IChipFormatter } from "./chip-formatter";

export class TourneyFormatter implements IChipFormatter
{

    private formatter: Intl.NumberFormat;


    constructor() {

        this.formatter = new Intl.NumberFormat();

    }

    public format(chips: number): string {

        return this.formatter.format(chips);

    }

}