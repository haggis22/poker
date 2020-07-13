import { Card } from "../../cards/card";
import { CardValue } from "../../cards/card-value";

export class HandEvaluation {

    public static readonly RANK =
        {
            HIGH_CARD: 0,
            PAIR: 1,
            TWO_PAIR: 2,
            THREE_OF_A_KIND: 3,
            STRAIGHT: 4,
            FLUSH: 5,
            FULL_HOUSE: 6,
            FOUR_OF_A_KIND: 7,
            STRAIGHT_FLUSH: 8
        };


    public rank: number;
    public values: Array<CardValue>;

    constructor(rank: number, values: Array<CardValue>) {
        this.rank = rank;
        this.values = values;
    }

    public compareTo(h2: HandEvaluation): number {

        if (this.rank > h2.rank) {

            return 1;

        }
        else if (this.rank < h2.rank) {

            return -1;

        }

        for (let v = 0; v < this.values.length; v++) {

            if (this.values[v].value > h2.values[v].value) {
                return 1;
            }
            else if (this.values[v].value < h2.values[v].value) {
                return -1;
            }

        }

        return 0;

    }

}