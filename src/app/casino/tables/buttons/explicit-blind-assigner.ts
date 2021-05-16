import { IBlindAssigner } from './i-blind-assigner';
import { Seat } from '../seat';

export class ExplicitBlindAssigner implements IBlindAssigner {

    private buttonIndex: number;
    private bigBlindIndex: number;

    constructor(buttonIndex: number, bigBlindIndex: number) {
        this.buttonIndex = buttonIndex;
        this.bigBlindIndex = bigBlindIndex;
    }



    assignButton(availableSeats: Seat[]): number {
        return this.buttonIndex;
    }

    assignBigBlind(availableSeats: Seat[]): number {
        return this.bigBlindIndex;
    }

}

