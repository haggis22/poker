import { IBlindAssigner } from './i-blind-assigner';
import { Seat } from '../seat';

export class RandomBlindAssigner implements IBlindAssigner {

    assignButton(availableSeats: Seat[]): number {
        return availableSeats[Math.floor(Math.random() * availableSeats.length)].index;
    }

    assignBigBlind(availableSeats: Seat[]): number {
        return availableSeats[Math.floor(Math.random() * availableSeats.length)].index;
    }

}

