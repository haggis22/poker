import { CardUI } from '../cards/card-ui';

class HandPositionCalculator {

    public calculateHoldingTop(cardIndex: number, numTotalCards: number): number {

        return 5;

    }

    public calculateHoldingLeft(cardIndex: number, numTotalCards: number): number {

        switch (numTotalCards) {

            case 2:
                return 50 + (cardIndex * 50);

            case 4:
                return 35 + (cardIndex * 25);

        }

        return 38 - ((numTotalCards - 1) * 8) + (cardIndex * (100 / (numTotalCards + 1)));

    }

}

export const handPositionCalculator = new HandPositionCalculator();