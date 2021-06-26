import { IChipFormatter } from './chip-formatter';
import { MoneyFormatter } from './money-formatter';
import { TourneyFormatter } from './tourney-formatter';

export class ChipFormatterFactory {


    constructor() {

    }


    public create(formatterID: string): IChipFormatter {

        switch (formatterID) {

            case MoneyFormatter.ID:
                return new MoneyFormatter();

            case TourneyFormatter.ID:
                return new TourneyFormatter();

        }

        throw new Error(`Unknown formatter ID ${formatterID}`);

    }

}