import { Board } from "./boards/board";

import { TableState } from "./states/table-state";
import { OpenState } from "./states/open-state";
import { Seat } from "./seat";
import { TableRules } from "./table-rules";
import { BetStatus } from "./betting/bet-status";
import { Limits } from './betting/limits';
import { Stakes } from "./betting/stakes";
import { Game } from "../../games/game";
import { Card } from '@/app/cards/card';
import { FacedownCard } from '@/app/cards/face-down-card';


export class Table {

    public id: number;
    public name: string;
    public description: string;

    public limits: Limits;
    public stakes: Stakes;
    public rules: TableRules;
    public state: TableState;

    public seats: Array<Seat>;

    public board: Board;

    public betStatus: BetStatus;

    // tracks which seat has the button so that we know where to deal the next card
    public buttonIndex: number;


    constructor(id: number, name: string, description: string, limits: Limits, stakes: Stakes, rules: TableRules) {

        this.id = id;
        this.name = name;
        this.description = description;

        this.limits = limits;
        this.stakes = stakes;
        this.rules = rules;

        this.seats = new Array<Seat>();

        for (let s = 0; s < rules.numSeats; s++) {
            this.seats.push(new Seat(s));
        }

        // Button is not yet assigned
        this.buttonIndex = null;

        this.betStatus = new BetStatus();

        this.state = new OpenState();

    }


    // Finds the next seat that meets the given criteria
    public findNextSeat(startIndex: number, seatCriteria: (seat: Seat) => boolean): number {

        // Establish the true startIndex outside of the loop so that we can recognize it when we come back around
        if (startIndex >= this.seats.length) {
            startIndex = 0;
        }

        let seatIndex: number = startIndex;

        while (true) {

            if (seatCriteria(this.seats[seatIndex])) {

                return seatIndex;

            }

            seatIndex++;

            if (seatIndex >= this.seats.length) {
                seatIndex = 0;
            }

            // We went all the way around and found nothing
            if (seatIndex === startIndex) {
                return null;
            }

        }

    }


    // Finds the immediately preceding seat that meets the given criteria
    public findPreviousSeat(startIndex: number, seatCriteria: (seat: Seat) => boolean): number {

        // Establish the true startIndex outside of the loop so that we can recognize it when we come back around
        if (startIndex < 0) {
            startIndex = this.seats.length - 1;
        }

        let seatIndex: number = startIndex;

        while (true) {

            if (seatCriteria(this.seats[seatIndex])) {

                return seatIndex;

            }

            seatIndex--;

            if (seatIndex < 0) {
                seatIndex = this.seats.length - 1;
            }

            // We went all the way around and found nothing
            if (seatIndex === startIndex) {
                return null;
            }

        }

    }


    public findNextActiveSeatIndex(startIndex: number): number {

        return this.findNextSeat(startIndex, (seat) => seat.isInHand);

    }


}