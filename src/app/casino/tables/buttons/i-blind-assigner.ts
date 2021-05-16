import { Seat } from '../seat';

export interface IBlindAssigner {

    assignButton(availableSeats: Seat[]): number;

    assignBigBlind(availableSeats: Seat[]): number;

}